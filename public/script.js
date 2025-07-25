const socket = io();

// プレイヤー名を取得して保存
const playerName = prompt("あなたの名前を入力してください");
localStorage.setItem("playerName", playerName);

// 自動マッチングをサーバーに送信
socket.emit('auto-match', { playerName });

// マッチング成立時にゲーム画面へ遷移
socket.on('match-found', ({ roomId, players }) => {
    localStorage.setItem("roomId", roomId);
  localStorage.setItem("player1", players[0]);
  localStorage.setItem("player2", players[1]);
  window.location.href = "game.html";
});

// カード移動処理（ゲーム画面用）
const roomId = localStorage.getItem("roomId") || "default-room";
const card = document.getElementById('card1');
const battleZone = document.getElementById('battleZone');

card.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', card.id);
});

battleZone.addEventListener('dragover', (e) => {
  e.preventDefault();
});

battleZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const cardId = e.dataTransfer.getData('text/plain');
  const card = document.getElementById(cardId);
  battleZone.appendChild(card);
  battleZone.innerText = `${card.innerText} が攻撃！`;

  socket.emit('cardMoved', { roomId, cardId });
});

socket.on('cardMoved', (data) => {
  const card = document.getElementById(data.cardId);
  battleZone.appendChild(card);
  battleZone.innerText = `${card.innerText} が攻撃！（相手）`;
});
