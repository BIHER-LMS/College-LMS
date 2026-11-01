// ─────────────────────────────────────────────────────────────────────────────
// AURA ACADEMIA MOTION GRAPHICS — 120-SECOND MASTER CURSOR TRACK
// Waypoint interpolation with cubic bezier easing, realistic arc movements,
// dwell timing, button depressions, typing states, and concentric ripples
// ─────────────────────────────────────────────────────────────────────────────

window.CURSOR_TRACK = [
  // ── SCENE 01: THE BRAND REVEAL (00:00 – 00:09 | 9.0s) ──
  { t: 0.0, x: 1550, y: 880, click: false },
  { t: 2.2, x: 1450, y: 780, click: false },
  { t: 4.5, x: 1680, y: 36, click: false }, // Glide toward header
  { t: 6.2, x: 1740, y: 36, click: false }, // Hover [Explore LMS]
  { t: 7.1, x: 1740, y: 36, click: true, id: 's1_header_explore' }, // Click [Explore LMS]
  { t: 7.4, x: 1740, y: 36, click: false },
  { t: 8.8, x: 1400, y: 220, click: false },

  // ── SCENE 02: ONE PLATFORM, FIVE ADMINISTRATIVE TIERS (00:09 – 00:20 | 11.0s) ──
  { t: 9.6, x: 960, y: 240, click: false }, // Center on Super Admin tier
  { t: 10.4, x: 960, y: 320, click: true, id: 's2_tier_super' },
  { t: 10.7, x: 960, y: 320, click: false },
  { t: 11.7, x: 960, y: 440, click: true, id: 's2_tier_college' },
  { t: 12.0, x: 960, y: 440, click: false },
  { t: 13.0, x: 960, y: 560, click: true, id: 's2_tier_hod' },
  { t: 13.3, x: 960, y: 560, click: false },
  { t: 14.4, x: 960, y: 680, click: true, id: 's2_tier_faculty' },
  { t: 14.7, x: 960, y: 680, click: false },
  { t: 15.7, x: 960, y: 800, click: true, id: 's2_tier_student' },
  { t: 16.0, x: 960, y: 800, click: false },
  { t: 18.2, x: 1200, y: 600, click: false },
  { t: 19.8, x: 960, y: 400, click: false },

  // ── SCENE 03: SUPER ADMIN AND COLLEGE ADMIN (00:20 – 00:33 | 13.0s) ──
  { t: 20.8, x: 620, y: 450, click: false }, // Hover multi-institution metric
  { t: 23.2, x: 680, y: 540, click: false }, // Hover BIHER college card
  { t: 23.6, x: 680, y: 540, click: true, id: 's3_click_biher' }, // Click BIHER card
  { t: 24.0, x: 680, y: 540, click: false },
  { t: 25.5, x: 260, y: 380, click: false }, // Move to College Admin sidebar
  { t: 25.8, x: 260, y: 380, click: true, id: 's3_click_departments' }, // Click Departments
  { t: 26.2, x: 260, y: 380, click: false },
  { t: 27.1, x: 640, y: 420, click: false }, // Hover Computer Science card
  { t: 27.4, x: 640, y: 420, click: true, id: 's3_click_cse' }, // Click CSE department
  { t: 27.8, x: 640, y: 420, click: false },
  { t: 28.6, x: 1040, y: 480, click: false }, // Hover Batch 2023-2027
  { t: 28.8, x: 1040, y: 480, click: true, id: 's3_click_batch' },
  { t: 29.2, x: 1040, y: 480, click: false },
  { t: 30.0, x: 1480, y: 240, click: false }, // User approval queue
  { t: 30.3, x: 1480, y: 240, click: true, id: 's3_click_approvals' },
  { t: 30.7, x: 1480, y: 240, click: false },
  { t: 32.5, x: 1200, y: 500, click: false },

  // ── SCENE 04: HOD: DEPARTMENTAL INTELLIGENCE (00:33 – 00:46 | 13.0s) ──
  { t: 34.0, x: 500, y: 320, click: false }, // Dept Overview card
  { t: 36.1, x: 880, y: 260, click: false }, // Faculty Workload tab
  { t: 36.5, x: 880, y: 260, click: true, id: 's4_click_workload_tab' },
  { t: 36.9, x: 880, y: 260, click: false },
  { t: 38.5, x: 750, y: 520, click: false }, // Hover workload chart bar
  { t: 40.2, x: 1200, y: 460, click: false }, // Allocation panel (Prof. Arvind)
  { t: 40.5, x: 1200, y: 460, click: true, id: 's4_click_allocation' },
  { t: 40.9, x: 1200, y: 460, click: false },
  { t: 41.8, x: 1460, y: 640, click: false }, // Curriculum compliance switch
  { t: 42.2, x: 1460, y: 640, click: true, id: 's4_toggle_compliance' },
  { t: 42.6, x: 1460, y: 640, click: false },
  { t: 44.5, x: 1100, y: 600, click: false },

  // ── SCENE 05: FACULTY: TEACHING AND CLASSROOM OPERATIONS (00:46 – 01:02 | 16.0s) ──
  { t: 47.4, x: 240, y: 340, click: false }, // Click Classes in sidebar
  { t: 47.8, x: 240, y: 340, click: true, id: 's5_click_classes' },
  { t: 48.2, x: 240, y: 340, click: false },
  { t: 49.0, x: 580, y: 380, click: false }, // Open CS-301 roster
  { t: 50.4, x: 740, y: 250, click: false }, // Click Attendance tab
  { t: 50.8, x: 740, y: 250, click: true, id: 's5_click_att_tab' },
  { t: 51.2, x: 740, y: 250, click: false },
  { t: 51.9, x: 920, y: 320, click: false }, // Select Period 2 (10:00 AM)
  { t: 52.2, x: 920, y: 320, click: true, id: 's5_click_period' },
  { t: 52.6, x: 920, y: 320, click: false },
  // 1-Tap Attendance Toggles
  { t: 53.4, x: 1280, y: 420, click: false },
  { t: 53.6, x: 1280, y: 420, click: true, id: 's5_toggle_st1' }, // Present
  { t: 53.9, x: 1280, y: 420, click: false },
  { t: 54.1, x: 1280, y: 470, click: false },
  { t: 54.2, x: 1280, y: 470, click: true, id: 's5_toggle_st2' }, // Present
  { t: 54.5, x: 1280, y: 470, click: false },
  { t: 54.7, x: 1350, y: 520, click: false },
  { t: 54.8, x: 1350, y: 520, click: true, id: 's5_toggle_st3_absent' }, // Absent toggle
  { t: 55.1, x: 1350, y: 520, click: false },
  { t: 55.3, x: 1280, y: 570, click: false },
  { t: 55.4, x: 1280, y: 570, click: true, id: 's5_toggle_st4' }, // Present
  { t: 55.7, x: 1280, y: 570, click: false },
  { t: 55.9, x: 1280, y: 620, click: false },
  { t: 56.0, x: 1280, y: 620, click: true, id: 's5_toggle_st5' }, // Present
  { t: 56.3, x: 1280, y: 620, click: false },
  // Submit Attendance Session Button
  { t: 57.0, x: 1420, y: 780, click: false },
  { t: 57.4, x: 1420, y: 780, click: true, id: 's5_submit_attendance' },
  { t: 57.8, x: 1420, y: 780, click: false },
  { t: 59.5, x: 1100, y: 500, click: false },
  { t: 61.2, x: 960, y: 450, click: false },

  // ── SCENE 06: STUDENT: A PERSONAL ACADEMIC COMMAND CENTER (01:02 – 01:18 | 16.0s) ──
  { t: 63.2, x: 520, y: 480, click: false }, // Hover 86.4% Attendance Gauge
  { t: 64.9, x: 1440, y: 320, click: false }, // Hover [Apply for Leave] button
  { t: 65.3, x: 1440, y: 320, click: true, id: 's6_click_apply_leave' }, // Click Apply for Leave
  { t: 65.7, x: 1440, y: 320, click: false },
  { t: 66.2, x: 960, y: 460, click: true, id: 's6_select_leave_reason' }, // In modal: select reason
  { t: 66.5, x: 960, y: 460, click: false },
  { t: 67.2, x: 960, y: 560, click: false }, // Dwell while typing explanation
  { t: 68.5, x: 1120, y: 680, click: true, id: 's6_submit_leave' }, // Click Submit Leave
  { t: 68.9, x: 1120, y: 680, click: false },
  // Assignment Dropzone & Submission
  { t: 71.2, x: 680, y: 780, click: false }, // Pick up PDF file
  { t: 72.4, x: 1150, y: 780, click: true, id: 's6_drop_file' }, // Drop into assignment dropzone
  { t: 72.8, x: 1150, y: 780, click: false },
  { t: 73.5, x: 1440, y: 840, click: false },
  { t: 73.8, x: 1440, y: 840, click: true, id: 's6_submit_assignment' }, // Click Submit Assignment
  { t: 74.2, x: 1440, y: 840, click: false },
  { t: 75.8, x: 1200, y: 620, click: false }, // Hover SHA-256 cryptographic receipt

  // ── SCENE 07: GROUNDED AI ACADEMIC ASSISTANT (01:18 – 01:36 | 18.0s) ──
  { t: 79.2, x: 960, y: 860, click: false }, // Move to AI input prompt
  { t: 79.5, x: 960, y: 860, click: true, id: 's7_focus_input' }, // Focus input
  { t: 79.8, x: 960, y: 860, click: false },
  { t: 83.0, x: 1480, y: 860, click: false }, // Move to send button after typing
  { t: 83.2, x: 1480, y: 860, click: true, id: 's7_send_prompt' }, // Send prompt
  { t: 83.6, x: 1480, y: 860, click: false },
  { t: 85.5, x: 420, y: 280, click: false }, // Watch Stage 01
  { t: 86.8, x: 880, y: 280, click: false }, // Move to Stage 03 AI Orchestrator
  { t: 87.8, x: 880, y: 280, click: true, id: 's7_click_stage3' }, // Click Stage 03/04
  { t: 88.2, x: 880, y: 280, click: false },
  { t: 90.0, x: 1100, y: 480, click: false }, // Inspect tool call in JSON inspector
  { t: 93.5, x: 960, y: 640, click: false }, // Hover verified answer card

  // ── SCENE 08: ENGINEERED AS A CONNECTED SYSTEM (01:36 – 01:48 | 12.0s) ──
  { t: 97.5, x: 960, y: 260, click: false }, // Layer 1 Frontend
  { t: 99.0, x: 960, y: 420, click: false }, // Layer 2 API
  { t: 100.5, x: 960, y: 580, click: false }, // Layer 3 Auth & RBAC
  { t: 102.0, x: 960, y: 740, click: false }, // Layer 4 Database
  { t: 103.5, x: 960, y: 900, click: false }, // Layer 5 Deployment
  { t: 105.0, x: 1280, y: 580, click: false }, // Watch tenant isolation wall
  { t: 107.0, x: 960, y: 500, click: false },

  // ── SCENE 09: SECURE ACCESS AND SEAMLESS EXPERIENCE (01:48 – 01:56 | 8.0s) ──
  { t: 108.8, x: 1600, y: 36, click: false }, // Move to Sign In in header
  { t: 109.2, x: 1600, y: 36, click: true, id: 's9_click_signin_header' },
  { t: 109.5, x: 1600, y: 36, click: false },
  { t: 110.5, x: 960, y: 510, click: false }, // Focus credentials field in modal
  { t: 111.5, x: 960, y: 660, click: false }, // Move to Sign In ->
  { t: 111.8, x: 960, y: 660, click: true, id: 's9_click_submit_login' },
  { t: 112.2, x: 960, y: 660, click: false },
  { t: 114.0, x: 960, y: 740, click: false }, // Watch redirection toast

  // ── SCENE 10: FINAL BRAND LOCKUP (01:56 – 02:00 | 4.0s) ──
  { t: 116.5, x: 960, y: 540, click: false },
  { t: 118.0, x: 960, y: 600, click: false },
  { t: 120.0, x: 960, y: 600, click: false }
];

