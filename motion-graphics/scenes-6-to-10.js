// ─────────────────────────────────────────────────────────────────────────────
// AURA ACADEMIA MOTION GRAPHICS — SCENES 06 TO 10 (01:02 – 02:00 | 58.0s)
// ─────────────────────────────────────────────────────────────────────────────

/** SCENE 06: Student: Personal Academic Command Center (01:02 – 01:18 | 16.0s) */
window.renderScene06 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 62.0; // 0.0 to 16.0s

  window.drawCanvasBackground(ctx, t);
  window.drawUniversalHeader(ctx, t, 'Modules');

  ctx.save();
  // Student Header Banner
  window.drawCard(ctx, 140, 110, 1640, 74, 10, '#FFFFFF', T.border);
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Amirtha Varsshan  •  Computer Science & Engineering (Year 3)', 170, 148);

  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = T.brandBlue;
  ctx.fillText('REGISTER NO: 2023CS1042  •  AUTONOMOUS BATCH 2023-2027  •  CAMPUS: BIHER', 170, 172);

  // Apply for Leave button in top banner
  const isLeaveClicked = (relT > 3.3);
  window.drawRoundedRect(ctx, 1550, 126, 190, 42, 21);
  ctx.fillStyle = isLeaveClicked ? T.warningAmber : T.brandBlue;
  ctx.fill();
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(isLeaveClicked ? '✓ Leave Requested' : '+ Apply for Leave', 1645, 151);
  ctx.textAlign = 'left';

  // Left Hero Card: Circular Attendance Gauge & Safe Margin
  const gaugeW = 540;
  window.drawCard(ctx, 140, 204, gaugeW, 400, 12);

  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Overall Attendance Compliance', 170, 240);

  // Circular Gauge
  const gcx = 140 + gaugeW / 2;
  const gcy = 360;
  const gr = 80;

  // Background ring
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(gcx, gcy, gr, 0, Math.PI * 2);
  ctx.stroke();

  // Progress ring: 86.4%
  ctx.strokeStyle = T.statusGreen;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(gcx, gcy, gr, -Math.PI / 2, -Math.PI / 2 + (0.864 * Math.PI * 2));
  ctx.stroke();
  ctx.lineCap = 'butt';

  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.textAlign = 'center';
  ctx.fillText('86.4%', gcx, gcy + 8);

  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('76 / 88 CLASSES', gcx, gcy + 28);
  ctx.textAlign = 'left';

  // Safe Margin Callout Box
  window.drawCard(ctx, 170, 480, gaugeW - 60, 96, 10, T.statusGreenBg, 'rgba(5, 150, 105, 0.3)');
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.statusGreen;
  ctx.fillText('Safe Margin: +5 Classes', 190, 516);

  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#065F46';
  ctx.fillText('You can miss up to 5 more classes before dropping below the 75% institutional requirement.', 190, 545);

  // Right Top: Subject Attendance Breakdown Cards
  const subX = 710;
  const subW = 1070;
  window.drawCard(ctx, subX, 204, subW, 400, 12);

  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Semester 5 Subject Attendance Breakdown', subX + 30, 240);

  const subjects = [
    { code: 'CS-301', name: 'Distributed Systems', pct: 88.9, attended: '32/36', safe: '+3 classes safe', prof: 'Prof. Arvind Kumar' },
    { code: 'CS-302', name: 'Compiler Design', pct: 84.2, attended: '32/38', safe: '+2 classes safe', prof: 'Dr. Priya Sundaram' },
    { code: 'CS-303', name: 'Computer Networks', pct: 92.1, attended: '35/38', safe: '+6 classes safe', prof: 'Prof. M. Rajesh' }
  ];

  subjects.forEach((sb, sidx) => {
    const sby = 270 + sidx * 100;
    window.drawCard(ctx, subX + 30, sby, subW - 60, 84, 8, '#F8FAFC', T.border, false);

    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.fillStyle = T.brandBlue;
    ctx.fillText(sb.code, subX + 50, sby + 32);

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText(sb.name, subX + 130, sby + 32);

    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText(sb.prof, subX + 130, sby + 58);

    // Percentage & Safe Pill
    ctx.font = '800 20px "JetBrains Mono", monospace';
    ctx.fillStyle = T.statusGreen;
    ctx.textAlign = 'right';
    ctx.fillText(sb.pct + '%', subX + subW - 80, sby + 34);

    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText(sb.attended + '  (' + sb.safe + ')', subX + subW - 80, sby + 58);
    ctx.textAlign = 'left';
  });

  // Bottom Panel: Assignment Submission with Cryptographic Proof
  const assignY = 624;
  window.drawCard(ctx, 140, assignY, 1640, 376, 12);

  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Coursework & Cryptographic Submission Verification', 170, assignY + 40);

  // File Dropzone Box
  const isDropped = (relT > 10.4);
  const dropW = 760;
  window.drawCard(ctx, 170, assignY + 60, dropW, 250, 10, isDropped ? '#F0FDF4' : '#F8FAFC', isDropped ? T.statusGreen : '#CBD5E1');

  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText(isDropped ? '✓ CS301_Lab4_DistributedConsensus.pdf (2.4 MB)' : 'Drag and Drop Coursework Assignment File', 200, assignY + 110);

  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('TARGET: CS-301 LAB 4 • REPLICATION PROTOCOLS • DUE: OCT 30, 11:59 PM', 200, assignY + 140);

  // Submit button
  const isSubmitted = (relT > 11.8);
  window.drawRoundedRect(ctx, 200, assignY + 180, 260, 44, 22);
  ctx.fillStyle = isSubmitted ? T.statusGreen : T.brandBlue;
  ctx.fill();

  ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(isSubmitted ? '✓ SUBMISSION COMMITTED' : 'Submit Assignment File →', 330, assignY + 207);
  ctx.textAlign = 'left';

  // Right Side: Cryptographic Verification Receipt
  const receiptX = 970;
  const receiptW = 780;
  window.drawCard(ctx, receiptX, assignY + 60, receiptW, 250, 10, '#0F172A', 'transparent');

  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('CRYPTOGRAPHIC PROOF OF SUBMISSION (IMMUTABLE AUDIT TRAIL)', receiptX + 30, assignY + 95);

  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('HASH ALGORITHM: SHA-256 (NIST FIPS 180-4)', receiptX + 30, assignY + 125);

  ctx.fillStyle = '#34D399';
  ctx.fillText('RECEIPT: sha256:0x8f4d92a1c7e6b54023de91b7a2d3c940', receiptX + 30, assignY + 155);
  ctx.fillText('         e814fa5b67c19a023bd78e51a2389cf4', receiptX + 30, assignY + 175);

  ctx.fillStyle = '#E2E8F0';
  ctx.fillText('TIMESTAMP: 2026-10-30T10:42:18.491Z • BLOCK STATUS: CONFIRMED', receiptX + 30, assignY + 215);

  ctx.restore();
};

