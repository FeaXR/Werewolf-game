// Saved setups: named sets of roles, status effects and deal counts, kept
// on this device (not in the game or share links). They can be exported to
// a file and imported on another device or by another moderator.

const SETUPS_KEY = "werewolf-setups";

// Built in, always listed first, can't be deleted.
const DEFAULT_SETUP = (() => {
  const { roles, effects, deal } = normalize({ players: [] });
  return { name: "Default", builtIn: true, roles, effects, deal };
})();

// Validates a setup from storage or an imported file; null if unusable.
function normalizeSetup(raw) {
  const name = String(raw?.name ?? "").trim().slice(0, 60);
  if (!name || !Array.isArray(raw?.roles)) return null;
  const { roles, effects, deal } = normalize({
    roles: raw.roles,
    effects: raw.effects,
    deal: raw.deal,
    players: [],
  });
  return { name, roles, effects, deal };
}

function loadSetups() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETUPS_KEY));
    return Array.isArray(raw) ? raw.map(normalizeSetup).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveSetups(setups) {
  try {
    localStorage.setItem(SETUPS_KEY, JSON.stringify(setups));
  } catch {
    toast("Couldn't save setups (storage unavailable)");
  }
  renderSetups();
}

function describeSetup(setup) {
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return `${plural(setup.roles.length, "role")} · ${plural(
    setup.effects.length,
    "effect"
  )}`;
}

function renderSetups() {
  const setups = [DEFAULT_SETUP, ...loadSetups()];
  $("setupCount").textContent = setups.length;
  $("setupList").replaceChildren(
    ...setups.map((setup, index) =>
      el("li", { className: "setup" }, [
        el("div", { className: "setup-info" }, [
          el("strong", { textContent: setup.name }),
          el("span", { className: "setup-meta", textContent: describeSetup(setup) }),
        ]),
        el("button", {
          type: "button",
          className: "btn small",
          textContent: "Load",
          title: `Use the roles, effects and deal counts from "${setup.name}"`,
          dataset: { action: "load", index },
        }),
        !setup.builtIn &&
          el("button", {
            type: "button",
            className: "chip-remove",
            textContent: "×",
            title: `Delete "${setup.name}"`,
            "aria-label": `Delete ${setup.name}`,
            dataset: { action: "delete", index },
          }),
      ])
    )
  );
}

function currentSetup(name) {
  return {
    name,
    roles: [...state.roles],
    effects: state.effects.map((e) => ({ ...e })),
    deal: JSON.parse(JSON.stringify(state.deal)),
  };
}

function loadSetup(setup) {
  snapshot();
  // normalize() clears player roles/effects that the setup doesn't have.
  state = normalize({
    ...state,
    roles: setup.roles,
    effects: setup.effects,
    deal: setup.deal,
  });
  commit();
  toast(`Loaded "${setup.name}"`, true);
}

$("setupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const setups = loadSetups();
  const name =
    $("setupName").value.trim().slice(0, 60) || `Setup ${setups.length + 1}`;
  if (sameText(name, DEFAULT_SETUP.name)) {
    toast(`"${DEFAULT_SETUP.name}" is built in; pick another name`);
    return;
  }
  const existing = setups.findIndex((s) => sameText(s.name, name));
  if (existing >= 0) setups[existing] = currentSetup(name);
  else setups.push(currentSetup(name));
  saveSetups(setups);
  $("setupName").value = "";
  toast(existing >= 0 ? `Updated "${name}"` : `Saved "${name}"`);
});

$("setupList").addEventListener("click", (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  const all = [DEFAULT_SETUP, ...loadSetups()];
  const setup = all[index];

  if (button.dataset.action === "load") loadSetup(setup);
  else {
    const before = loadSetups();
    saveSetups(before.filter((s) => s.name !== setup.name));
    toast(`Deleted "${setup.name}"`, () => saveSetups(before));
  }
});

$("exportSetups").addEventListener("click", () => {
  const setups = loadSetups();
  if (!setups.length) {
    toast("Save a setup first; there's nothing to export yet");
    return;
  }
  const file = new Blob(
    [JSON.stringify({ app: "werewolf", version: 1, setups }, null, 2)],
    { type: "application/json" }
  );
  const link = el("a", {
    href: URL.createObjectURL(file),
    download: "werewolf-setups.json",
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

$("importSetups").addEventListener("click", () => $("importFile").click());

$("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = ""; // allow importing the same file again
  if (!file) return;
  let incoming;
  try {
    const data = JSON.parse(await file.text());
    // Accept an export file, a plain list, or a single setup.
    const list = Array.isArray(data) ? data : data?.setups ?? [data];
    incoming = list
      .map(normalizeSetup)
      .filter((s) => s && !sameText(s.name, DEFAULT_SETUP.name));
  } catch {
    incoming = [];
  }
  if (!incoming.length) {
    toast("No setups found in that file");
    return;
  }
  const before = loadSetups();
  // Same name replaces the existing setup.
  const merged = before.filter(
    (s) => !incoming.some((n) => sameText(n.name, s.name))
  );
  saveSetups([...merged, ...incoming]);
  toast(
    `Imported ${incoming.length} setup${incoming.length === 1 ? "" : "s"}`,
    () => saveSetups(before)
  );
});

renderSetups();
