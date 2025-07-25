
const socket = io();

document.getElementById("create-room").addEventListener("click", () => {
  const playerName = localStorage.getItem("playerName") || prompt("名前を入力してください");
  localStorage.setItem("playerName", playerName);
  socket.emit("create-room", { playerName });
});
