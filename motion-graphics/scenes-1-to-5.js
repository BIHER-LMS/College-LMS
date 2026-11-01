// ─────────────────────────────────────────────────────────────────────────────
// AURA ACADEMIA MOTION GRAPHICS — SCENES 01 TO 05 (00:00 – 01:02 | 62.0s)
// ─────────────────────────────────────────────────────────────────────────────

/** SCENE 01: The Brand Reveal & Universal Header (00:00 – 00:09 | 9.0s) */
window.renderScene01 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t; // 0.0 to 9.0s

  // Canvas background
  window.drawCanvasBackground(ctx, t);

  // Smooth entrance alpha
  const introAlpha = Math.min(1.0, relT / 1.2);

  // Universal Header slides down
  const headerYOffset = Math.max(0, (1 - Math.min(1.0, relT / 1.5)) * -80);
  ctx.save();
  ctx.translate(0, headerYOffset);
  const isExploreHover = (relT >= 6.0 && relT <= 7.8);
  window.drawUniversalHeader(ctx, t, 'Overview', isExploreHover ? 'explore' : null);
  ctx.restore();

  // Central Brand Reveal
  ctx.save();
  ctx.globalAlpha = introAlpha;
  const centerY = 480;

  // Concentric 3D Brand Mark
  const markSize = 74;
  const rot = relT * 0.45;
  window.drawBrandMark(ctx, 960, centerY - 90, markSize, rot);

  // Category Pill [CONNECTED ACADEMIC INFRASTRUCTURE]
  const pillY = centerY + 18;
  const pillW = 310;
  window.drawRoundedRect(ctx, 960 - pillW / 2, pillY - 14, pillW, 28, 14);
  ctx.fillStyle = T.brandBlueLight;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 74, 198, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillStyle = T.brandBlue;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CONNECTED ACADEMIC INFRASTRUCTURE', 960, pillY + 1);

  // Master Headline: AURA ACADEMIA
  ctx.font = '800 64px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.textAlign = 'center';
  ctx.fillText('AURA ACADEMIA', 960, centerY + 85);

  // Subtitle: Your College. One Intelligent Platform.
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('Your College. One Intelligent Platform.', 960, centerY + 130);

  // Five Administrative Tiers Preview Strip
  const tiers = ['SUPER ADMIN', 'COLLEGE ADMIN', 'HEAD OF DEPARTMENT', 'FACULTY', 'STUDENT'];
  const stripW = 860;
  const stripX = 960 - stripW / 2;
  const stripY = centerY + 200;

  window.drawRoundedRect(ctx, stripX, stripY, stripW, 46, 23);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  tiers.forEach((tier, idx) => {
    const itemX = stripX + 86 + idx * 172;
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = (idx === 0) ? T.brandBlue : T.textSecondary;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tier, itemX, stripY + 23);
    if (idx < 4) {
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText('•', itemX + 86, stripY + 23);
    }
  });

  // Scene transition ripple expand into Scene 02 (after click at 7.1s)
  if (relT > 7.1) {
    const progress = (relT - 7.1) / 1.9;
    const rippleR = progress * 1600;
    ctx.strokeStyle = `rgba(0, 74, 198, ${Math.max(0, (1 - progress) * 0.4)})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(1740, 36, rippleR, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
};

/** SCENE 02: One Platform, Five Administrative Tiers (00:09 – 00:20 | 11.0s) */
window.renderScene02 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 9.0; // 0.0 to 11.0s

  window.drawCanvasBackground(ctx, t);
  window.drawUniversalHeader(ctx, t, 'Modules');

  // Section Header
  ctx.save();
  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.textAlign = 'center';
  ctx.fillText('One Unified Platform. Five Operational Tiers.', 960, 140);

  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('Strict Role-Based Access Control (RBAC) across institutional governance', 960, 172);
  ctx.restore();

  // Vertical Connected Hierarchy Stack
  const TIERS = [
    { id: 'SUPER_ADMIN', role: 'SUPER ADMIN', title: 'Multi-Institution Governance', desc: 'Global platform analytics, multi-tenant college provisioning, immutable audit trails.', tag: '14 Campuses', color: '#004AC6' },
    { id: 'COLLEGE_ADMIN', role: 'COLLEGE ADMIN', title: 'Campus Operations & Academic Setup', desc: 'Department hierarchy, faculty allocation, class scheduling, student admission approvals.', tag: '8 Depts · 4.8k Students', color: '#2563EB' },
    { id: 'HOD', role: 'HEAD OF DEPARTMENT', title: 'Departmental Intelligence', desc: 'Curriculum oversight, faculty workload balancing, attendance surveillance, syllabus progress.', tag: '24 Faculty · 98% Compliance', color: '#0284C7' },
    { id: 'FACULTY', role: 'FACULTY MEMBER', title: 'Classroom Operations & Grading', desc: '1-tap period attendance, course material delivery, continuous assessment marks entry.', tag: 'CS-301 · 45 Students', color: '#059669' },
    { id: 'STUDENT', role: 'STUDENT PORTAL', title: 'Personal Academic Command Center', desc: '86.4% attendance ledger, leave requests, cryptographic assignment submissions, AI assistant.', tag: 'Safe Margin: +5 Classes', color: '#D97706' }
  ];

  const cardW = 960;
  const cardH = 92;
  const startY = 220;
  const spacing = 112;

  // Draw vertical connecting backbone bus line
  ctx.save();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(960, startY + 40);
  ctx.lineTo(960, startY + 4 * spacing + 50);
  ctx.stroke();
  ctx.setLineDash([]);

  // Traveling data packet animation on backbone
  const packetY = startY + ((relT * 0.45) % 1.0) * (4 * spacing + 50);
  ctx.fillStyle = T.telemetryCyan;
  ctx.beginPath();
  ctx.arc(960, packetY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Render 5 Tier Cards
  TIERS.forEach((tier, idx) => {
    const y = startY + idx * spacing;
    const isInspected = (relT >= (1.0 + idx * 1.8) && relT < (2.8 + idx * 1.8));

    ctx.save();
    // Card background
    window.drawCard(ctx, 960 - cardW / 2, y, cardW, cardH, 12, isInspected ? '#F8FAFC' : '#FFFFFF', isInspected ? tier.color : T.border);

    // Left color bar
    ctx.fillStyle = tier.color;
    window.drawRoundedRect(ctx, 960 - cardW / 2, y, 6, cardH, 3);
    ctx.fill();

    // Role badge
    window.drawBadge(ctx, 960 - cardW / 2 + 24, y + 26, tier.role, isInspected ? 'success' : 'info');

    // Title & Description
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.textAlign = 'left';
    ctx.fillText(tier.title, 960 - cardW / 2 + 190, y + 36);

    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText(tier.desc, 960 - cardW / 2 + 190, y + 64);

    // Right metric pill
    const tagW = ctx.measureText(tier.tag).width + 30;
    window.drawRoundedRect(ctx, 960 + cardW / 2 - tagW - 24, y + 28, tagW, 32, 16);
    ctx.fillStyle = isInspected ? T.brandBlueLight : '#F1F5F9';
    ctx.fill();
    ctx.strokeStyle = isInspected ? 'rgba(0, 74, 198, 0.3)' : T.border;
    ctx.stroke();

    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = isInspected ? T.brandBlue : T.navyDark;
    ctx.textAlign = 'center';
    ctx.fillText(tier.tag, 960 + cardW / 2 - tagW / 2 - 24, y + 48);

    ctx.restore();
  });
};

/** SCENE 03: Super Admin & College Admin Workspaces (00:20 – 00:33 | 13.0s) */
window.renderScene03 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 20.0; // 0.0 to 13.0s

  window.drawCanvasBackground(ctx, t);
  window.drawUniversalHeader(ctx, t, 'Modules');

  const inSubWorkspace = (relT > 4.2); // Transitions from Super Admin to College Admin
  ctx.save();

  if (!inSubWorkspace) {
    // ── SUPER ADMIN DASHBOARD VIEW ──
    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.textAlign = 'left';
    ctx.fillText('Super Admin: Multi-Institution Infrastructure', 140, 130);

    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText('Global governance across all enrolled autonomous institutions and university colleges', 140, 160);

    // 4 Top Metric Tiles
    const stats = [
      { label: 'AFFILIATED COLLEGES', val: '14', sub: '+2 Pending Review', type: 'info' },
      { label: 'ACTIVE ENROLLED STUDENTS', val: '48,250', sub: '99.4% Verified Identity', type: 'success' },
      { label: 'FACULTY & STAFF', val: '3,120', sub: 'Active Duty in 82 Depts', type: 'info' },
      { label: 'SYSTEM RELIABILITY', val: '99.99%', sub: 'Edge PgBouncer Latency < 4ms', type: 'success' }
    ];

    stats.forEach((st, i) => {
      const sx = 140 + i * 420;
      window.drawCard(ctx, sx, 190, 390, 100, 12);
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = T.textMuted;
      ctx.fillText(st.label, sx + 20, 220);

      ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = T.brandBlue;
      ctx.fillText(st.val, sx + 20, 256);

      ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = (st.type === 'success') ? T.statusGreen : T.textSecondary;
      ctx.fillText(st.sub, sx + 20, 276);
    });

    // College Registry Card (Click target: BIHER)
    const cardY = 320;
    const isBIHERHovered = (relT >= 2.5 && relT <= 4.2);
    window.drawCard(ctx, 140, cardY, 1640, 680, 14, '#FFFFFF', isBIHERHovered ? T.activeBlue : T.border);

    // Section title inside card
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText('Enrolled Institutions Directory (Multi-Tenant)', 170, cardY + 40);

    // Institution Item: BIHER
    const rowY = cardY + 70;
    window.drawCard(ctx, 170, rowY, 1580, 110, 10, isBIHERHovered ? '#EFF6FF' : '#F8FAFC', isBIHERHovered ? T.activeBlue : T.border);

    // University Logo Badge
    drawBrandMark(ctx, 220, rowY + 55, 26, t * 0.5);

    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText('Bharath Institute of Higher Education and Research (BIHER)', 270, rowY + 46);

    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText('CODE: BIHER-TN-2026 • 8 DEPARTMENTS • 4,850 STUDENTS • STATUS: VERIFIED AUTONOMOUS', 270, rowY + 74);

    window.drawBadge(ctx, 1580, rowY + 55, 'ACTIVE PRODUCTION', 'success');

  } else {
    // ── COLLEGE ADMIN WORKSPACE VIEW (BIHER) ──
    const animX = Math.max(0, (1 - Math.min(1.0, (relT - 4.2) / 0.6)) * 40);
    ctx.translate(animX, 0);

    // Top Breadcrumb Banner
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillStyle = T.brandBlue;
    ctx.fillText('COLLEGE ADMIN PORTAL  /  BHARATH INSTITUTE OF HIGHER EDUCATION & RESEARCH', 140, 126);

    ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText('Academic Setup & Departmental Management', 140, 160);

    // Sidebar Navigation (Left)
    window.drawCard(ctx, 140, 190, 280, 810, 12);
    const navItems = [
      { name: 'College Profile', count: '' },
      { name: 'Departments', count: '8', active: true },
      { name: 'Academic Batches', count: '4' },
      { name: 'Class Schedule', count: '32' },
      { name: 'Faculty Allocation', count: '124' },
      { name: 'Student Approvals', count: '8', alert: true }
    ];

    navItems.forEach((item, idx) => {
      const iy = 210 + idx * 56;
      if (item.active) {
        window.drawRoundedRect(ctx, 152, iy, 256, 44, 8);
        ctx.fillStyle = T.brandBlueLight;
        ctx.fill();
      }
      ctx.font = item.active ? '700 14px "Plus Jakarta Sans", sans-serif' : '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = item.active ? T.brandBlue : T.textPrimary;
      ctx.fillText(item.name, 170, iy + 27);

      if (item.count) {
        window.drawBadge(ctx, 350, iy + 22, item.count, item.alert ? 'danger' : 'info');
      }
    });

    // Main Content: Departments Matrix
    const deptW = 1330;
    const deptX = 450;
    window.drawCard(ctx, deptX, 190, deptW, 810, 12);

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText('Configured Departments (Autonomous Faculty Roster)', deptX + 30, 230);

    // Highlighted Department Card: CSE
    const cseY = 260;
    window.drawCard(ctx, deptX + 30, cseY, deptW - 60, 220, 10, '#EFF6FF', T.brandBlue);

    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.brandBlue;
    ctx.fillText('Department of Computer Science & Engineering (CSE)', deptX + 60, cseY + 45);

    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText('Head of Department: Dr. S. Ramanathan, Ph.D. • Faculty: 24 Members • Active Batches: 4', deptX + 60, cseY + 76);

    // Class Section Pill Breakdown
    const classes = [
      { name: 'Batch 2023-2027 (Year 3)', sec: 'Section A: 45 Students', hod: 'Assigned: CS-301 Distributed Systems' },
      { name: 'Batch 2024-2028 (Year 2)', sec: 'Section B: 48 Students', hod: 'Assigned: CS-204 Data Structures' }
    ];

    classes.forEach((cl, ci) => {
      const cy = cseY + 105 + ci * 48;
      window.drawCard(ctx, deptX + 60, cy, deptW - 120, 42, 6, '#FFFFFF', T.border, false);
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillStyle = T.navyDark;
      ctx.fillText(cl.name, deptX + 80, cy + 25);
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = T.textSecondary;
      ctx.fillText(cl.sec + '  •  ' + cl.hod, deptX + 380, cy + 25);
    });

    // Verification Queue preview at bottom
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText('Pending Student Verification Queue (8 Requests)', deptX + 30, 520);

    window.drawCard(ctx, deptX + 30, 550, deptW - 60, 80, 8, '#FFFFFF', T.border);
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Amirtha Varsshan (Reg # 2023CS1042) • Computer Science & Eng Year 3 • Biometric KYC Complete', deptX + 60, 595);
    window.drawBadge(ctx, deptX + deptW - 220, 590, 'APPROVE ENROLLMENT', 'success');
  }

  ctx.restore();
};

/** SCENE 04: HOD: Departmental Intelligence (00:33 – 00:46 | 13.0s) */
window.renderScene04 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 33.0; // 0.0 to 13.0s

  window.drawCanvasBackground(ctx, t);
  window.drawUniversalHeader(ctx, t, 'Modules');

  // Sovereign Departmental Boundary Header
  ctx.save();
  window.drawCard(ctx, 140, 110, 1640, 80, 10, '#004AC6', 'transparent');
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#93C5FD';
  ctx.fillText('SOVEREIGN DEPARTMENTAL WORKSPACE  /  AUTONOMOUS INSTITUTION BOUNDARY', 170, 138);

  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Department of Computer Science & Engineering • Dr. S. Ramanathan, HOD', 170, 168);

  window.drawBadge(ctx, 1600, 150, 'CURRICULUM COMPLIANT: 98.4%', 'success');

  // 4 Top Intelligence Cards
  const cards = [
    { title: 'FACULTY STRENGTH', val: '24 / 24', sub: '100% Workload Allocated' },
    { title: 'DEPT ATTENDANCE', val: '88.2%', sub: '2 Critical Flags (< 75%)' },
    { title: 'SYLLABUS PROGRESS', val: '74.6%', sub: 'Target: 70% by Week 10' },
    { title: 'AUDIT HASH', val: '0x4e29...c1', sub: 'Prisma Ledger Synced' }
  ];

  cards.forEach((cd, ci) => {
    const cx = 140 + ci * 420;
    window.drawCard(ctx, cx, 210, 390, 96, 10);
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = T.textMuted;
    ctx.fillText(cd.title, cx + 20, 238);

    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = (ci === 1 && cd.sub.includes('Critical')) ? T.warningAmber : T.brandBlue;
    ctx.fillText(cd.val, cx + 20, 270);

    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText(cd.sub, cx + 20, 290);
  });

  // Main Split: Faculty Workload Balancing (Left) & Curriculum Compliance (Right)
  // Left Panel: Faculty Workload Distribution Chart
  const leftW = 1000;
  window.drawCard(ctx, 140, 330, leftW, 670, 12);

  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Faculty Workload Balancing Matrix (Teaching Hours / Week)', 170, 370);

  const facultyData = [
    { name: 'Prof. Arvind Kumar', role: 'Assoc. Professor', subject: 'CS-301 Distributed Systems', hrs: 16, max: 18, active: true },
    { name: 'Dr. Priya Sundaram', role: 'Professor', subject: 'CS-302 Compiler Design', hrs: 14, max: 18 },
    { name: 'Prof. M. Rajesh', role: 'Asst. Professor', subject: 'CS-303 Computer Networks', hrs: 18, max: 18 },
    { name: 'Dr. Anita Desai', role: 'Professor', subject: 'CS-304 Artificial Intelligence', hrs: 15, max: 18 },
    { name: 'Prof. K. Venkatesh', role: 'Asst. Professor', subject: 'CS-305 Database Systems', hrs: 17, max: 18 }
  ];

  facultyData.forEach((fac, fi) => {
    const fy = 410 + fi * 92;
    const isSelected = (fac.active && relT > 4.0);
    window.drawCard(ctx, 170, fy, leftW - 60, 80, 8, isSelected ? '#EFF6FF' : '#F8FAFC', isSelected ? T.brandBlue : T.border);

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText(fac.name + ' (' + fac.role + ')', 190, fy + 32);

    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText(fac.subject, 190, fy + 58);

    // Progress Bar
    const barX = 640;
    const barW = 280;
    window.drawRoundedRect(ctx, barX, fy + 35, barW, 14, 7);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();

    const filledW = (fac.hrs / fac.max) * barW;
    window.drawRoundedRect(ctx, barX, fy + 35, filledW, 14, 7);
    ctx.fillStyle = isSelected ? T.activeBlue : T.brandBlue;
    ctx.fill();

    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillStyle = T.navyDark;
    ctx.fillText(`${fac.hrs}/${fac.max}h`, barX + barW + 16, fy + 47);
  });

  // Right Panel: Curriculum Audit & Approval
  const rightX = 1170;
  const rightW = 610;
  window.drawCard(ctx, rightX, 330, rightW, 670, 12);

  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Curriculum Compliance & Approvals', rightX + 30, 370);

  // Approval item
  const appY = 410;
  window.drawCard(ctx, rightX + 30, appY, rightW - 60, 200, 10, '#FFFFFF', T.border);

  ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Syllabus Audit: Distributed Systems (CS-301)', rightX + 50, appY + 40);

  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('All 5 Units verified against Autonomous University Regulation 2026.', rightX + 50, appY + 70);

  // Toggle button
  const isApproved = (relT > 9.2);
  window.drawRoundedRect(ctx, rightX + 50, appY + 110, 220, 42, 21);
  ctx.fillStyle = isApproved ? T.statusGreen : T.brandBlue;
  ctx.fill();

  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(isApproved ? '✓ APPROVED & SIGNED' : 'APPROVE SYLLABUS', rightX + 160, appY + 135);
  ctx.textAlign = 'left';

  ctx.restore();
};

/** SCENE 05: Faculty: Teaching and Classroom Operations (00:46 – 01:02 | 16.0s) */
window.renderScene05 = function(ctx, t) {
  const T = window.DESIGN_TOKENS;
  const relT = t - 46.0; // 0.0 to 16.0s

  window.drawCanvasBackground(ctx, t);
  window.drawUniversalHeader(ctx, t, 'Modules');

  // Faculty Header Banner
  ctx.save();
  window.drawCard(ctx, 140, 110, 1640, 74, 10, '#FFFFFF', T.border);

  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('Prof. Arvind Kumar  •  Department of Computer Science & Engineering', 170, 148);

  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = T.brandBlue;
  ctx.fillText('CLASSROOM OPERATIONS  •  TODAY: THURSDAY, PERIOD 2 (10:00 AM – 10:50 AM)', 170, 172);

  window.drawBadge(ctx, 1620, 146, 'LECTURE HALL 302', 'info');

  // Active Session Card
  window.drawCard(ctx, 140, 204, 1640, 80, 10, '#EFF6FF', T.brandBlue);
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.brandBlue;
  ctx.fillText('CS-301: Distributed Systems — Section A (Enrolled: 45 Students)', 170, 240);

  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.textSecondary;
  ctx.fillText('Unit 3: Paxos Consensus & Fault-Tolerant State Machine Replication', 170, 264);

  // 1-Tap Period Attendance Roster Table
  const tableY = 304;
  window.drawCard(ctx, 140, tableY, 1640, 696, 12);

  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = T.navyDark;
  ctx.fillText('1-Tap Attendance Matrix (Period 2: 10:00 AM)', 170, tableY + 40);

  // Table Columns Header
  const colY = tableY + 70;
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = T.textMuted;
  ctx.fillText('ROLL NUMBER', 180, colY);
  ctx.fillText('STUDENT FULL NAME', 360, colY);
  ctx.fillText('REGISTER NO', 780, colY);
  ctx.fillText('CURRENT ATTENDANCE', 1040, colY);
  ctx.fillText('PERIOD 2 STATUS', 1420, colY);

  const students = [
    { roll: '23CS01', name: 'Aakash Sharma', reg: '2023CS1001', pct: '88.4%', status: 'Present' },
    { roll: '23CS02', name: 'Abhinav Patel', reg: '2023CS1002', pct: '92.1%', status: 'Present' },
    { roll: '23CS03', name: 'Aditi Nair', reg: '2023CS1003', pct: '74.2%', status: (relT > 8.8) ? 'Absent' : 'Present', flag: true },
    { roll: '23CS04', name: 'Amirtha Varsshan', reg: '2023CS1042', pct: '86.4%', status: 'Present', highlight: true },
    { roll: '23CS05', name: 'Ananya Roy', reg: '2023CS1005', pct: '90.5%', status: 'Present' }
  ];

  students.forEach((st, idx) => {
    const sy = colY + 20 + idx * 72;
    const isPresent = (st.status === 'Present');
    window.drawCard(ctx, 160, sy, 1600, 60, 8, st.highlight ? '#F0FDF4' : '#F8FAFC', st.highlight ? T.statusGreen : T.border, false);

    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.fillStyle = T.navyDark;
    ctx.fillText(st.roll, 180, sy + 35);

    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = T.navyDark;
    ctx.fillText(st.name, 360, sy + 35);

    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = T.textSecondary;
    ctx.fillText(st.reg, 780, sy + 35);

    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.fillStyle = st.flag ? T.warningAmber : T.brandBlue;
    ctx.fillText(st.pct, 1040, sy + 35);

    // 1-Tap Toggle Pill
    const pillX = 1420;
    window.drawRoundedRect(ctx, pillX, sy + 14, 110, 32, 16);
    ctx.fillStyle = isPresent ? T.statusGreenBg : T.criticalRedBg;
    ctx.fill();
    ctx.strokeStyle = isPresent ? 'rgba(5, 150, 105, 0.4)' : 'rgba(220, 38, 38, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillStyle = isPresent ? T.statusGreen : T.criticalRed;
    ctx.textAlign = 'center';
    ctx.fillText(st.status.toUpperCase(), pillX + 55, sy + 34);
    ctx.textAlign = 'left';
  });

  // Submit Attendance Session Button (at bottom right)
  const isSubmitted = (relT > 11.4);
  const btnX = 1380;
  const btnY = tableY + 580;
  window.drawRoundedRect(ctx, btnX, btnY, 360, 48, 24);
  ctx.fillStyle = isSubmitted ? T.statusGreen : T.brandBlue;
  ctx.fill();

  ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(isSubmitted ? '✓ SESSION COMMITTED TO PRISMA' : 'Submit Attendance Session →', btnX + 180, btnY + 29);
  ctx.textAlign = 'left';

  // Real-time Success Notification Toast
  if (isSubmitted) {
    const toastAlpha = Math.min(1.0, (relT - 11.4) / 0.5);
    ctx.globalAlpha = toastAlpha;
    window.drawCard(ctx, 640, 920, 640, 56, 12, '#064E3B', 'transparent');
    ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ECFDF5';
    ctx.textAlign = 'center';
    ctx.fillText('✓ Period 2 Attendance Recorded • 42 Present, 3 Absent • Synced to PostgreSQL Database', 960, 953);
    ctx.textAlign = 'left';
  }

  ctx.restore();
};
