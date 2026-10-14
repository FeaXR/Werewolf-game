// Start-up. Loaded last, after every other script.

const prefs = loadPrefs();
setRolesHidden(!!prefs.hidden);
if ("wakeLock" in navigator) setKeepAwake(!!prefs.awake, { quiet: true });
save();
render();
