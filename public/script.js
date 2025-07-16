
const socket = io();

// プレイヤー名を入力して保存
const playerName = prompt("あなたの名前を入力してください");
localStorage.setItem("playerName", playerName);

// ルームIDを入力
const roomId = prompt("ルームIDを入力してください"); // 例: "room123"

// ルームに参加（プレイヤー名付き）
socket.emit('join-room', { roomId, playerName });

// カードとバトルゾーンの取得
const card = document.getElementById('card1');
const battleZone = document.getElementById('battleZone');

// カードのドラッグ開始
card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', card.id);
});

// バトルゾーン上でのドラッグオーバー
battleZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

// バトルゾーンへのドロップ処理
battleZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const card = document.getElementById(cardId);
    battleZone.appendChild(card);
    battleZone.innerText = `${card.innerText} が攻撃！`;

    socket.emit('cardMoved', { roomId, cardId });
});

// 他プレイヤーのカード移動を受信
socket.on('cardMoved', (data) => {
    const card = document.getElementById(data.cardId);
    battleZone.appendChild(card);
    battleZone.innerText = `${card.innerText} が攻撃！（相手）`;
});

// ゲーム開始時に両プレイヤー名を保存して画面遷移
socket.on('start-game', ({ roomId, players }) => {
    localStorage.setItem("player1", players[0]);
    localStorage.setItem("player2", players[1]);
    window.location.href = "game.html";
});

// 自動マッチング時の処理（プレイヤー名付き）
socket.emit('auto-match', { playerName });

// 自動マッチング成立時に両プレイヤー名を保存して画面遷移
socket.on('match-found', ({ roomId, players }) => {
    localStorage.setItem("player1", players[0]);
    localStorage.setItem("player2", players[1]);
    window.location.href = "game.html";
});
