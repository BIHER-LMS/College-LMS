// ─────────────────────────────────────────────────────────────────────────────
// AURA ACADEMIA MOTION GRAPHICS — MASTER SOUNDTRACK SYNTHESIZER (120.0s)
// Generates a pristine 120.0s, 44.1kHz, 16-bit stereo PCM WAV soundtrack
// with microsecond synchronization to every visual cue in the 10-scene film
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;
const DURATION = 120.0; // Exactly 120 Seconds
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);

// Stereo sample buffers
const leftChannel = new Float32Array(TOTAL_SAMPLES);
const rightChannel = new Float32Array(TOTAL_SAMPLES);

// Seeded pseudorandom generator for deterministic reproducible audio
let seed = 12345;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNTHESIS PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Add a pitched sine pulse with exponential decay and pitch envelope */
function addSinePulse(startTime, duration, startFreq, endFreq, gain, pan = 0) {
  const startIdx = Math.floor(startTime * SAMPLE_RATE);
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  let phase = 0;

  for (let i = 0; i < numSamples; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;

    const progress = i / numSamples;
    const freq = startFreq * Math.pow(endFreq / startFreq, progress);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;

    const attack = Math.min(1, i / (SAMPLE_RATE * 0.003));
    const envelope = attack * Math.exp(-progress * 5.5) * gain;
    const sample = Math.sin(phase) * envelope;

    const leftGain = Math.cos((pan + 1) * Math.PI / 4);
    const rightGain = Math.sin((pan + 1) * Math.PI / 4);

    leftChannel[idx] += sample * leftGain;
    rightChannel[idx] += sample * rightGain;
  }
}

/** Add a pure crystalline bell chime with harmonic overtones */
function addChime(startTime, duration, fundamental, gain = 0.25, pan = 0) {
  const startIdx = Math.floor(startTime * SAMPLE_RATE);
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  let phase1 = 0, phase2 = 0, phase3 = 0;

  for (let i = 0; i < numSamples; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;

    const progress = i / numSamples;
    phase1 += (2 * Math.PI * fundamental) / SAMPLE_RATE;
    phase2 += (2 * Math.PI * fundamental * 2.008) / SAMPLE_RATE;
    phase3 += (2 * Math.PI * fundamental * 3.018) / SAMPLE_RATE;

    const attack = Math.min(1, i / (SAMPLE_RATE * 0.002));
    const decay = Math.exp(-progress * 4.0);
    const s1 = Math.sin(phase1) * 0.65;
    const s2 = Math.sin(phase2) * 0.25;
    const s3 = Math.sin(phase3) * 0.10;

    const sample = attack * decay * (s1 + s2 + s3) * gain;
    const leftGain = Math.cos((pan + 1) * Math.PI / 4);
    const rightGain = Math.sin((pan + 1) * Math.PI / 4);

    leftChannel[idx] += sample * leftGain;
    rightChannel[idx] += sample * rightGain;
  }
}

/** Add a tactile UI click / button depression transient */
function addClick(startTime, pitch = 1800, bodyPitch = 90, gain = 0.35, pan = 0) {
  const duration = 0.045;
  addSinePulse(startTime, duration, pitch, bodyPitch, gain, pan);

  const startIdx = Math.floor(startTime * SAMPLE_RATE);
  const numSamples = Math.floor(0.006 * SAMPLE_RATE);
  for (let i = 0; i < numSamples; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;
    const noise = (random() * 2 - 1) * (1 - i / numSamples) * (gain * 0.45);
    leftChannel[idx] += noise;
    rightChannel[idx] += noise;
  }
}

/** Add a subtle mechanical keyboard keystroke */
function addKeystroke(startTime, gain = 0.16) {
  const f = 460 + random() * 280;
  const duration = 0.035;
  addSinePulse(startTime, duration, f * 1.8, f * 0.35, gain, (random() * 0.4 - 0.2));

  const startIdx = Math.floor(startTime * SAMPLE_RATE);
  const numSamples = Math.floor(0.005 * SAMPLE_RATE);
  for (let i = 0; i < numSamples; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;
    const noise = (random() * 2 - 1) * (1 - i / numSamples) * (gain * 0.35);
    leftChannel[idx] += noise;
    rightChannel[idx] += noise;
  }
}