/** Interpolates cursor coordinate and click state at time t */
window.getCursorAt = function(t) {
  const track = window.CURSOR_TRACK;
  if (t <= track[0].t) {
    return { x: track[0].x, y: track[0].y, isClicking: false, clickProgress: 0 };
  }
  const last = track[track.length - 1];
  if (t >= last.t) {
    return { x: last.x, y: last.y, isClicking: false, clickProgress: 0 };
  }

  let i = 0;
  while (i < track.length - 1 && track[i + 1].t <= t) {
    i++;
  }

  const k1 = track[i];
  const k2 = track[i + 1];
  const span = k2.t - k1.t;
  const u = span > 0 ? (t - k1.t) / span : 1;
  const clampedU = Math.max(0, Math.min(1, u));
  const eased = clampedU < 0.5 ? 4 * clampedU * clampedU * clampedU : 1 - Math.pow(-2 * clampedU + 2, 3) / 2;

  const arcY = Math.sin(clampedU * Math.PI) * (k2.x - k1.x) * 0.05;
  const x = k1.x + (k2.x - k1.x) * eased;
  const y = k1.y + (k2.y - k1.y) * eased - arcY;

  let isClicking = false;
  let clickProgress = 0;

  for (let k = 0; k < track.length; k++) {
    if (track[k].click) {
      const diff = t - track[k].t;
      if (diff >= -0.04 && diff < 0.46) {
        if (diff >= -0.04 && diff < 0.16) {
          isClicking = true;
        }
        clickProgress = Math.max(0, Math.min(1, (diff + 0.04) / 0.5));
        break;
      }
    }
  }

  return { x, y, isClicking, clickProgress };
};

