// DOM helpers and the undo toast.

const $ = (id) => document.getElementById(id);
const playerList = $("playerList");

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === "dataset") Object.assign(node.dataset, value);
    else if (key in node) node[key] = value;
    else node.setAttribute(key, value);
  });
  children.forEach((child) => child && node.append(child));
  return node;
}

function sameText(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

let undoSnapshot = null;
let undoAction = null;
let toastTimer;

// `undo` is true to offer restoring the last snapshot() of the game, or a
// function to run instead (for things outside the game, like setups).
function toast(message, undo = false) {
  undoAction = typeof undo === "function" ? undo : null;
  $("toastText").textContent = message;
  $("toastUndo").hidden = !undo;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $("toast").hidden = true;
    undoSnapshot = null;
    undoAction = null;
  }, 5000);
}

function snapshot() {
  undoSnapshot = JSON.stringify(state);
}

$("toastUndo").addEventListener("click", () => {
  $("toast").hidden = true;
  if (undoAction) {
    const action = undoAction;
    undoAction = null;
    action();
    return;
  }
  if (!undoSnapshot) return;
  state = JSON.parse(undoSnapshot);
  undoSnapshot = null;
  commit();
});
