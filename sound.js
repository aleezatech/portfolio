/* Small sound-effects library. It creates every sound with the browser's
   Web Audio API, so you do not need any audio files.
   Browsers only allow sound after the visitor clicks or taps the page,
   so nothing plays before the first interaction. */

const Sound = (() => {
  let ctx = null;
  let enabled = true;
  let lastHover = 0;

  try {
    enabled = localStorage.getItem("sound") !== "off";
  } catch (err) {
    // Storage can be blocked; sound still works for this visit
  }

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // One short musical note: frequency, length, wave shape, volume, delay, optional pitch slide
  function tone(freq, dur, type = "sine", vol = 0.06, delay = 0, slideTo = null) {
    if (!enabled) return;
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  // A burst of filtered noise: used for the sizzle sound
  function noise(dur = 0.6, vol = 0.05, cutoff = 3500) {
    if (!enabled) return;
    const c = getCtx();
    if (!c) return;
    const length = Math.floor(c.sampleRate * dur);
    const buffer = c.createBuffer(1, length, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = cutoff;
    const gain = c.createGain();
    const t = c.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
  }

  return {
    isOn: () => enabled,
    set(value) {
      enabled = value;
      try {
        localStorage.setItem("sound", value ? "on" : "off");
      } catch (err) {}
    },
    click()   { tone(540, 0.09, "triangle", 0.07, 0, 320); },
    hover()   {
      const now = Date.now();
      if (now - lastHover < 90) return; // do not repeat too fast
      lastHover = now;
      tone(900, 0.04, "sine", 0.018);
    },
    pop()     { tone(420, 0.1, "sine", 0.08, 0, 760); },
    add()     { tone(660, 0.08, "square", 0.035); tone(990, 0.14, "square", 0.035, 0.07); },
    remove()  { tone(320, 0.14, "sawtooth", 0.035, 0, 160); },
    success() {
      tone(523, 0.16, "sine", 0.07);
      tone(659, 0.16, "sine", 0.07, 0.12);
      tone(784, 0.28, "sine", 0.07, 0.24);
    },
    error()   { tone(220, 0.18, "square", 0.04); tone(180, 0.22, "square", 0.04, 0.14); },
    sizzle()  { noise(0.7, 0.04, 3800); },
    open()    { tone(330, 0.1, "sine", 0.06, 0, 520); },
    close()   { tone(520, 0.1, "sine", 0.06, 0, 330); }
  };
})();

/* Connects the sounds to any page: buttons click, interactive items tick on hover.
   Pass the sound toggle button so the visitor can mute everything. */
function setupSound(toggleBtn) {
  const hoverSelector = ".btn, .card, .tab, .chip, .seg, nav a, .menu-card, .deal, .icon-btn";

  function paint() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute("aria-pressed", String(Sound.isOn()));
    toggleBtn.textContent = Sound.isOn() ? "Sound on" : "Sound off";
  }
  paint();

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      Sound.set(!Sound.isOn());
      paint();
      Sound.pop();
    });
  }

  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(hoverSelector);
    if (el && !el.contains(e.relatedTarget)) Sound.hover();
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("a, button");
    if (!el || el === toggleBtn) return;
    if (el.dataset.sound === "none") return; // that element plays its own sound
    Sound.click();
  });
}