/** SCENE 07: Grounded AI Academic Assistant (01:18 – 01:36 | 18.0s) */
window.renderScene07 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 78.0; // 0.0 to 18.0s

  window.drawCanvasBackground(ctx, t);
  window.drawUniversalHeader(ctx, t, 'Capabilities');

  ctx.save();
  // Section Header
  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.textAlign = 'center';
  ctx.fillText('Grounded AI Academic Assistant', 960, 126);

  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('Deterministic 5-stage pipeline with strict database tool-calling and zero hallucinations', 960, 154);
  ctx.textAlign = 'left';

  // 5-STAGE HORIZONTAL PIPELINE
  const STAGES = [
    { num: '01', title: 'User Context', detail: 'Student ID: usr_st_842' },
    { num: '02', title: 'LMS Interface', detail: 'Token & Schema Validated' },
    { num: '03', title: 'AI Orchestrator', detail: 'Intent: ATTENDANCE_QUERY' },
    { num: '04', title: 'RAG & Tool Calling', detail: 'Tool: get_student_attendance' },
    { num: '05', title: 'Verified Output', detail: 'Zero-Hallucination Guardrail' }
  ];

  const pipeY = 186;
  const stageW = 296;
  const stageH = 74;
  const gap = 38;
  const totalPipeW = 5 * stageW + 4 * gap;
  const startX = 960 - totalPipeW / 2;

  STAGES.forEach((stg, si) => {
    const sx = startX + si * (stageW + gap);
    const isActive = (relT > (5.0 + si * 1.5));
    const isCurrent = (relT >= (5.0 + si * 1.5) && relT < (6.5 + si * 1.5));

    window.drawCard(ctx, sx, pipeY, stageW, stageH, 8, isActive ? (isCurrent ? '#EFF6FF' : '#FFFFFF') : '#F8FAFC', isActive ? T.brandBlue : T.border);

    ctx.font = '800 13px "JetBrains Mono", monospace';
    ctx.fillStyle = isActive ? T.brandBlue : T.textMuted;
    ctx.fillText(`STAGE ${stg.num}`, sx + 16, pipeY + 28);

    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText(stg.title, sx + 92, pipeY + 28);

    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillStyle = isActive ? T.textSecondary : T.textMuted;
    ctx.fillText(stg.detail, sx + 16, pipeY + 54);

    // Horizontal arrow connecting to next stage
    if (si < 4) {
      const ax = sx + stageW;
      ctx.strokeStyle = isActive ? T.brandBlue : '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax + 8, pipeY + stageH / 2);
      ctx.lineTo(ax + gap - 8, pipeY + stageH / 2);
      ctx.stroke();

      // Arrowhead
      ctx.fillStyle = isActive ? T.brandBlue : '#CBD5E1';
      ctx.beginPath();
      ctx.moveTo(ax + gap - 8, pipeY + stageH / 2);
      ctx.lineTo(ax + gap - 16, pipeY + stageH / 2 - 4);
      ctx.lineTo(ax + gap - 16, pipeY + stageH / 2 + 4);
      ctx.closePath();
      ctx.fill();
    }
  });

  // Dark Stage Execution Inspector (Tool Calling Inspection)
  const inspY = 284;
  const inspW = 1640;
  window.drawCard(ctx, 140, inspY, inspW, 360, 10, '#0F172A', 'transparent');

  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('DATABASE TOOL EXECUTION INSPECTOR — STAGE 04 (PRISMA DATABASE TOOL)', 170, inspY + 36);

  // Syntax highlighted JSON block
  const lines = [
    { text: '1  {', color: '#94A3B8' },
    { text: '2    "action": "TOOL_INVOCATION",', color: '#CBD5E1' },
    { text: '3    "tool": "get_student_attendance",', color: '#38BDF8' },
    { text: '4    "parameters": { "studentId": "usr_st_842", "term": "FALL_2026" },', color: '#34D399' },
    { text: '5    "databaseResponse": {', color: '#CBD5E1' },
    { text: '6      "studentName": "Amirtha Varsshan",', color: '#FCD34D' },
    { text: '7      "classesAttended": 76,  "classesTotal": 88,  "percentage": 86.36,', color: '#38BDF8' },
    { text: '8      "institutionThreshold": 75.0,  "safeMargin": 5,  "complianceStatus": "SAFE"', color: '#34D399' },
    { text: '9    },', color: '#CBD5E1' },
    { text: '10   "guardrailVerification": { "hallucinationScore": 0.000, "sourceGrounding": "CONFIRMED" }', color: '#34D399' },
    { text: '11 }', color: '#94A3B8' }
  ];

  lines.forEach((ln, lidx) => {
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = ln.color;
    ctx.fillText(ln.text, 170, inspY + 70 + lidx * 25);
  });

  // Student AI Chat Container
  const chatY = 668;
  const chatW = 1640;
  window.drawCard(ctx, 140, chatY, chatW, 332, 12);

  // User Question Bubble (Typed out)
  const fullPrompt = 'What is my current attendance, and how many classes can I safely miss?';
  const charsCount = Math.min(fullPrompt.length, Math.floor(Math.max(0, (relT - 1.2) * 26)));
  const typedText = fullPrompt.substring(0, charsCount);

  window.drawCard(ctx, 170, chatY + 24, chatW - 60, 60, 8, '#EFF6FF', T.brandBlue, false);
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.brandBlue;
  ctx.fillText('Student Question:', 190, chatY + 58);

  ctx.fillStyle = T.navyDark;
  ctx.fillText(typedText + (charsCount < fullPrompt.length ? '▍' : ''), 330, chatY + 58);

  // Verified AI Assistant Response Card
  if (relT > 12.0) {
    const respY = chatY + 104;
    window.drawCard(ctx, 170, respY, chatW - 60, 180, 8, '#F0FDF4', 'rgba(5, 150, 105, 0.4)', false);

    // Verified Badge
    window.drawBadge(ctx, 190, respY + 36, '✓ SOURCE-VERIFIED RESPONSE • DATABASE-GROUNDED', 'success');

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#065F46';
    ctx.fillText('Your overall attendance is 86.4% (76 out of 88 classes attended).', 190, respY + 84);

    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#064E3B';
    ctx.fillText('With the college mandatory requirement at 75.0%, you can safely miss up to 5 more classes without dropping below compliance.', 190, respY + 116);

    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#059669';
    ctx.fillText('DATA VERIFIED VIA PRISMA ORM AT 2026-10-30T10:42:19Z • QUERY ID: qry_att_84920', 190, respY + 150);
  }

  ctx.restore();
};

