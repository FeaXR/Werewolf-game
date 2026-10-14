// Deal roles: pick how many of each role to hand out, shuffle them onto the
// players, then optionally pass the phone around so each player privately
// sees their own role.

function dealPlan() {
  const counts = state.deal.counts;
  const dealt = state.roles.reduce((sum, role) => sum + (counts[role] || 0), 0);
  const players = state.players.length;
  return { dealt, players, rest: players - dealt };
}

function renderDealDialog() {
  const { counts } = state.deal;

  $("dealCounts").replaceChildren(
    ...state.roles.map((role) =>
      el("li", { className: "deal-row" }, [
        el("span", { className: "deal-role", textContent: role }),
        el("button", {
          type: "button",
          className: "btn icon",
          textContent: "−",
          "aria-label": `One fewer ${role}`,
          disabled: !counts[role],
          dataset: { role, step: -1 },
        }),
        el("output", {
          className: "deal-count",
          textContent: counts[role] || 0,
          "aria-label": `${role} count`,
        }),
        el("button", {
          type: "button",
          className: "btn icon",
          textContent: "+",
          "aria-label": `One more ${role}`,
          dataset: { role, step: 1 },
        }),
      ])
    )
  );

  $("dealFill").replaceChildren(
    el("option", { value: "", textContent: "No role" }),
    ...state.roles.map((role) => el("option", { value: role, textContent: role }))
  );
  $("dealFill").value = state.deal.fill;

  const { dealt, players, rest } = dealPlan();
  let summary;
  if (!players) summary = "Add players first.";
  else if (rest < 0)
    summary = `${dealt} roles chosen but only ${players} players. Remove ${-rest}.`;
  else if (!rest) summary = `${dealt} roles for ${players} players.`;
  else
    summary = `${dealt} chosen + ${rest} ${
      state.deal.fill || "without a role"
    } = ${players} players.`;
  $("dealSummary").textContent = summary;
  $("dealSummary").classList.toggle("error", rest < 0 || !players);
  $("dealConfirm").disabled = rest < 0 || !players;
}

// Fisher–Yates shuffle with crypto randomness, so no one can predict it.
function shuffle(list) {
  const random = new Uint32Array(list.length);
  crypto.getRandomValues(random);
  for (let i = list.length - 1; i > 0; i--) {
    const j = random[i] % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function dealRoles() {
  const { rest } = dealPlan();
  const deck = state.roles.flatMap((role) =>
    Array(state.deal.counts[role] || 0).fill(role)
  );
  deck.push(...Array(rest).fill(state.deal.fill));
  shuffle(deck);

  snapshot();
  state.players.forEach((p, i) => (p.role = deck[i]));
  commit();
  toast(`Dealt roles to ${state.players.length} players`, true);
}

$("dealBtn").addEventListener("click", () => {
  renderDealDialog();
  $("dealDialog").showModal();
});

$("dealCounts").addEventListener("click", (e) => {
  const button = e.target.closest("button[data-step]");
  if (!button) return;
  const { role, step } = button.dataset;
  const n = Math.min(99, Math.max(0, (state.deal.counts[role] || 0) + Number(step)));
  if (n) state.deal.counts[role] = n;
  else delete state.deal.counts[role];
  save();
  renderDealDialog();
});

$("dealFill").addEventListener("change", (e) => {
  state.deal.fill = e.target.value;
  save();
  renderDealDialog();
});

$("dealConfirm").addEventListener("click", () => {
  dealRoles();
  $("dealDialog").close();
  if ($("dealReveal").checked) startReveal();
});

$("revealCurrentBtn").addEventListener("click", () => {
  $("dealDialog").close();
  startReveal();
});

$("dealCancel").addEventListener("click", () => $("dealDialog").close());

/* ------------------------------
   PASS THE PHONE
------------------------------ */
let reveal = { index: 0, shown: false };

function playerLabel(player, index) {
  return player.name.trim() || `Player ${index + 1}`;
}

function renderReveal() {
  const { index, shown } = reveal;
  const player = state.players[index];
  const last = index === state.players.length - 1;
  $("revealStep").textContent = `${index + 1} of ${state.players.length}`;
  $("revealName").textContent = shown
    ? playerLabel(player, index)
    : `Pass to ${playerLabel(player, index)}`;
  $("revealRole").textContent = player.role || "No role";
  $("revealRole").hidden = !shown;
  $("revealHint").textContent = shown
    ? "Remember your role, then hide it before passing the phone on."
    : "Only this player should look at the screen.";
  $("revealNext").textContent = !shown
    ? "Show my role"
    : last
    ? "Hide and finish"
    : "Hide and pass on";
}

function startReveal() {
  if (!state.players.length) return;
  reveal = { index: 0, shown: false };
  renderReveal();
  $("revealDialog").showModal();
}

$("revealNext").addEventListener("click", () => {
  if (!reveal.shown) reveal.shown = true;
  else if (reveal.index < state.players.length - 1)
    reveal = { index: reveal.index + 1, shown: false };
  else {
    $("revealDialog").close();
    toast("Everyone has seen their role");
    return;
  }
  renderReveal();
});

$("revealStop").addEventListener("click", () => $("revealDialog").close());
