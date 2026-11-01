# Aura Academia — 120-Second Cinematic Motion Graphics Film
**Your College. One Intelligent Platform.**

A production-grade, 2-minute (120-second) cinematic motion graphics film for **Aura Academia** (Enterprise College Learning Management System). Built entirely as code using an HTML5 Canvas engine with a deterministic virtual clock (`window.renderAt(t)`), high-fidelity vector cursor animation, procedural 44.1kHz stereo audio synthesis, and headless 60 FPS video capture.

---

## 📽️ Deliverables Summary

All motion graphics assets and code are strictly isolated in this directory (`motion-graphics/`):

| File | Purpose |
|---|---|
| `scene.html` | Master 1080p canvas engine with deterministic virtual clock (`window.renderAt(t)`), interactive studio player, 0–120s scrubber, and contact sheet generator. |
| `index.html` | Presentation showcase wrapper with embedded player, quick jumps, and complete 10-scene storyboard cards. |
| `cursor-track.js` | 120-second vector cursor trajectory with cubic-bezier smoothing, natural dwell times, clicks, and typing states. |
| `audio-cues.js` | Web Audio API procedural sound engine providing synchronized audio preview during live playback. |
| `drawing-helpers.js` | Shared design system tokens, 3D brand mark, universal header, elevation cards, and badge pills. |
| `scenes-1-to-5.js` | Modular canvas renderer for Scenes 01 through 05 (00:00 – 01:02 \| 62.0s). |
| `scenes-6-to-10.js` | Modular canvas renderer for Scenes 06 through 10 (01:02 – 02:00 \| 58.0s). |
| `generate-audio.mjs` | Node.js procedural sound generator producing the master 120.0s 44.1kHz 16-bit stereo WAV file. |
| `aura_academia_audio.wav` | Master 120.0s 44.1kHz stereo PCM soundtrack (20.19 MB) synchronized with all 10 scenes. |
| `claude-video-render.mjs` | Headless Playwright script that renders all 7,200 frames at 60 FPS and pipes to FFmpeg. |

---

## ⏱️ 10-Scene Master Storyboard (Exactly 120.0 Seconds)

```
00:00        00:09        00:20        00:33        00:46        01:02        01:18        01:36        01:48   01:56  02:00
  [ SCENE 01 ] [ SCENE 02 ] [ SCENE 03 ] [ SCENE 04 ] [ SCENE 05 ] [ SCENE 06 ] [ SCENE 07 ] [ SCENE 08 ] [ S09 ] [ S10 ]
   Brand Reveal   5 Tiers    Workspaces    HOD Intel   Faculty Ops  Student Cmd   AI RAG Pipe  Arch Stack   Access  Lockup
       (9s)        (11s)        (13s)        (13s)        (16s)        (16s)        (18s)        (12s)      (8s)    (4s)
```

### Detailed Breakdown:
1. **Scene 01 (00:00 – 00:09 \| 9.0s): The Brand Reveal & Universal Header**
   - Canvas background with subtle grid lines (`rgba(0, 74, 198, 0.05)`).
   - 3D rotating orbital brand mark with central glowing prism.
   - Headline: **AURA ACADEMIA** • Subtitle: *Your College. One Intelligent Platform.*
   - Universal navigation header slides into place.
   - Vector cursor glides to `Explore LMS →` button, clicks with tactile depression and blue concentric ripple.

2. **Scene 02 (00:09 – 00:20 \| 11.0s): One Platform, Five Administrative Tiers**
   - Connected institutional hierarchy graph with traveling cyan data packets.
   - 5 operational tiers: `SUPER_ADMIN`, `COLLEGE_ADMIN`, `HOD`, `FACULTY`, `STUDENT`.
   - Cursor inspects each tier sequentially with spotlight card glow.

3. **Scene 03 (00:20 – 00:33 \| 13.0s): Super Admin & College Admin Workspaces**
   - Multi-institution metrics: 14 Campuses, 48,250 Active Students, 99.99% Edge Uptime.
   - Cursor selects *Bharath Institute of Higher Education & Research (BIHER)* (BIHER-TN-2026).
   - Smooth zoom into College Admin Workspace: CSE department setup, 2023-2027 batch, and student approval queue.

4. **Scene 04 (00:33 – 00:46 \| 13.0s): HOD: Departmental Intelligence**
   - Sovereign CSE departmental boundary banner.
   - 4 intelligence cards: Faculty Strength (24/24), Attendance Surveillance (88.2%), Syllabus Progress (74.6%), Audit Hash (`0x4e29...c1`).
   - Faculty workload balancing bar chart (Prof. Arvind Kumar: 16/18 hrs/wk).
   - Syllabus compliance toggle approved to verified green.

5. **Scene 05 (00:46 – 01:02 \| 16.0s): Faculty: Teaching and Classroom Operations**
   - Today's schedule banner: *Period 2 (10:00 AM – 10:50 AM) • CS-301 Distributed Systems • Lecture Hall 302*.
   - 1-Tap Attendance Matrix with 45-student roster.
   - Cursor rapidly toggles attendance states, clicks `Submit Attendance Session`.
   - Tactile green confirmation toast: *✓ Period 2 Attendance Recorded • 42 Present, 3 Absent • Synced to PostgreSQL*.

