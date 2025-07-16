const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

app.use(express.static('public'));

// ルーム一覧をメモリ上で管理
let rooms = [];

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('create-room', () => {
    const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
    rooms.push(roomId);
    socket.join(roomId);
    socket.emit('room-created', { roomId });
    io.emit('room-list', rooms);
  });

  socket.on('get-room-list', () => {
    socket.emit('room-list', rooms);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.emit('room-joined', { roomId });

    // ルーム内の人数を確認して2人揃ったらゲーム開始
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size === 2) {
      io.to(roomId).emit('start-game', { roomId });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});