/** SCENE 08: Engineered as a Connected System (01:36 – 01:48 | 12.0s) */
window.renderScene08 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 96.0; // 0.0 to 12.0s

  window.drawCanvasBackground(ctx, t);
  window.drawUniversalHeader(ctx, t, 'Architecture');

  ctx.save();
  // Section Header
  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.textAlign = 'center';
  ctx.fillText('Engineered as a Connected System', 960, 130);

  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('5-Layer production architecture: Zero-trust RBAC, transaction-pooled PostgreSQL, edge deployment', 960, 160);
  ctx.textAlign = 'left';

  // 5 ARCHITECTURE STACK TIERS
  const LAYERS = [
    { num: 'LAYER 01', name: 'FRONTEND & INTERFACE', tech: 'React 19 · Vite 8 · TypeScript · Redux Toolkit · Tailwind CSS', color: '#004AC6' },
    { num: 'LAYER 02', name: 'BACKEND FOR FRONTEND (BFF)', tech: 'Node.js 24 · Express 4 REST API · Strict Validation Middleware', color: '#2563EB' },
    { num: 'LAYER 03', name: 'AUTHENTICATION & RBAC', tech: 'Firebase Auth · Firebase Admin SDK · Token Verification Claims', color: '#0284C7' },
    { num: 'LAYER 04', name: 'DATA & PERSISTENCE', tech: 'Prisma ORM 5.22 · Supabase PostgreSQL · PgBouncer Pooler', color: '#059669' },
    { num: 'LAYER 05', name: 'DEPLOYMENT & RUNTIME', tech: 'Vercel Serverless Functions · Global Edge CDN · SPA Routing', color: '#D97706' }
  ];

  const layerW = 1200;
  const layerH = 96;
  const startY = 210;
  const gapY = 124;

  // Draw vertical data flow bus line
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(960, startY + 40);
  ctx.lineTo(960, startY + 4 * gapY + 50);
  ctx.stroke();
  ctx.setLineDash([]);

  // Traveling request/response data packet
  const packetProgress = (relT * 0.35) % 1.0;
  const packetY = startY + 40 + packetProgress * (4 * gapY);
  ctx.fillStyle = T.telemetryCyan;
  ctx.beginPath();
  ctx.arc(960, packetY, 8, 0, Math.PI * 2);
  ctx.fill();

  LAYERS.forEach((lyr, li) => {
    const ly = startY + li * gapY;
    const isLit = (relT > (1.0 + li * 1.6));

    window.drawCard(ctx, 960 - layerW / 2, ly, layerW, layerH, 10, isLit ? '#FFFFFF' : '#F8FAFC', isLit ? lyr.color : T.border);

    // Left accent pill
    ctx.fillStyle = lyr.color;
    window.drawRoundedRect(ctx, 960 - layerW / 2, ly, 8, layerH, 4);
    ctx.fill();

    // Layer Number & Name
    ctx.font = '800 12px "JetBrains Mono", monospace';
    ctx.fillStyle = lyr.color;
    ctx.fillText(lyr.num, 960 - layerW / 2 + 30, ly + 36);

    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText(lyr.name, 960 - layerW / 2 + 130, ly + 36);

    // Tech Stack list
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText(lyr.tech, 960 - layerW / 2 + 30, ly + 72);

    window.drawBadge(ctx, 960 + layerW / 2 - 160, ly + 46, 'VERIFIED PASS', 'success');
  });

  ctx.restore();
};