6. **Scene 06 (01:02 – 01:18 \| 16.0s): Student: Personal Academic Command Center**
   - Student dashboard (*Amirtha Varsshan • Reg # 2023CS1042*).
   - Circular attendance gauge: **86.4%** with Safe Margin indicator: **"+5 Classes Safe to Miss"**.
   - Student leave application modal submitted.
   - Coursework dropzone with drag & drop of `CS301_Lab4_DistributedConsensus.pdf` (2.4 MB).
   - Instant SHA-256 cryptographic receipt generated (`sha256:0x8f4d92a1...`).

7. **Scene 07 (01:18 – 01:36 \| 18.0s): Grounded AI Academic Assistant**
   - Prompt typed in real time: *"What is my current attendance, and how many classes can I safely miss?"*.
   - 5-stage deterministic AI pipeline activates sequentially:
     `01 User Context` → `02 LMS Interface` → `03 AI Orchestrator` → `04 RAG & Tool Calling` → `05 Verified Output`.
   - Dark Stage Execution Inspector displays syntax-highlighted JSON tool call (`CALL get_student_attendance`) and database response.
   - Chat card delivers verified answer with `✓ SOURCE-VERIFIED RESPONSE • DATABASE-GROUNDED` badge.

8. **Scene 08 (01:36 – 01:48 \| 12.0s): Engineered as a Connected System**
   - 5-layer stack architecture:
     * *Layer 01*: React 19 · Vite 8 · TypeScript · Redux Toolkit · Tailwind CSS
     * *Layer 02*: Node.js 24 · Express 4 REST API
     * *Layer 03*: Firebase Auth · Firebase Admin SDK · RBAC Middleware
     * *Layer 04*: Prisma ORM 5.22 · Supabase PostgreSQL · PgBouncer Pooler
     * *Layer 05*: Vercel Serverless Functions · Global Edge CDN
   - Real-time animated request/response packet flows traveling down to the database and back.

9. **Scene 09 (01:48 – 01:56 \| 8.0s): Secure Access and Seamless Experience**
   - Universal navigation header sign-in modal with frosted glass effect.
   - Institutional credential entry (`a.varsshan@biher.edu`).
   - Token verification and instant role resolution to `STUDENT`.
   - Routing toast transitions to the authorized student workspace.

10. **Scene 10 (01:56 – 02:00 \| 4.0s): Final Brand Lockup**
    - Master orbital brand mark in slow rotation.
    - Headline: **AURA ACADEMIA**
    - Tagline: *Your College. One Intelligent Platform.*
    - Five-tier role ribbon: `SUPER ADMIN • COLLEGE ADMIN • HOD • FACULTY • STUDENT`.
    - Serene final hold at exact 120.0s.

---

## 🚀 How to Run and Preview Locally

You can run the interactive motion graphics player using any local static file server:

```powershell
# Navigate to the motion-graphics directory
cd motion-graphics

# Start Python HTTP server
python -m http.server 8765
```

Open your browser at:
- **Presentation Showcase:** `http://localhost:8765/index.html`
- **Standalone Canvas Engine:** `http://localhost:8765/scene.html`

### Interactive Studio Controls:
- **Play / Pause (`Space`):** Toggles playback with synchronized Web Audio.
- **Scrubber (`0 – 120s`):** Immediate random access to any second of the 120.0s timeline.
- **Scene Pills (`S1` to `S10`):** Instant jump to the start of each scene.
- **Contact Sheet Button (`📸`):** Generates a 5×2 grid sampling all 10 scenes in a single high-resolution image.
- **Sound Toggle (`🔊`):** Mute / unmute real-time procedural audio synthesis.

---

## 🎬 How to Render to Full MP4 (Headless 60 FPS)

The render pipeline uses Playwright to drive Chromium frame by frame, capturing 7,200 frames at 1920×1080 without dropped frames, and FFmpeg to encode an H.264 MP4 muxed with `aura_academia_audio.wav`:

```powershell
# 1. Ensure dependencies are installed in motion-graphics/
npm install

# 2. Run video render script (scene.html, out.mp4, 120 seconds, 60 fps, 1920x1080, audio)
node claude-video-render.mjs scene.html aura_academia_master.mp4 120 60 1920 1080 aura_academia_audio.wav
```

---

## 🎨 Design System & Skills Compliance

- **`motion-graphics` Skill:**
  - Single master `scene.html` exposing `window.renderAt(t)`.
  - Every visual frame is a pure mathematical function of time `t` with zero unseeded randomness or unmanaged frame counters.
  - Virtual clock replaces `performance.now()` for deterministic capture.
  - Built-in contact sheet generator sampling across all 10 scenes.
- **`awwwards-3d` Skill:**
  - ACESFilmic-grade color tone mapping and ambient radial wash.
  - Lerp-eased camera transitions and orbital brand mark rotation.
  - High-contrast institutional daylight aesthetic (`#FAF8FF` canvas with `#004AC6` brand blue and `#06B6D4` cyan telemetry).
- **`motion-primitives` & `react-bits` Skills:**
  - Micro-interactions on buttons and pills (depression, border glow).
  - Spotlight card highlights on hierarchy tiers and departments.
  - Realistic vector cursor with concentric click ripples and dynamic arc offsets.
