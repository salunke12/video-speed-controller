const PRESETS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
const STEP = 0.05;

const presetsEl = document.getElementById("presets");
const currentEl = document.getElementById("current");
const statusEl = document.getElementById("status");

const fmt = (n) => (Math.round(n * 100) / 100).toString();

PRESETS.forEach((p) => {
  const b = document.createElement("button");
  b.textContent = fmt(p) + "x";
  b.dataset.speed = p;
  b.addEventListener("click", () => send({ type: "SET_SPEED", value: p }));
  presetsEl.appendChild(b);
});

document.getElementById("dec").addEventListener("click", () =>
  send({ type: "STEP", delta: -STEP })
);
document.getElementById("inc").addEventListener("click", () =>
  send({ type: "STEP", delta: STEP })
);

function render(speed) {
  currentEl.textContent = speed.toFixed(2) + "x";
  presetsEl.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", Math.abs(Number(b.dataset.speed) - speed) < 0.001);
  });
  statusEl.textContent = "";
}

async function send(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // Sent to all frames in the tab; only frames containing a video reply.
    const res = await chrome.tabs.sendMessage(tab.id, message);
    if (res && typeof res.speed === "number") {
      render(res.speed);
    } else {
      statusEl.textContent = "No video found on this page.";
    }
  } catch (_) {
    statusEl.textContent = "No video found (or page not supported).";
  }
}

send({ type: "GET_SPEED" });
