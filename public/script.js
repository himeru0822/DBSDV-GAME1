
document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const createRoomButton = document.getElementById("create-room");
  if (createRoomButton) {
    createRoomButton.addEventListener("click", () => {
      let playerName = localStorage.getItem("playerName");
      if (!playerName) {
        playerName = prompt("あなたの名前を入力してください");
        localStorage.setItem("playerName", playerName);
      }
      socket.emit("create-room", { playerName });
    });
  }
});
