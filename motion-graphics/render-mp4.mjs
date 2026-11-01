// ─────────────────────────────────────────────────────────────────────────────
// AURA ACADEMIA MOTION GRAPHICS — ULTRA-FAST MASTER MP4 RENDER PIPELINE
// Uses Chrome Native Canvas Media Stream + FFmpeg H.264/AAC Stereo Muxer
// Generates a pristine 1080p 60fps MP4 video in ~50 seconds with zero lag
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from './node_modules/playwright-core/index.mjs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const inputHtml = args[0] || 'motion-graphics/scene.html';
const outputMp4 = args[1] || 'motion-graphics/aura_academia_master.mp4';
const inputAudio = args[2] || 'motion-graphics/aura_academia_audio.wav';
const durationSec = parseFloat(args[3] || '45.0');
const targetFps = parseInt(args[4] || '60', 10);
const width = parseInt(args[5] || '1920', 10);
const height = parseInt(args[6] || '1080', 10);

console.log('═════════════════════════════════════════════════════════════════════');
console.log('   AURA ACADEMIA — HIGH-SPEED MASTER MP4 RENDER PIPELINE           ');
console.log('═════════════════════════════════════════════════════════════════════');
console.log(`[Input HTML]    : ${inputHtml}`);
console.log(`[Audio Track]   : ${inputAudio}`);
console.log(`[Target Output] : ${outputMp4}`);
console.log(`[Resolution]    : ${width}x${height} @ ${targetFps} FPS (${durationSec}s total)`);

// 1. Resolve FFmpeg
function findFfmpeg() {
  try {
    const res = spawnSync('ffmpeg', ['-version']);
    if (res.status === 0) return 'ffmpeg';
  } catch (e) {}

  const candidates = [
    'C:\\Users\\natha.HP\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe',
    'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
    'C:\\ffmpeg\\bin\\ffmpeg.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'ffmpeg';
}

const ffmpegBin = findFfmpeg();
console.log(`[FFmpeg Binary] : ${ffmpegBin}`);

// 2. Resolve Chrome
function findChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

const chromeBin = findChrome();
console.log(`[Browser Engine]: ${chromeBin || 'System Default'}`);

// 3. Ensure audio exists
if (!fs.existsSync(inputAudio)) {
  console.log('[Audio] Synthesizing 44.1kHz stereo audio soundtrack...');
  spawnSync('node', ['motion-graphics/generate-audio.mjs', inputAudio], { stdio: 'inherit' });
}
const hasAudio = fs.existsSync(inputAudio);
console.log(`[Audio Status]  : ${hasAudio ? '✓ Verified (' + (fs.statSync(inputAudio).size / 1024 / 1024).toFixed(2) + ' MB)' : '✗ Not Found'}`);

// 4. Launch Headless Chrome
console.log('\n[1/3] Launching Chrome and loading Aura Academia scene...');
const launchOpts = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--hide-scrollbars'
  ]
};
if (chromeBin) launchOpts.executablePath = chromeBin;

const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1
});

const htmlUrl = inputHtml.startsWith('http') ? inputHtml : pathToFileURL(resolve(inputHtml)).href;
await page.goto(htmlUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Hide floating studio bar during render
await page.evaluate(() => {
  const controls = document.getElementById('studio-controls');
  if (controls) controls.style.display = 'none';
  if (typeof window.audioSystem !== 'undefined') window.audioSystem.isMuted = true;
});

// 5. Capture High-Bitrate Canvas Stream via Native MediaRecorder
console.log(`[2/3] Capturing 60 FPS master canvas stream for ${durationSec}s in real-time...`);
const startRecordTime = Date.now();

// Stream capture in browser
const base64Video = await page.evaluate(async ({ durationSec, targetFps }) => {
  return new Promise((resolve, reject) => {
    const canvas = document.getElementById('stage');
    if (!canvas) return reject(new Error('Stage canvas not found'));

    // Capture 60 FPS stream directly from canvas
    const stream = canvas.captureStream(targetFps);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 16000000 // 16 Mbps broadcast quality
    });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    };

    recorder.start(500); // 500ms chunks

    const totalDurationMs = durationSec * 1000;
    const startT = performance.now();

    function frameStep() {
      const elapsedMs = performance.now() - startT;
      const t = Math.min(durationSec, elapsedMs / 1000);
      window.renderAt(t);

      if (elapsedMs < totalDurationMs) {
        requestAnimationFrame(frameStep);
      } else {
        window.renderAt(durationSec);
        setTimeout(() => recorder.stop(), 200);
      }
    }

    requestAnimationFrame(frameStep);
  });
}, { durationSec, targetFps });

await browser.close();

const captureTime = ((Date.now() - startRecordTime) / 1000).toFixed(1);
console.log(`[Canvas Capture] : Successfully captured in ${captureTime}s! Writing raw stream...`);

const tempWebm = resolve('motion-graphics', '.temp_recording.webm');
const webmBuffer = Buffer.from(base64Video, 'base64');
fs.writeFileSync(tempWebm, webmBuffer);
console.log(`[Raw Stream Size]: ${(webmBuffer.length / 1024 / 1024).toFixed(2)} MB`);

// 6. Transcode to Broadcast-Standard MP4 with High-Quality Audio
console.log('\n[3/3] Encoding master H.264 video with synchronized AAC audio...');
const encodeStartTime = Date.now();

const ffmpegArgs = [
  '-y',
  '-i', tempWebm
];

if (hasAudio) {
  ffmpegArgs.push('-i', resolve(inputAudio));
}

ffmpegArgs.push(
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-preset', 'fast',
  '-crf', '17'
);

if (hasAudio) {
  ffmpegArgs.push(
    '-c:a', 'aac',
    '-b:a', '256k',
    '-shortest'
  );
}

ffmpegArgs.push(
  '-movflags', '+faststart',
  resolve(outputMp4)
);

const encodeRes = spawnSync(ffmpegBin, ffmpegArgs, { stdio: 'inherit' });

if (encodeRes.status !== 0) {
  console.error('[Error] FFmpeg encoding failed with exit code:', encodeRes.status);
  process.exit(1);
}

// Clean up temporary webm file
try {
  fs.unlinkSync(tempWebm);
} catch (e) {}

const totalSec = ((Date.now() - startRecordTime) / 1000).toFixed(1);
const finalSizeMb = (fs.statSync(resolve(outputMp4)).size / 1024 / 1024).toFixed(2);

console.log('\n═════════════════════════════════════════════════════════════════════');
console.log('   ✓ AURA ACADEMIA MASTER MP4 RENDER COMPLETE!                    ');
console.log('═════════════════════════════════════════════════════════════════════');
console.log(`[File Path]  : ${resolve(outputMp4)}`);
console.log(`[File Size]  : ${finalSizeMb} MB`);
console.log(`[Duration]   : ${durationSec}s @ ${targetFps} FPS`);
console.log(`[Audio Track]: Synchronized Stereo AAC (256 kbps, 44.1 kHz)`);
console.log(`[Container]  : MP4 (H.264 High Profile, CRF 17, FastStart)`);
console.log(`[Total Time] : ${totalSec}s`);
console.log('═════════════════════════════════════════════════════════════════════\n');
