// Draws the summary, player list and manager lists from `state`.

function render() {
  renderSummary();
  renderPlayers();
  renderList("role", state.roles, $("roleList"), $("roleCount"));
  renderList("status", state.effects, $("statusList"), $("statusCount"));
}

function renderSummary() {
  const total = state.players.length;
  const dead = state.players.filter((p) => p.dead).length;
  $("summary").replaceChildren(
    el("span", { className: "stat turn" }, [
      "Turn ",
      el("strong", { textContent: state.turn }),
    ]),
    el("span", { className: "stat" }, [
      el("strong", { textContent: total }),
      ` player${total === 1 ? "" : "s"}`,
    ]),
    el("span", { className: "stat alive" }, [
      el("strong", { textContent: total - dead }),
      " alive",
    ]),
    el("span", { className: "stat dead" }, [
      el("strong", { textContent: dead }),
      " dead",
    ])
  );

  // Roles still in play among living players.
  const counts = new Map();
  state.players
    .filter((p) => !p.dead)
    .forEach((p) => {
      const role = p.role || "Unassigned";
      counts.set(role, (counts.get(role) || 0) + 1);
    });
  $("tally").replaceChildren(
    ...[...counts].map(([role, n]) =>
      el("span", {
        className:
          "tally-item" + (role === "Unassigned" ? " muted" : ""),
        textContent: `${role} × ${n}`,
      })
    )
  );
}

function renderPlayers() {
  $("emptyState").hidden = state.players.length > 0;

  playerList.replaceChildren(
    ...state.players.map((player, index) => {
      const roleSelect = el(
        "select",
        {
          className: "role",
          "aria-label": `Role for player ${index + 1}`,
        },
        [
          el("option", { value: "", textContent: "Select role" }),
          ...state.roles.map((role) =>
            el("option", { value: role, textContent: role })
          ),
        ]
      );
      roleSelect.value = player.role;

      const effects = state.effects.map(({ name, duration }) =>
        el("button", {
          type: "button",
          className: `chip toggle lasts-${duration}`,
          textContent: name,
          title: duration === "turn" ? "Lasts one turn" : "Lasts the whole game",
          "aria-pressed": player.effects.includes(name),
          dataset: { action: "effect", effect: name },
        })
      );

      return el(
        "li",
        {
          className: "player" + (player.dead ? " is-dead" : ""),
          dataset: { index },
        },
        [
          el("span", {
            className: "player-number",
            textContent: index + 1,
          }),
          el("input", {
            type: "text",
            className: "name",
            value: player.name,
            placeholder: "Player name",
            "aria-label": `Name of player ${index + 1}`,
            autocomplete: "off",
          }),
          roleSelect,
          el("div", { className: "effects" }, effects),
          el("button", {
            type: "button",
            className: "btn life",
            textContent: player.dead ? "Dead" : "Alive",
            "aria-pressed": player.dead,
            title: player.dead ? "Revive player" : "Mark as dead",
            dataset: { action: "dead" },
          }),
          el("button", {
            type: "button",
            className: "btn icon remove",
            textContent: "×",
            title: "Remove player",
            "aria-label": `Remove player ${index + 1}`,
            dataset: { action: "remove" },
          }),
        ]
      );
    })
  );
}

function renderList(kind, items, listEl, countEl) {
  countEl.textContent = items.length;
  listEl.replaceChildren(
    ...items.map((entry, index) => {
      const item = kind === "role" ? entry : entry.name;
      return el("li", { className: "chip" }, [
        item,
        kind === "status" &&
          el("button", {
            type: "button",
            className: `chip-duration lasts-${entry.duration}`,
            textContent: entry.duration === "turn" ? "1 turn" : "game",
            title: `${item} lasts ${
              entry.duration === "turn" ? "one turn" : "the whole game"
            }. Click to change.`,
            dataset: { index },
          }),
        el("button", {
          type: "button",
          className: "chip-remove",
          textContent: "×",
          title: `Remove ${item}`,
          "aria-label": `Remove ${item}`,
          dataset: { kind, index },
        }),
      ]);
    })
  );
}
