// Start-up. Loaded last, after every other script.

// No pinch-zoom on phones. Safari on iPhone ignores user-scalable=no in the
// viewport tag, so cancel its pinch gesture directly (Safari-only events;
// other browsers never fire them).
document.addEventListener("gesturestart", (e) => e.preventDefault());

const prefs = loadPrefs();
setRolesHidden(!!prefs.hidden);
if ("wakeLock" in navigator) setKeepAwake(!!prefs.awake, { quiet: true });
save();
render();
