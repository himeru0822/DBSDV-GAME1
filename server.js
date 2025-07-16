const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  socket.on('cardMoved', (data) => {
    // 他のクライアントにカード移動を通知
    socket.broadcast.emit('cardMoved', data);
  });

  socket.on('disconnect', () => {
    console.log('ユーザー切断:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('サーバー起動: http://localhost:3000');
});
