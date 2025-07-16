const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    ${socket.id} がルーム ${roomId} に参加`);
    socket.to(roomId).emit('playerJoined', socket.id);
  });

  socket.on('cardMoved', ({ roomId, cardId }) => {
    socket.to(roomId).emit('cardMoved', { cardId });
  });

  socket.on('disconnect', () => {
    console.log('ユーザー切断:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