/** Add a filtered noise whoosh transition sweep */
function addWhoosh(startTime, duration, fStart = 300, fPeak = 1600, gain = 0.22, panStart = -0.5, panEnd = 0.5) {
  const startIdx = Math.floor(startTime * SAMPLE_RATE);
  const numSamples = Math.floor(duration * SAMPLE_RATE);

  let y1 = 0, y2 = 0;

  for (let i = 0; i < numSamples; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;

    const progress = i / numSamples;
    const env = Math.sin(progress * Math.PI);
    const cutoff = fStart + (fPeak - fStart) * env;
    const pan = panStart + (panEnd - panStart) * progress;

    const noise = (random() * 2 - 1);
    const rc = 1.0 / (2 * Math.PI * cutoff);
    const dt = 1.0 / SAMPLE_RATE;
    const alpha = dt / (rc + dt);
    y1 += alpha * (noise - y1);
    y2 += alpha * (y1 - y2);

    const sample = y2 * env * gain;
    const leftGain = Math.cos((pan + 1) * Math.PI / 4);
    const rightGain = Math.sin((pan + 1) * Math.PI / 4);

    leftChannel[idx] += sample * leftGain;
    rightChannel[idx] += sample * rightGain;
  }
}

/** Add a deep warm cinematic sub impact */
function addSubImpact(startTime, freq = 55, duration = 0.65, gain = 0.4) {
  const startIdx = Math.floor(startTime * SAMPLE_RATE);
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  let phase = 0;

  for (let i = 0; i < numSamples; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;

    const progress = i / numSamples;
    const currentFreq = freq * Math.pow(0.5, progress * 0.8);
    phase += (2 * Math.PI * currentFreq) / SAMPLE_RATE;

    const attack = Math.min(1, i / (SAMPLE_RATE * 0.008));
    const decay = Math.exp(-progress * 4.5);
    const sample = Math.sin(phase) * attack * decay * gain;

    leftChannel[idx] += sample;
    rightChannel[idx] += sample;
  }
}

