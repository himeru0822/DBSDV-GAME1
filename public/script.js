const socket = io();
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

  // サーバーに通知
  socket.emit('cardMoved', { cardId });
});

// 他のプレイヤーからの通知を受け取る
socket.on('cardMoved', (data) => {
  const card = document.getElementById(data.cardId);
  battleZone.appendChild(card);
  battleZone.innerText = `${card.innerText} が攻撃！（相手）`;
});