/** Draws realistic vector cursor with click depression and concentric ripples */
window.drawCursor = function(ctx, x, y, isClicking = false, clickProgress = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Concentric click ripples
  if (clickProgress > 0 && clickProgress < 1.0) {
    const r1 = 8 + clickProgress * 44;
    const alpha1 = (1 - clickProgress) * 0.8;
    ctx.strokeStyle = `rgba(0, 74, 198, ${alpha1})`;
    ctx.lineWidth = 2.5 * (1 - clickProgress);
    ctx.beginPath();
    ctx.arc(0, 0, r1, 0, Math.PI * 2);
    ctx.stroke();

    const r2 = 4 + clickProgress * 24;
    const alpha2 = (1 - clickProgress) * 0.4;
    ctx.fillStyle = `rgba(37, 99, 235, ${alpha2})`;
    ctx.beginPath();
    ctx.arc(0, 0, r2, 0, Math.PI * 2);
    ctx.fill();
  }

  const scale = isClicking ? 0.88 : 1.0;
  ctx.scale(scale, scale);

  // Drop shadow
  ctx.shadowColor = 'rgba(19, 27, 46, 0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 24);
  ctx.lineTo(6.5, 18.5);
  ctx.lineTo(13, 27.5);
  ctx.lineTo(17.5, 24.5);
  ctx.lineTo(11, 15.5);
  ctx.lineTo(19, 15.5);
  ctx.closePath();

  // Pure daylight cursor with institutional blue accent
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = isClicking ? '#2563eb' : '#004ac6';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Subtle interior cyan telemetry pip
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(4.5, 9, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