/** Add a warm atmospheric corporate synth chord swell */
function addSynthSwell(startTime, duration, notes, gain = 0.15) {
  const startIdx = Math.floor(startTime * SAMPLE_RATE);
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const phases = notes.map(() => 0);

  for (let i = 0; i < numSamples; i++) {
    const idx = startIdx + i;
    if (idx >= TOTAL_SAMPLES) break;

    const progress = i / numSamples;
    let env = 0;
    if (progress < 0.20) {
      env = progress / 0.20;
    } else {
      env = Math.exp(-(progress - 0.20) * 1.8);
    }

    let chordSample = 0;
    for (let n = 0; n < notes.length; n++) {
      phases[n] += (2 * Math.PI * notes[n]) / SAMPLE_RATE;
      const s = Math.sin(phases[n]) * 0.75 + Math.sin(phases[n] * 2) * 0.18 + Math.sin(phases[n] * 3) * 0.07;
      chordSample += s;
    }
    chordSample /= notes.length;

    const sample = chordSample * env * gain;
    leftChannel[idx] += sample * 0.95;
    rightChannel[idx] += sample * 1.05;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER 120-SECOND TIMELINE SCORE
// ─────────────────────────────────────────────────────────────────────────────

console.log('Synthesizing pristine 120.0s soundtrack score for Aura Academia...');

// ── SCENE 01: THE BRAND REVEAL (00:00 – 00:09 | 9.0s) ──
addSynthSwell(0.05, 7.5, [65.4, 98.0, 164.8, 196.0, 246.9, 293.7], 0.20); // C maj9
addChime(0.50, 1.4, 1318.5, 0.28, -0.2); // E6 logo mark
addWhoosh(1.20, 0.45, 320, 1100, 0.14, -0.3, 0.1);
addClick(2.20, 520, 160, 0.22, -0.2); // [CONNECTED ACADEMIC INFRASTRUCTURE]
addWhoosh(4.20, 0.40, 380, 950, 0.12, -0.4, 0.2);
addWhoosh(6.00, 0.35, 400, 1100, 0.15, 0.1, 0.4); // Cursor glide
addClick(7.10, 1900, 95, 0.42, 0.3); // Click [Explore LMS]
addChime(7.15, 0.8, 880, 0.20, 0.3); // Ripple ring A5
addWhoosh(8.40, 0.70, 240, 1500, 0.28, -0.6, 0.6); // Transition 1 -> 2

// ── SCENE 02: ONE PLATFORM, FIVE ADMINISTRATIVE TIERS (00:09 – 00:20 | 11.0s) ──
addSubImpact(9.00, 58, 0.8, 0.38);
addSynthSwell(9.10, 9.5, [73.4, 110.0, 146.8, 174.6, 220.0, 261.6], 0.16); // D minor / F
addClick(10.20, 650, 220, 0.24, -0.3); // Tier 1: SUPER_ADMIN
addClick(11.50, 750, 240, 0.24, -0.15); // Tier 2: COLLEGE_ADMIN
addClick(12.80, 850, 260, 0.25, 0.0); // Tier 3: HOD
addClick(14.20, 950, 280, 0.26, 0.15); // Tier 4: FACULTY
addClick(15.50, 1100, 300, 0.28, 0.3); // Tier 5: STUDENT
addChime(15.55, 0.9, 1046.5, 0.22, 0.3); // C6 tier completion
// Data bus pulses connecting tiers
for (let b = 0; b < 6; b++) {
  addSinePulse(16.50 + b * 0.22, 0.02, 1600 + b * 80, 800, 0.09, -0.3 + b * 0.12);
}
addWhoosh(19.20, 0.75, 220, 1600, 0.28, -0.6, 0.6); // Transition 2 -> 3

// ── SCENE 03: SUPER ADMIN AND COLLEGE ADMIN (00:20 – 00:33 | 13.0s) ──
addSubImpact(20.00, 54, 0.9, 0.36);
addSynthSwell(20.10, 11.5, [98.0, 146.8, 196.0, 246.9, 293.7], 0.18); // G major
// Counter ticks for platform statistics
for (let c = 0; c < 5; c++) {
  addClick(21.20 + c * 0.12, 1200 + c * 100, 350, 0.10, -0.2 + c * 0.1);
}
addWhoosh(23.00, 0.35, 450, 950, 0.12, -0.2, 0.2);
addClick(23.60, 1850, 120, 0.40, 0.1); // Click BIHER college card
addChime(23.65, 0.8, 1046.5, 0.24, 0.1); // C6
addWhoosh(24.20, 0.60, 300, 1400, 0.20, -0.3, 0.3); // Zoom to College Admin
addClick(25.80, 1300, 260, 0.26, -0.2); // Depts tab
addClick(27.40, 1650, 140, 0.38, 0.0); // Click CSE Department
addClick(28.80, 1400, 280, 0.28, 0.1); // Batch 2023-2027
addClick(30.20, 1200, 300, 0.24, -0.1); // Approval queue
addWhoosh(32.20, 0.75, 220, 1600, 0.28, -0.6, 0.6); // Transition 3 -> 4

// ── SCENE 04: HOD: DEPARTMENTAL INTELLIGENCE (00:33 – 00:46 | 13.0s) ──
addSubImpact(33.00, 50, 0.9, 0.36);
addSynthSwell(33.10, 11.5, [110.0, 164.8, 220.0, 261.6, 329.6], 0.18); // A minor
// 4 Intelligence cards pop in
for (let k = 0; k < 4; k++) {
  addClick(34.20 + k * 0.14, 850 + k * 120, 260, 0.14, -0.3 + k * 0.2);
}
addWhoosh(36.00, 0.30, 420, 900, 0.10, -0.2, 0.1);
addClick(36.50, 1550, 220, 0.38, 0.1); // Click Faculty Workload
addChime(36.55, 0.6, 1174.7, 0.18, 0.1); // D6
// Workload bars rising arpeggio
for (let w = 0; w < 5; w++) {
  addSinePulse(37.80 + w * 0.18, 0.04, 1200 + w * 180, 600, 0.12, -0.3 + w * 0.15);
}
addClick(40.50, 1600, 240, 0.36, -0.1); // Click allocation panel
addClick(42.20, 1900, 180, 0.38, 0.2); // Curriculum approval switch
addChime(42.25, 0.8, 1318.5, 0.22, 0.2); // E6 approval chime
addClick(43.50, 800, 220, 0.20, 0.0); // Audit hash stamp
addWhoosh(45.20, 0.75, 220, 1700, 0.30, -0.7, 0.7); // Transition 4 -> 5

// ── SCENE 05: FACULTY: TEACHING AND CLASSROOM OPERATIONS (00:46 – 01:02 | 16.0s) ──
addSubImpact(46.00, 56, 1.0, 0.38);
addSynthSwell(46.10, 14.5, [82.4, 123.5, 164.8, 196.0, 246.9], 0.18); // E minor
addWhoosh(47.20, 0.30, 400, 900, 0.10, -0.3, 0.0);
addClick(47.80, 1400, 250, 0.38, -0.2); // Click [Classes] in sidebar
addClick(49.20, 1100, 280, 0.24, 0.0); // Open CS-301 roster
addClick(50.80, 1500, 220, 0.36, 0.1); // Click [Attendance] tab
addClick(52.20, 1600, 200, 0.38, 0.2); // Select Period 2 (10:00 AM)
// 1-Tap Attendance Matrix toggles
addClick(53.60, 1750, 180, 0.32, -0.2); // Present
addClick(54.20, 1800, 190, 0.32, -0.1); // Present
addClick(54.80, 950, 420, 0.34, 0.0); // Mark Absent (different tone)
addClick(55.40, 1750, 180, 0.32, 0.1); // Present
addClick(56.00, 1850, 190, 0.32, 0.2); // Present
// Submit Attendance Action
addWhoosh(56.80, 0.35, 450, 1100, 0.14, 0.0, 0.3);
addClick(57.40, 2100, 95, 0.44, 0.2); // Click [Submit Attendance Session]
addChime(57.45, 1.2, 1046.5, 0.28, 0.2); // C6 confirmation
addChime(57.50, 1.2, 1318.5, 0.24, 0.3); // E6 confirmation chord
addClick(59.50, 900, 260, 0.20, -0.1); // Timetable sync cutaway
addWhoosh(61.20, 0.75, 220, 1800, 0.30, -0.6, 0.6); // Transition 5 -> 6

// ── SCENE 06: STUDENT: A PERSONAL ACADEMIC COMMAND CENTER (01:02 – 01:18 | 16.0s) ──
addSubImpact(62.00, 52, 1.0, 0.36);
addSynthSwell(62.10, 14.5, [87.3, 130.8, 174.6, 220.0, 261.6], 0.18); // F major
// Attendance gauge swell & chime
addChime(63.50, 0.8, 783.9, 0.20, -0.1); // G5
addChime(63.65, 1.0, 987.8, 0.24, 0.0); // B5 (86.4% Safe margin)
addWhoosh(64.80, 0.30, 400, 900, 0.10, 0.0, 0.2);
addClick(65.30, 1700, 180, 0.38, 0.2); // Click [Apply for Leave]
addClick(66.20, 1200, 280, 0.26, 0.0); // Select Medical Reason
// Typing explanation note
for (let k = 0; k < 8; k++) {
  addKeystroke(67.00 + k * 0.09, 0.16);
}
addClick(68.50, 1850, 150, 0.40, 0.1); // Submit Leave Application
addChime(68.55, 0.8, 880, 0.20, 0.1); // Amber pending approval chime
addWhoosh(70.50, 0.35, 380, 950, 0.12, -0.2, 0.1);
// File drag & drop into assignment dropzone
addClick(72.40, 600, 180, 0.30, 0.0); // File drop thud
addWhoosh(73.20, 0.30, 420, 1000, 0.12, 0.1, 0.3);
addClick(73.80, 2050, 110, 0.42, 0.2); // Click [Submit Assignment]
addChime(73.85, 1.3, 1046.5, 0.28, 0.2); // C6 receipt chime
addChime(73.92, 1.4, 1567.9, 0.24, 0.3); // G6 receipt chime
// SHA-256 character stream ticks
for (let h = 0; h < 10; h++) {
  addSinePulse(75.00 + h * 0.12, 0.015, 2200 + (h % 3) * 300, 1100, 0.08, -0.2 + (h % 4) * 0.1);
}
addWhoosh(77.20, 0.80, 200, 2200, 0.32, -0.7, 0.7); // Transition 6 -> 7

// ── SCENE 07: GROUNDED AI ACADEMIC ASSISTANT (01:18 – 01:36 | 18.0s) ──
addSubImpact(78.00, 46, 1.2, 0.40); // Deep electronic sub hum
addSynthSwell(78.10, 16.5, [73.4, 110.0, 146.8, 220.0, 293.7], 0.16); // D minor tech drone
addClick(79.50, 1400, 280, 0.28, 0.0); // Focus input field
// Keystrokes: "What is my current attendance, and how many classes can I safely miss?"
for (let s = 0; s < 22; s++) {
  addKeystroke(80.20 + s * 0.12, 0.18);
}
addClick(83.20, 1950, 120, 0.42, 0.3); // Enter prompt
// 5-Stage horizontal pipeline progression
addSinePulse(84.20, 0.04, 800, 400, 0.18, -0.4); // Stage 01
addSinePulse(85.00, 0.04, 1000, 500, 0.20, -0.2); // Stage 02
addSinePulse(85.80, 0.04, 1200, 600, 0.22, 0.0); // Stage 03 AI Orchestrator
addChime(85.85, 0.6, 932.3, 0.20, 0.0);
addSinePulse(86.60, 0.04, 1400, 700, 0.24, 0.2); // Stage 04 RAG & Tool Calling
addChime(86.65, 0.6, 1174.7, 0.22, 0.2);
addClick(87.80, 1800, 160, 0.40, 0.1); // Click Stage 03/04
// Cybernetic JSON tool stream: CALL get_student_attendance
for (let j = 0; j < 16; j++) {
  addSinePulse(88.40 + j * 0.09, 0.015, 2400 + (j % 4) * 260, 1200, 0.08, -0.2 + (j % 5) * 0.1);
}
// Verification affirmative chime: F#6 + C#7
addChime(90.60, 1.2, 1479.9, 0.30, 0.3);
addChime(90.65, 1.4, 2217.4, 0.26, 0.4);
// Verified chat response arrival
addChime(92.20, 1.0, 1046.5, 0.24, 0.0); // C6
addClick(93.80, 1200, 260, 0.22, 0.0); // [✓ SOURCE-VERIFIED RESPONSE]
addWhoosh(95.20, 0.75, 200, 2000, 0.30, -0.6, 0.6); // Transition 7 -> 8

// ── SCENE 08: ENGINEERED AS A CONNECTED SYSTEM (01:36 – 01:48 | 12.0s) ──
addSubImpact(96.00, 50, 1.0, 0.38);
addSynthSwell(96.10, 10.5, [65.4, 98.0, 130.8, 196.0, 261.6, 329.6], 0.20); // C corporate
// 5 System Layers entrance
addClick(97.20, 800, 220, 0.25, -0.3); // Layer 1: FRONTEND (React 19 / Vite 8)
addClick(98.30, 950, 240, 0.26, -0.15); // Layer 2: API (Node 24 / Express 4)
addClick(99.40, 1100, 260, 0.27, 0.0); // Layer 3: AUTH (Firebase / RBAC)
addClick(100.50, 1250, 280, 0.28, 0.15); // Layer 4: DATA (Prisma / PostgreSQL / PgBouncer)
addClick(101.60, 1400, 300, 0.30, 0.3); // Layer 5: DEPLOYMENT (Vercel)
// Request packet descends (down-pitch sequence)
for (let p = 0; p < 5; p++) {
  addSinePulse(102.60 + p * 0.16, 0.03, 1400 - p * 180, 400, 0.14, -0.2 + p * 0.1);
}
// Response packet ascends with arpeggio (C5, E5, G5, B5, C6)
addChime(104.20, 0.8, 523.3, 0.18, -0.2); // C5
addChime(104.40, 0.8, 659.3, 0.18, -0.1); // E5
addChime(104.60, 0.8, 783.9, 0.20, 0.0); // G5
addChime(104.80, 0.8, 987.8, 0.22, 0.1); // B5
addChime(105.00, 1.0, 1046.5, 0.26, 0.2); // C6
addWhoosh(107.20, 0.75, 220, 1600, 0.28, -0.6, 0.6); // Transition 8 -> 9

// ── SCENE 09: SECURE ACCESS AND SEAMLESS EXPERIENCE (01:48 – 01:56 | 8.0s) ──
addSubImpact(108.00, 54, 0.9, 0.35);
addSynthSwell(108.10, 7.0, [87.3, 130.8, 174.6, 220.0, 261.6], 0.18);
addClick(109.20, 1800, 140, 0.38, 0.2); // Click [Sign In] in header
addClick(109.80, 700, 240, 0.26, 0.0); // Modal pop
// Credentials typing
for (let u = 0; u < 8; u++) {
  addKeystroke(110.60 + u * 0.10, 0.16);
}
addClick(111.80, 1950, 110, 0.42, 0.0); // Click [Sign In ->] button
addChime(112.50, 1.1, 987.8, 0.22, 0.1); // Token verified
addChime(112.60, 1.2, 1318.5, 0.26, 0.2); // Role resolved: Access granted
addClick(113.80, 1100, 280, 0.22, 0.0); // Redirection toast
addWhoosh(115.20, 0.75, 200, 1800, 0.30, -0.6, 0.6); // Transition 9 -> 10

// ── SCENE 10: FINAL BRAND LOCKUP (01:56 – 02:00 | 4.0s) ──
addSubImpact(116.00, 48, 1.2, 0.42); // Grand sub foundation
addSynthSwell(116.05, 3.8, [65.4, 98.0, 164.8, 196.0, 246.9, 293.7, 392.0, 523.3], 0.24); // Full C maj9 resolution
addChime(116.50, 1.5, 1318.5, 0.32, -0.1); // E6 brand mark
addWhoosh(117.50, 0.60, 350, 1500, 0.18, -0.4, 0.4); // Shimmer sweep
addChime(118.20, 1.6, 1567.9, 0.28, 0.1); // G6
addChime(118.50, 1.8, 2093.0, 0.22, 0.2); // C7 top harmonic
// Clean confident final hold to exact 120.0s

// ─────────────────────────────────────────────────────────────────────────────
// MASTER 16-BIT STEREO PCM WAV EXPORT
// ─────────────────────────────────────────────────────────────────────────────

console.log('Compiling 120.0s 44.1kHz 16-bit Stereo WAV buffer...');

// Peak normalization to prevent digital clipping (-0.5 dB ceiling)
let peak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const absL = Math.abs(leftChannel[i]);
  const absR = Math.abs(rightChannel[i]);
  if (absL > peak) peak = absL;
  if (absR > peak) peak = absR;
}

const targetPeak = 0.94; // ~ -0.5 dB
const normFactor = peak > targetPeak ? targetPeak / peak : 1.0;
console.log(`Peak amplitude: ${(peak * 100).toFixed(1)}% • Normalization factor: ${normFactor.toFixed(3)}`);

const bytesPerSample = 2; // 16-bit
const numChannels = 2; // Stereo
const blockAlign = numChannels * bytesPerSample;
const byteRate = SAMPLE_RATE * blockAlign;
const dataSize = TOTAL_SAMPLES * blockAlign;
const headerSize = 44;
const totalFileSize = headerSize + dataSize;

const wavBuffer = Buffer.alloc(totalFileSize);

// RIFF header
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(totalFileSize - 8, 4);
wavBuffer.write('WAVE', 8);

// "fmt " sub-chunk
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
wavBuffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
wavBuffer.writeUInt16LE(numChannels, 22);
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24);
wavBuffer.writeUInt32LE(byteRate, 28);
wavBuffer.writeUInt16LE(blockAlign, 32);
wavBuffer.writeUInt16LE(16, 34); // BitsPerSample

