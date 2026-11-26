(() => {
  if (window.__videoSpeedControllerLoaded) return;
  window.__videoSpeedControllerLoaded = true;

  const STEP = 0.05;
  const MIN_SPEED = 0.1;
  const MAX_SPEED = 16;
  const STORAGE_KEY = "videoSpeed";

  let speed = 1;

  const round2 = (v) => Math.round(v * 100) / 100;
  const clamp = (v) => Math.min(MAX_SPEED, Math.max(MIN_SPEED, round2(v)));

  // ---------- Video discovery ----------
  function findVideos(root = document, out = []) {
    root.querySelectorAll("video").forEach((v) => out.push(v));
    root.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) findVideos(el.shadowRoot, out);
    });
    return out;
  }

  function area(v) {
    const r = v.getBoundingClientRect();
    return r.width * r.height;
  }

  // Prefer a video that is currently playing; otherwise the largest one.
  function primaryVideo(videos = findVideos()) {
    if (!videos.length) return null;
    const bySize = [...videos].sort((a, b) => area(b) - area(a));
    const playing = bySize.find((v) => !v.paused && !v.ended && v.readyState > 2);
    return playing || bySize[0];
  }

  // ---------- Overlay (small toast showing the speed) ----------
  let host = null;
  let label = null;
  let hideTimer = null;

  function showOverlay(text) {
    if (!host) {
      host = document.createElement("div");
      host.style.cssText =
        "all:initial;position:fixed;top:14px;left:14px;z-index:2147483647;pointer-events:none;";
      const shadow = host.attachShadow({ mode: "closed" });
      label = document.createElement("div");
      label.style.cssText =
        "font:600 15px/1 system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.75);" +
        "padding:8px 12px;border-radius:8px;opacity:0;transition:opacity .2s;";
      shadow.appendChild(label);
    }
    const fs = document.fullscreenElement;
    const parent = fs && fs.tagName !== "VIDEO" ? fs : document.documentElement;
    if (host.parentNode !== parent) parent.appendChild(host);

    label.textContent = text;
    label.style.opacity = "1";
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => (label.style.opacity = "0"), 1000);
  }

  // ---------- Core speed logic ----------
  function applyToVideos(videos) {
    videos.forEach((v) => {
      try {
        v.playbackRate = speed;
      } catch (_) {}
    });
  }

  function setSpeed(value, { overlay = true } = {}) {
    speed = clamp(value);
    const videos = findVideos();
    applyToVideos(videos);
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: speed });
    } catch (_) {}
    if (overlay && videos.length) showOverlay(speed.toFixed(2) + "x");
  }

  function stepSpeed(delta) {
    const v = primaryVideo();
    const base = v ? v.playbackRate : speed;
    setSpeed(base + delta);
  }

  // ---------- Hotkeys: < and > ----------
  function isTyping(e) {
    const t = (e.composedPath && e.composedPath()[0]) || e.target;
    if (!t || !t.tagName) return false;
    const tag = t.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      t.isContentEditable
    );
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key !== "<" && e.key !== ">") return;
      if (isTyping(e)) return;
      if (!findVideos().length) return;

      // Override site shortcuts (e.g. YouTube's own Shift+< / Shift+>)
      e.preventDefault();
      e.stopImmediatePropagation();

      stepSpeed(e.key === ">" ? STEP : -STEP);
    },
    true
  );

  // ---------- Keep speed on new videos / new sources ----------
  // Media events don't bubble, but they can be captured at the document level.
  document.addEventListener(
    "loadedmetadata",
    (e) => {
      if (e.target instanceof HTMLVideoElement) {
        try {
          e.target.playbackRate = speed;
        } catch (_) {}
      }
    },
    true
  );

  // ---------- Messages from the popup ----------
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    const videos = findVideos();
    if (!videos.length) return; // let a frame that has a video answer

    if (msg.type === "SET_SPEED") {
      setSpeed(msg.value);
    } else if (msg.type === "STEP") {
      stepSpeed(msg.delta);
    }
    const v = primaryVideo(videos);
    sendResponse({ speed: v ? round2(v.playbackRate) : speed });
  });

  // ---------- Init ----------
  chrome.storage.local.get(STORAGE_KEY, (res) => {
    if (typeof res?.[STORAGE_KEY] === "number") speed = clamp(res[STORAGE_KEY]);
    applyToVideos(findVideos());
  });
})();
