require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

// ===== MongoDB接続 =====
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB接続成功"))
.catch(err => console.error("❌ MongoDB接続エラー:", err));

// ===== 新規登録API =====
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send("そのユーザー名はすでに使われています");

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, passwordHash: hash, wins: 0, losses: 0 });

    res.status(201).send("ユーザー登録が成功しました");
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(500).send("サーバーエラー");
  }
});

// ===== ログインAPI =====
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("ユーザーが存在しません");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (match) {
      res.send("ログイン成功");
    } else {
      res.status(401).send("パスワードが違います");
    }
  } catch (err) {
    console.error("ログインエラー:", err);
    res.status(500).send("サーバーエラー");
  }
});

// ===== ゲームロジック（Socket.IO） =====
let rooms = [];
let waitingPlayers = [];
let players = {}; // socket.id → プレイヤー情報

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('register-player', ({ username, userId }) => {
    players[socket.id] = { username, userId, roomId: null };
  });

  socket.on('create-room', () => {
    const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
    rooms.push(roomId);
    socket.join(roomId);

    if (players[socket.id]) {
      players[socket.id].roomId = roomId;
    }

    socket.emit('room-created', { roomId });
    io.emit('room-list', rooms);
  });

  socket.on('get-room-list', () => {
    socket.emit('room-list', rooms);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    if (players[socket.id]) {
      players[socket.id].roomId = roomId;
    }

    socket.emit('room-joined', {
      roomId,
      player: players[socket.id]
    });

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size === 2) {
      const memberIds = [...room];
      const memberInfo = memberIds.map(id => players[id]).filter(Boolean);

      io.to(roomId).emit('start-game', {
        roomId,
        players: memberInfo
      });
    }
  });

  socket.on('auto-match', () => {
    waitingPlayers.push(socket);

    if (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();

      const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
      player1.join(roomId);
      player2.join(roomId);

      [player1, player2].forEach(playerSocket => {
        if (players[playerSocket.id]) {
          players[playerSocket.id].roomId = roomId;
        }
      });

      const info1 = players[player1.id];
      const info2 = players[player2.id];

      io.to(roomId).emit('match-found', {
        roomId,
        players: [info1, info2]
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);

    const player = players[socket.id];
    if (player && player.roomId) {
      const room = io.sockets.adapter.rooms.get(player.roomId);
      if (room && room.size <= 1) {
        rooms = rooms.filter(r => r !== player.roomId);
        io.emit('room-list', rooms);
      }
    }

    waitingPlayers = waitingPlayers.filter(s => s.id !== socket.id);
    delete players[socket.id];
  });
});

// ===== ポート起動 =====
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});