/** SCENE 09: Secure Access and Seamless Experience (01:48 – 01:56 | 8.0s) */
window.renderScene09 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 108.0; // 0.0 to 8.0s

  window.drawCanvasBackground(ctx, t);
  const isSignInHovered = (relT >= 0.8 && relT <= 2.0);
  window.drawUniversalHeader(ctx, t, 'Overview', isSignInHovered ? 'signin' : null);

  ctx.save();
  // Frosted Modal Backdrop
  ctx.fillStyle = 'rgba(11, 28, 48, 0.45)';
  ctx.fillRect(0, 72, 1920, 1008);

  // Central Sign-in Modal Card
  const modalW = 540;
  const modalH = 580;
  const mx = 960 - modalW / 2;
  const my = 260;

  window.drawCard(ctx, mx, my, modalW, modalH, 16, '#FFFFFF', T.border);

  // Brand Mark in Modal Header
  drawBrandMark(ctx, 960, my + 64, 30, t * 0.5);

  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.textAlign = 'center';
  ctx.fillText('Sign In to Aura Academia', 960, my + 128);

  ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('Institutional Zero-Trust Authentication Gateway', 960, my + 154);

  // Email Input Field
  const inpY = my + 190;
  ctx.textAlign = 'left';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('INSTITUTIONAL EMAIL', mx + 40, inpY);

  window.drawCard(ctx, mx + 40, inpY + 12, modalW - 80, 52, 8, '#F8FAFC', T.border, false);
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('a.varsshan@biher.edu', mx + 56, inpY + 44);

  // Password Input Field
  const passY = inpY + 88;
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('AUTHENTICATION TOKEN / SECRET', mx + 40, passY);

  window.drawCard(ctx, mx + 40, passY + 12, modalW - 80, 52, 8, '#F8FAFC', T.border, false);
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('••••••••••••••••••••', mx + 56, passY + 45);

  // Sign In CTA Button
  const btnY = passY + 88;
  const isSubmitting = (relT > 3.8);
  window.drawRoundedRect(ctx, mx + 40, btnY, modalW - 80, 52, 26);
  ctx.fillStyle = isSubmitting ? T.statusGreen : T.brandBlue;
  ctx.fill();

  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(isSubmitting ? '✓ TOKEN VERIFIED' : 'Sign In to Workspace →', 960, btnY + 32);

  // Authentication Toast & Workspace Routing
  if (isSubmitting) {
    const toastY = my + 480;
    window.drawCard(ctx, mx + 40, toastY, modalW - 80, 68, 8, '#ECFDF5', 'rgba(5, 150, 105, 0.3)', false);
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#065F46';
    ctx.fillText('ROLE RESOLVED: STUDENT', 960, toastY + 28);
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText('Initializing Authorized Student Command Center...', 960, toastY + 50);
  }

  ctx.restore();
};

/** SCENE 10: Final Brand Lockup (01:56 – 02:00 | 4.0s) */
window.renderScene10 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 116.0; // 0.0 to 4.0s

  window.drawCanvasBackground(ctx, t);

  ctx.save();
  const centerY = 460;

  // Master Brand Mark in slow elegant rotation
  const rot = relT * 0.3;
  window.drawBrandMark(ctx, 960, centerY - 80, 92, rot);

  // Main Logotype: AURA ACADEMIA
  ctx.font = '800 68px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.textAlign = 'center';
  ctx.fillText('AURA ACADEMIA', 960, centerY + 90);

  // Tagline: Your College. One Intelligent Platform.
  ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('Your College. One Intelligent Platform.', 960, centerY + 140);

  // Five Administrative Tiers Final Ribbon
  const tiers = 'SUPER ADMIN   •   COLLEGE ADMIN   •   HOD   •   FACULTY   •   STUDENT';
  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.fillStyle = T.brandBlue;
  ctx.fillText(tiers, 960, centerY + 210);

  // Clean, serene final hold
  ctx.restore();
};
