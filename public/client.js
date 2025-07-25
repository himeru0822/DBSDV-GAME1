const modeMap = {
  room: 'room-mode.html',
  auto: 'auto-mode.html',
  practice: 'practice-mode.html' // 例：新モード追加
};

function selectMode(mode) {
  const target = modeMap[mode];
  if (target) {
    window.location.href = target;
  } else {
    alert('不正なモードが選択されました');
  }
}
