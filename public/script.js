const socket = io();

// プレイヤー名を取得
const playerName = prompt("あなたの名前を入力してください");
localStorage.setItem("playerName", playerName);

// ルーム作成ボタンの処理
document.getElementById("createRoomBtn").onclick = () => {
  socket.emit('create-room', { playerName });
};

// サーバーからルーム一覧を受け取って表示
socket.on('room-list', (rooms) => {
  const roomListElement = document.getElementById('roomList');
  roomListElement.innerHTML = '<h3>参加可能なルーム一覧</h3>';
  rooms.forEach(roomId => {
    const roomItem = document.createElement('div');
    roomItem.textContent = roomId;
    roomItem.style.cursor = 'pointer';
    roomItem.style.margin = '5px 0';
    roomItem.onclick = () => {
      socket.emit('join-room', { roomId, playerName });
    };
    roomListElement.appendChild(roomItem);
  });
});

// ページ読み込み時にルーム一覧を取得
socket.emit('get-room-list');

// マッチング成立時の処理
socket.on('match-found', ({ roomId, players }) => {
  localStorage.setItem("roomId", roomId);
  localStorage.setItem("player1", players[0]);
  localStorage.setItem("player2", players[1]);
  window.location.href = "game.html";
});