// "data" sub-chunk
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(dataSize, 40);

// Interleave stereo 16-bit signed PCM samples
let offset = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  // Left channel
  let sampleL = leftChannel[i] * normFactor;
  sampleL = Math.max(-1, Math.min(1, sampleL));
  const intSampleL = sampleL < 0 ? Math.floor(sampleL * 32768) : Math.floor(sampleL * 32767);
  wavBuffer.writeInt16LE(intSampleL, offset);
  offset += 2;

  // Right channel
  let sampleR = rightChannel[i] * normFactor;
  sampleR = Math.max(-1, Math.min(1, sampleR));
  const intSampleR = sampleR < 0 ? Math.floor(sampleR * 32768) : Math.floor(sampleR * 32767);
  wavBuffer.writeInt16LE(intSampleR, offset);
  offset += 2;
}

const outputPath = path.resolve('motion-graphics/aura_academia_audio.wav');
fs.writeFileSync(outputPath, wavBuffer);

const fileStats = fs.statSync(outputPath);
console.log(`\n✓ Soundtrack exported successfully to: ${outputPath}`);
console.log(`• Duration: ${DURATION.toFixed(1)}s (${TOTAL_SAMPLES} samples)`);
console.log(`• File Size: ${(fileStats.size / (1024 * 1024)).toFixed(2)} MB`);
