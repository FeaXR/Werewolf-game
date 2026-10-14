// Installing as an app: registers the service worker for offline use and
// shows a one-time install hint. Chrome/Edge/Android offer a real install
// prompt; iPhone and iPad can't be prompted from a page, so they get
// "Share → Add to Home Screen" instructions instead.

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch((err) =>
    console.warn("Offline support unavailable", err)
  );
}

const isInstalled =
  matchMedia("(display-mode: standalone)").matches ||
  navigator.standalone === true;
const isIOS =
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

let installPrompt = null;

function showInstallHint(message, withButton) {
  if (isInstalled || loadPrefs().installHintDismissed) return;
  $("installHintText").textContent = message;
  $("installBtn").hidden = !withButton;
  $("installHint").hidden = false;
}

function hideInstallHint() {
  $("installHint").hidden = true;
  setPref("installHintDismissed", true);
}

$("installHintClose").addEventListener("click", hideInstallHint);

$("installBtn").addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  hideInstallHint();
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  showInstallHint("Install Werewolf as an app for full-screen, offline use.", true);
});

window.addEventListener("appinstalled", () => ($("installHint").hidden = true));

if (isIOS)
  showInstallHint(
    "Install as an app: tap Share, then “Add to Home Screen”.",
    false
  );
