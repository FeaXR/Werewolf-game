// Reordering players by dragging the number handle (mouse or touch) or
// with the arrow keys while the handle is focused.

function movePlayer(from, to) {
  if (to < 0 || to >= state.players.length || from === to) return;
  const [player] = state.players.splice(from, 1);
  state.players.splice(to, 0, player);
  commit();
}

function focusHandle(index) {
  playerList
    .querySelector(`li[data-index="${index}"] .handle`)
    ?.focus();
}

playerList.addEventListener("keydown", (e) => {
  if (!e.target.matches(".handle")) return;
  const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const index = playerIndex(e.target);
  movePlayer(index, index + step);
  focusHandle(Math.max(0, Math.min(state.players.length - 1, index + step)));
});

// While dragging, the row itself moves through the list; the new order is
// saved when the pointer is released. Listeners sit on the document because
// moving the row in the DOM would drop pointer capture on the handle.
let drag = null;

playerList.addEventListener("pointerdown", (e) => {
  const handle = e.target.closest(".handle");
  if (!handle || e.button !== 0) return;
  e.preventDefault();
  const row = handle.closest("li.player");
  drag = { row, from: playerIndex(row) };
  row.classList.add("dragging");
  document.body.classList.add("is-dragging");
});

document.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const before = [...playerList.children].find((row) => {
    if (row === drag.row) return false;
    const box = row.getBoundingClientRect();
    return e.clientY < box.top + box.height / 2;
  });
  if (before !== drag.row.nextElementSibling)
    playerList.insertBefore(drag.row, before || null);

  // Scroll when dragging near the top or bottom of the screen.
  const edge = 48;
  if (e.clientY < edge) scrollBy(0, -12);
  else if (e.clientY > innerHeight - edge) scrollBy(0, 12);
});

function endDrag() {
  if (!drag) return;
  const { row, from } = drag;
  drag = null;
  row.classList.remove("dragging");
  document.body.classList.remove("is-dragging");
  const to = [...playerList.children].indexOf(row);
  movePlayer(from, to);
}

document.addEventListener("pointerup", endDrag);
document.addEventListener("pointercancel", endDrag);
