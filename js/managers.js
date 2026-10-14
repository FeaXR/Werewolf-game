// Role and status effect managers.

// Roles are plain strings; effects are { name, duration } objects.
function setupManager(kind, form, input, listEl, durationSelect) {
  const items = () => (kind === "role" ? state.roles : state.effects);
  const nameOf = (item) => (kind === "role" ? item : item.name);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    if (items().some((x) => sameText(nameOf(x), value))) {
      toast(`"${value}" already exists`);
      input.select();
      return;
    }
    items().push(
      kind === "role"
        ? value
        : { name: value, duration: durationSelect.value }
    );
    input.value = "";
    commit();
  });

  listEl.addEventListener("click", (e) => {
    const toggle = e.target.closest(".chip-duration");
    if (toggle) {
      const effect = items()[Number(toggle.dataset.index)];
      effect.duration = effect.duration === "turn" ? "game" : "turn";
      commit();
      return;
    }

    const button = e.target.closest(".chip-remove");
    if (!button) return;
    const index = Number(button.dataset.index);
    const removed = nameOf(items()[index]);

    snapshot();
    items().splice(index, 1);
    // Clear the removed role/effect from any player using it.
    state.players.forEach((p) => {
      if (kind === "role" && p.role === removed) p.role = "";
      if (kind === "status")
        p.effects = p.effects.filter((x) => x !== removed);
    });
    if (kind === "role") {
      delete state.deal.counts[removed];
      if (state.deal.fill === removed) state.deal.fill = "";
    }
    commit();
    toast(`Removed "${removed}"`, true);
  });
}

setupManager("role", $("roleForm"), $("newRoleInput"), $("roleList"));
setupManager(
  "status",
  $("statusForm"),
  $("newStatusInput"),
  $("statusList"),
  $("newStatusDuration")
);
