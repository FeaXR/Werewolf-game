// Start-up. Loaded last, after every other script.

try {
  setRolesHidden(!!JSON.parse(localStorage.getItem(PREFS_KEY))?.hidden);
} catch {
  setRolesHidden(false);
}
save();
render();
