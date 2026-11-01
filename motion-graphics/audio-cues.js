// ─────────────────────────────────────────────────────────────────────────────
// AURA ACADEMIA MOTION GRAPHICS — 120-SECOND WEB AUDIO SYNTHESIZER
// High-fidelity procedural audio cues matching generate-audio.mjs exactly
// ─────────────────────────────────────────────────────────────────────────────

window.AudioEngine = (function() {
  let ctx = null;
  let isMuted = false;
  let lastTriggeredT = -1;

  function init() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function playChime(freq = 1046.5, dur = 1.2, vol = 0.25) {
    if (isMuted || !ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

  function playClick(freq = 2000, dur = 0.05, vol = 0.3) {
    if (isMuted || !ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

  function playWhoosh(dur = 0.8, vol = 0.2) {
    if (isMuted || !ctx) return;
    try {
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + dur);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  function playSubBass(freq = 65, dur = 1.5, vol = 0.3) {
    if (isMuted || !ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

  // Audio cue timeline definition across 120.0s
  const CUES = [
    // S1
    { t: 0.5, fn: () => playChime(1318.5, 1.4, 0.28) },
    { t: 7.1, fn: () => playClick(1900, 0.05, 0.35) },
    { t: 8.8, fn: () => playWhoosh(0.7, 0.25) },
    // S2
    { t: 10.4, fn: () => playChime(523.25, 0.8, 0.22) },
    { t: 11.7, fn: () => playChime(659.25, 0.8, 0.22) },
    { t: 13.0, fn: () => playChime(783.99, 0.8, 0.22) },
    { t: 14.4, fn: () => playChime(987.77, 0.8, 0.22) },
    { t: 15.7, fn: () => playChime(1046.5, 0.8, 0.25) },
    { t: 19.8, fn: () => playWhoosh(0.7, 0.25) },
    // S3
    { t: 23.6, fn: () => playClick(2100, 0.05, 0.35) },
    { t: 25.8, fn: () => playClick(2200, 0.05, 0.3) },
    { t: 27.4, fn: () => playClick(2000, 0.05, 0.3) },
    { t: 28.8, fn: () => playClick(2300, 0.05, 0.3) },
    { t: 30.3, fn: () => playClick(2400, 0.05, 0.35) },
    { t: 32.8, fn: () => playWhoosh(0.7, 0.25) },
    // S4
    { t: 36.5, fn: () => playClick(2100, 0.05, 0.3) },
    { t: 40.5, fn: () => playClick(2000, 0.05, 0.3) },
    { t: 42.2, fn: () => playChime(1318.5, 1.0, 0.28) },
    { t: 45.8, fn: () => playWhoosh(0.7, 0.25) },
    // S5
    { t: 47.8, fn: () => playClick(2000, 0.05, 0.3) },
    { t: 50.8, fn: () => playClick(2100, 0.05, 0.3) },
    { t: 52.2, fn: () => playClick(2200, 0.05, 0.3) },
    { t: 53.6, fn: () => playClick(2400, 0.04, 0.25) },
    { t: 54.2, fn: () => playClick(2400, 0.04, 0.25) },
    { t: 54.8, fn: () => playClick(1800, 0.04, 0.3) },
    { t: 55.4, fn: () => playClick(2400, 0.04, 0.25) },
    { t: 56.0, fn: () => playClick(2400, 0.04, 0.25) },
    { t: 57.4, fn: () => { playClick(2100, 0.06, 0.4); playChime(1046.5, 1.2, 0.3); } },
    { t: 61.8, fn: () => playWhoosh(0.7, 0.25) },
    // S6
    { t: 63.2, fn: () => playChime(880, 0.8, 0.25) },
    { t: 65.3, fn: () => playClick(2200, 0.05, 0.3) },
    { t: 68.5, fn: () => playChime(1046.5, 1.0, 0.28) },
    { t: 72.4, fn: () => playSubBass(80, 0.6, 0.3) },
    { t: 73.8, fn: () => { playClick(2100, 0.05, 0.35); playChime(1318.5, 1.2, 0.3); } },
    { t: 77.8, fn: () => playWhoosh(0.7, 0.25) },
    // S7
    { t: 79.5, fn: () => playClick(2200, 0.04, 0.25) },
    { t: 83.2, fn: () => { playClick(2400, 0.05, 0.35); playSubBass(55, 1.2, 0.3); } },
    { t: 84.8, fn: () => playChime(659.25, 0.6, 0.2) },
    { t: 85.8, fn: () => playChime(783.99, 0.6, 0.2) },
    { t: 86.8, fn: () => playChime(987.77, 0.6, 0.2) },
    { t: 87.8, fn: () => { playClick(2100, 0.05, 0.3); playChime(1174.66, 0.8, 0.25); } },
    { t: 90.5, fn: () => playChime(1318.5, 1.2, 0.3) },
    { t: 95.8, fn: () => playWhoosh(0.7, 0.25) },
    // S8
    { t: 97.5, fn: () => playChime(523.25, 0.8, 0.2) },
    { t: 99.0, fn: () => playChime(659.25, 0.8, 0.2) },
    { t: 100.5, fn: () => playChime(783.99, 0.8, 0.2) },
    { t: 102.0, fn: () => playChime(987.77, 0.8, 0.2) },
    { t: 103.5, fn: () => playChime(1046.5, 0.8, 0.25) },
    { t: 107.8, fn: () => playWhoosh(0.7, 0.25) },
    // S9
    { t: 109.2, fn: () => playClick(2200, 0.05, 0.3) },
    { t: 111.8, fn: () => { playClick(2400, 0.05, 0.35); playChime(1318.5, 1.2, 0.3); } },
    { t: 115.8, fn: () => playWhoosh(0.7, 0.25) },
    // S10
    { t: 116.5, fn: () => playChime(1318.5, 2.5, 0.35) },
    { t: 117.0, fn: () => playSubBass(55, 3.0, 0.35) }
  ];

  function tick(t, isPlaying) {
    if (!isPlaying || isMuted || !ctx) return;
    if (lastTriggeredT < 0 || t < lastTriggeredT) {
      lastTriggeredT = t;
      return;
    }
    for (let c of CUES) {
      if (c.t >= lastTriggeredT && c.t < t) {
        c.fn();
      }
    }
    lastTriggeredT = t;
  }

  function setMuted(val) {
    isMuted = val;
  }

  return {
    init,
    tick,
    setMuted,
    playChime,
    playClick,
    playWhoosh,
    playSubBass
  };
})();
