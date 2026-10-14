// Toolbar buttons: next turn, new game, share link, hide roles.

$("nextTurnBtn").addEventListener("click", () => {
  snapshot();
  const turnOnly = state.effects
    .filter((e) => e.duration === "turn")
    .map((e) => e.name);
  let cleared = 0;
  state.players.forEach((p) => {
    const kept = p.effects.filter((name) => !turnOnly.includes(name));
    cleared += p.effects.length - kept.length;
    p.effects = kept;
  });
  state.turn++;
  commit();
  toast(
    `Turn ${state.turn}` +
      (cleared ? `: cleared ${cleared} one-turn effect${cleared === 1 ? "" : "s"}` : ""),
    true
  );
});

$("resetBtn").addEventListener("click", () => {
  snapshot();
  state.players = state.players.map((p) => newPlayer(p.name));
  state.turn = 1;
  commit();
  toast("New game: roles, deaths and effects cleared", true);
});

$("shareBtn").addEventListener("click", async () => {
  const url =
    location.origin +
    location.pathname +
    "?game=" +
    encodeURIComponent(JSON.stringify(state));
  try {
    await navigator.clipboard.writeText(url);
    toast("Share link copied to clipboard");
  } catch {
    window.prompt("Copy this link:", url);
  }
});

function setRolesHidden(hidden) {
  document.body.classList.toggle("roles-hidden", hidden);
  $("hideRolesBtn").setAttribute("aria-pressed", hidden);
  $("hideRolesBtn").textContent = hidden ? "Show roles" : "Hide roles";
  setPref("hidden", hidden);
}

$("hideRolesBtn").addEventListener("click", () =>
  setRolesHidden(!document.body.classList.contains("roles-hidden"))
);
