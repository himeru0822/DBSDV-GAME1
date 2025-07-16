
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Server is running');
});

let rooms = [];
let waitingPlayers = [];

io.on('connection', (socket) => {
  socket.on('create-room', ({ playerName }) => {
    const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
    rooms.push(roomId);
    socket.join(roomId);
    socket.data.playerName = playerName;
    socket.emit('room-created', { roomId });
    io.emit('room-list', rooms);
  });

  socket.on('get-room-list', () => {
    socket.emit('room-list', rooms);
  });

  socket.on('join-room', ({ roomId, playerName }) => {
    socket.join(roomId);
    socket.data.playerName = playerName;
    socket.emit('room-joined', { roomId });

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size === 2) {
      const players = Array.from(room).map(id => {
        const s = io.sockets.sockets.get(id);
        return s?.data?.playerName || 'Unknown';
      });
      io.to(roomId).emit('start-game', { roomId, players });
    }
  });

  socket.on('auto-match', ({ playerName }) => {
    socket.data.playerName = playerName;
    waitingPlayers.push(socket);

    if (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();
      const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;

      player1.join(roomId);
      player2.join(roomId);

      const players = [player1.data.playerName || 'Player1', player2.data.playerName || 'Player2'];
      io.to(roomId).emit('match-found', { roomId, players });
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
