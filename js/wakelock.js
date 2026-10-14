// Keep screen on: holds a Screen Wake Lock so the phone doesn't dim or lock
// mid-game. The browser drops the lock whenever the tab is hidden, so it is
// requested again when the page becomes visible.

let wakeLock = null;
let wantAwake = false; // the user's choice; the lock itself may come and go

// The button shows whether the lock is actually held, not just requested.
function renderAwakeButton() {
  const on = !!wakeLock;
  $("awakeBtn").setAttribute("aria-pressed", on);
  $("awakeBtn").textContent = on ? "Screen stays on" : "Keep screen on";
}

async function requestWakeLock({ quiet = false } = {}) {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
      renderAwakeButton();
    });
  } catch (err) {
    console.warn("Wake lock refused", err);
    if (!quiet) {
      wantAwake = false;
      setPref("awake", false);
      toast("This browser wouldn't keep the screen on");
    }
  }
  renderAwakeButton();
}

function setKeepAwake(on, { quiet = false } = {}) {
  wantAwake = on;
  setPref("awake", on);
  renderAwakeButton();
  if (on && !wakeLock) requestWakeLock({ quiet });
  if (!on && wakeLock) wakeLock.release();
}

if ("wakeLock" in navigator) {
  $("awakeBtn").hidden = false;
  $("awakeBtn").addEventListener("click", () => setKeepAwake(!wantAwake));
  document.addEventListener("visibilitychange", () => {
    if (wantAwake && !wakeLock && document.visibilityState === "visible")
      requestWakeLock({ quiet: true });
  });
}
