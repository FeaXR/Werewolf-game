// Game data: defaults, loading from a share link or localStorage, and saving.
//
// One object holds the whole game; everything is rendered from it.
// state = { turn, roles, effects, players }
// player = { name, role, dead, effects: [effect names], notes }

const STORAGE_KEY = "werewolf-game";
const PREFS_KEY = "werewolf-prefs";

const DEFAULT_ROLES = [
  "Werewolf",
  "Villager",
  "Seer",
  "Bodyguard",
  "Chupakabra",
  "Vacuum salesman",
  "Spellcaster",
];
// duration: "game" lasts until the game ends, "turn" is cleared by Next turn.
const DEFAULT_EFFECTS = [
  { name: "Has Vacuum", duration: "game" },
  { name: "Protected", duration: "turn" },
  { name: "Muted", duration: "turn" },
];

function newPlayer(name = "") {
  return { name, role: "", dead: false, effects: [], notes: "" };
}

function normalize(raw) {
  const roles = Array.isArray(raw?.roles)
    ? raw.roles.map(String)
    : [...DEFAULT_ROLES];
  const effects = Array.isArray(raw?.effects)
    ? raw.effects.map((e) => ({
        name: String(e?.name ?? ""),
        duration: e?.duration === "game" ? "game" : "turn",
      })).filter((e) => e.name)
    : DEFAULT_EFFECTS.map((e) => ({ ...e }));
  const effectNames = effects.map((e) => e.name);
  const players = Array.isArray(raw?.players)
    ? raw.players.map((p) => ({
        name: String(p?.name ?? ""),
        role: roles.includes(p?.role) ? p.role : "",
        dead: !!p?.dead,
        effects: Array.isArray(p?.effects)
          ? p.effects.filter((e) => effectNames.includes(e))
          : [],
        notes: String(p?.notes ?? ""),
      }))
    : [newPlayer()];
  const turn = Math.max(1, parseInt(raw?.turn, 10) || 1);
  return { turn, roles, effects, players };
}

function loadState() {
  const params = new URLSearchParams(location.search);
  try {
    if (params.has("game")) {
      const fromUrl = JSON.parse(params.get("game"));
      // Drop the params so a refresh doesn't overwrite later edits.
      history.replaceState(null, "", location.pathname);
      return normalize(fromUrl);
    }
  } catch (err) {
    console.warn("Could not read game from link", err);
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return normalize(JSON.parse(stored));
  } catch (err) {
    console.warn("Could not read saved game", err);
  }

  return normalize(null);
}

let state = loadState();

// Per-device preferences (not part of the game or share links).
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

function setPref(key, value) {
  try {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ ...loadPrefs(), [key]: value })
    );
  } catch {}
}

let saveTimer;
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("saveStatus").textContent = "Saved";
  } catch {
    $("saveStatus").textContent = "Not saved (storage unavailable)";
  }
  $("saveStatus").classList.add("flash");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(
    () => $("saveStatus").classList.remove("flash"),
    600
  );
}

function commit() {
  save();
  render();
}
