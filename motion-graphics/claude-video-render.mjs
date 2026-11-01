// Render any HTML animation to MP4, frame by frame, with a virtual clock.
// Prerequisite: npm i playwright-core && ffmpeg installed on PATH
// Usage: node claude-video-render.mjs scene.html out.mp4 [seconds=45] [fps=60] [width=1920] [height=1080]
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import fs from 'node:fs'

const [
  inputArg = 'scene.html',
  output = 'aura_academia_master.mp4',
  seconds = '120',
  fps = '60',
  width = '1920',
  height = '1080',
  audioArg
] = process.argv.slice(2)

// Resolve input path whether run from root or motion-graphics/
let input = inputArg
if (!fs.existsSync(input) && fs.existsSync(`motion-graphics/${input}`)) {
  input = `motion-graphics/${input}`
}

const frameCount = Math.round(Number(seconds) * Number(fps))
const frameMs = 1000 / Number(fps)

// Check for audio track
let audioCandidate = audioArg
if (!audioCandidate) {
  if (fs.existsSync('aura_academia_audio.wav')) {
    audioCandidate = resolve('aura_academia_audio.wav')
  } else if (fs.existsSync('motion-graphics/aura_academia_audio.wav')) {
    audioCandidate = resolve('motion-graphics/aura_academia_audio.wav')
  }
}
const hasAudio = audioCandidate && fs.existsSync(audioCandidate)

console.log(`[Motion Graphics Renderer] Rendering ${input} -> ${output}`)
console.log(`[Specs] Duration: ${seconds}s | FPS: ${fps} | Resolution: ${width}x${height} | Total Frames: ${frameCount}`)
if (hasAudio) {
  console.log(`[Audio] Synchronized soundtrack detected: ${audioCandidate}`)
}

const virtualClock = () => {
  let now = 0
  let queue = []
  const startDate = Date.now()
  performance.now = () => now
  Date.now = () => startDate + now
  window.requestAnimationFrame = (cb) => queue.push(cb)
  window.cancelAnimationFrame = () => {}
  window.__advance = (ms) => {
    now += ms
    const callbacks = queue
    queue = []
    callbacks.forEach((cb) => cb(now))
    if (typeof window.renderAt === 'function') {
      window.renderAt(now / 1000)
    }
  }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } })
await page.addInitScript(virtualClock)
const url = input.startsWith('http') ? input : pathToFileURL(resolve(input)).href
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const ffmpegArgs = [
  '-y',
  '-f', 'image2pipe',
  '-framerate', fps,
  '-i', '-'
]

if (hasAudio) {
  ffmpegArgs.push('-i', audioCandidate)
}

ffmpegArgs.push(
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-crf', '17',
  '-preset', 'slow'
)

if (hasAudio) {
  ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest')
}

ffmpegArgs.push('-movflags', '+faststart', output)

const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] })

const startTime = Date.now()
for (let i = 0; i < frameCount; i++) {
  await page.evaluate((ms) => window.__advance(ms), i === 0 ? 0 : frameMs)
  const screenshotBuffer = await page.screenshot({ type: 'png' })
  ffmpeg.stdin.write(screenshotBuffer)
  
  if (i % (Number(fps) * 2) === 0 || i === frameCount - 1) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    const pct = ((i / frameCount) * 100).toFixed(1)
    console.log(`[Progress] Frame ${i}/${frameCount} (${pct}%) • Elapsed: ${elapsed}s`)
  }
}

ffmpeg.stdin.end()
await new Promise((done) => ffmpeg.on('close', done))
await browser.close()
console.log(`\n✓ Video successfully rendered to: ${output}`)
