// Day timer: a countdown for discussion time with presets, +30s, and a
// chime / vibration when it runs out. Time is measured against the clock
// (not by counting ticks) so it stays accurate when the tab is in the
// background and the browser slows down intervals.

const TIMER_PRESETS = [1, 2, 3, 5]; // minutes

const timer = {
  duration: (loadPrefs().timerMinutes || 2) * 60000,
  remaining: 0,
  endsAt: null, // set while running
  interval: null,
};
timer.remaining = timer.duration;

let audioCtx = null;

function timeLeft() {
  return timer.endsAt ? Math.max(0, timer.endsAt - Date.now()) : timer.remaining;
}

function formatTime(ms) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function renderTimer() {
  const left = timeLeft();
  const running = !!timer.endsAt;
  $("timerDisplay").textContent = formatTime(left);
  $("timerDisplay").classList.toggle("ending", running && left <= 10000);
  $("timerStart").textContent = running ? "Pause" : left === 0 ? "Restart" : "Start";

  // Show the time on the toolbar button while a countdown is in progress.
  const inProgress = running || (left > 0 && left < timer.duration);
  $("timerBtn").textContent = inProgress ? `Timer ${formatTime(left)}` : "Timer";

  $("timerPresets")
    .querySelectorAll("button")
    .forEach((b) =>
      b.setAttribute("aria-pressed", Number(b.dataset.minutes) * 60000 === timer.duration)
    );
}

function chime() {
  try {
    audioCtx ||= new AudioContext();
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const t = audioCtx.currentTime + offset;
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (err) {
    console.warn("Could not play the timer sound", err);
  }
}

function tick() {
  renderTimer();
  if (timer.endsAt && timeLeft() === 0) {
    stopTicking();
    timer.endsAt = null;
    timer.remaining = 0;
    renderTimer();
    chime();
    navigator.vibrate?.([200, 100, 200, 100, 400]);
    $("timerPanel").classList.add("done");
    toast("Time's up!");
  }
}

function stopTicking() {
  clearInterval(timer.interval);
  timer.interval = null;
}

function startTimer() {
  // Browsers only allow sound after a tap, so unlock audio now.
  try {
    audioCtx ||= new AudioContext();
    audioCtx.resume();
  } catch {}
  if (timeLeft() === 0) timer.remaining = timer.duration;
  $("timerPanel").classList.remove("done");
  timer.endsAt = Date.now() + timer.remaining;
  timer.interval = setInterval(tick, 250);
  renderTimer();
}

function pauseTimer() {
  timer.remaining = timeLeft();
  timer.endsAt = null;
  stopTicking();
  renderTimer();
}

function resetTimer() {
  pauseTimer();
  timer.remaining = timer.duration;
  $("timerPanel").classList.remove("done");
  renderTimer();
}

$("timerPresets").replaceChildren(
  ...TIMER_PRESETS.map((minutes) =>
    el("button", {
      type: "button",
      className: "chip toggle",
      textContent: `${minutes} min`,
      dataset: { minutes },
    })
  )
);

$("timerPresets").addEventListener("click", (e) => {
  const button = e.target.closest("button[data-minutes]");
  if (!button) return;
  timer.duration = Number(button.dataset.minutes) * 60000;
  setPref("timerMinutes", Number(button.dataset.minutes));
  resetTimer();
});

$("timerStart").addEventListener("click", () =>
  timer.endsAt ? pauseTimer() : startTimer()
);

$("timerAdd").addEventListener("click", () => {
  if (timer.endsAt) timer.endsAt += 30000;
  else timer.remaining += 30000;
  $("timerPanel").classList.remove("done");
  renderTimer();
});

$("timerReset").addEventListener("click", resetTimer);

$("timerBtn").addEventListener("click", () => {
  const open = $("timerPanel").hidden;
  $("timerPanel").hidden = !open;
  $("timerBtn").setAttribute("aria-expanded", open);
});

// Catch up immediately when returning to the tab.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") tick();
});

renderTimer();
