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
let waitingPlayer = null;

io.on('connection', (socket) => {
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

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size === 2) {
      io.to(roomId).emit('start-game', { roomId });
    }
  });

  socket.on('auto-match', () => {
    if (waitingPlayer && waitingPlayer.connected) {
      const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
      socket.join(roomId);
      waitingPlayer.join(roomId);
      io.to(roomId).emit('match-found', { roomId });
      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
