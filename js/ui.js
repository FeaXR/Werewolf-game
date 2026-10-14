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
let toastTimer;

function toast(message, undoable = false) {
  $("toastText").textContent = message;
  $("toastUndo").hidden = !undoable;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $("toast").hidden = true;
    undoSnapshot = null;
  }, 5000);
}

function snapshot() {
  undoSnapshot = JSON.stringify(state);
}

$("toastUndo").addEventListener("click", () => {
  if (!undoSnapshot) return;
  state = JSON.parse(undoSnapshot);
  undoSnapshot = null;
  $("toast").hidden = true;
  commit();
});
