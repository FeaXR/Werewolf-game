// Player list: adding, editing, toggling effects, notes, removing.

function addPlayer({ focus = true } = {}) {
  state.players.push(newPlayer());
  commit();
  if (focus) focusName(state.players.length - 1);
}

function focusName(index) {
  playerList
    .querySelector(`li[data-index="${index}"] .name`)
    ?.focus();
}

function playerIndex(target) {
  return Number(target.closest("li.player")?.dataset.index);
}

// Typing updates the data without re-rendering so focus is kept.
playerList.addEventListener("input", (e) => {
  const player = state.players[playerIndex(e.target)];
  if (e.target.matches(".name")) player.name = e.target.value;
  else if (e.target.matches(".notes")) {
    player.notes = e.target.value;
    const toggle = e.target.closest("li").querySelector(".notes-toggle");
    toggle.classList.toggle("has-notes", !!player.notes);
  } else return;
  save();
});

playerList.addEventListener("change", (e) => {
  if (!e.target.matches(".role")) return;
  state.players[playerIndex(e.target)].role = e.target.value;
  save();
  renderSummary();
});

// Enter in a name field jumps to the next player (or adds one).
playerList.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || !e.target.matches(".name")) return;
  e.preventDefault();
  const index = playerIndex(e.target);
  if (index === state.players.length - 1) addPlayer();
  else focusName(index + 1);
});

playerList.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;
  const index = playerIndex(button);
  const player = state.players[index];

  switch (button.dataset.action) {
    case "dead":
      player.dead = !player.dead;
      break;
    case "effect": {
      const effect = button.dataset.effect;
      player.effects = player.effects.includes(effect)
        ? player.effects.filter((x) => x !== effect)
        : [...player.effects, effect];
      break;
    }
    case "notes":
      // Close an empty box; a box with text stays open and gets focus.
      if (openNotes.has(player) && !player.notes) openNotes.delete(player);
      else openNotes.add(player);
      commit();
      playerList
        .querySelector(`li[data-index="${index}"] .notes`)
        ?.focus();
      return;
    case "remove":
      snapshot();
      state.players.splice(index, 1);
      toast(`Removed ${player.name || `player ${index + 1}`}`, true);
      break;
  }
  commit();
});

$("addPlayerBtn").addEventListener("click", () => addPlayer());
