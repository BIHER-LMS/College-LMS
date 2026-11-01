// ─────────────────────────────────────────────────────────────────────────────
// AURA ACADEMIA MOTION GRAPHICS — DESIGN SYSTEM & DRAWING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

window.DESIGN_TOKENS = {
  bgCanvas: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
  textPrimary: '#0B1C30',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  brandBlue: '#004AC6',
  brandBlueLight: '#EFF6FF',
  activeBlue: '#2563EB',
  telemetryCyan: '#06B6D4',
  telemetryCyanSoft: 'rgba(6, 182, 212, 0.12)',
  statusGreen: '#059669',
  statusGreenBg: '#ECFDF5',
  warningAmber: '#D97706',
  warningAmberBg: '#FFFBEB',
  criticalRed: '#DC2626',
  criticalRedBg: '#FEF2F2',
  navyDark: '#0B1C30'
};

/** Rounded rectangle drawing helper */
window.drawRoundedRect = function(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

/** Technical grid background with soft cyan/blue radial wash */
window.drawCanvasBackground = function(ctx, t, width = 1920, height = 1080) {
  const T = window.DESIGN_TOKENS;
  ctx.fillStyle = T.bgCanvas;
  ctx.fillRect(0, 0, width, height);

  // Soft radiant center glow
  const grad = ctx.createRadialGradient(width / 2, height / 2 - 50, 80, width / 2, height / 2, 850);
  grad.addColorStop(0, 'rgba(0, 74, 198, 0.055)');
  grad.addColorStop(0.55, 'rgba(6, 182, 212, 0.025)');
  grad.addColorStop(1, 'rgba(250, 248, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Technical grid pattern (60px pitch)
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 74, 198, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(y % (gridSize * 4) === 0 ? 0 : 0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Micro coordinate crosshairs at grid intersections
  ctx.fillStyle = 'rgba(0, 74, 198, 0.15)';
  for (let x = 120; x < width; x += 240) {
    for (let y = 120; y < height; y += 240) {
      ctx.fillRect(x - 3, y - 0.5, 6, 1);
      ctx.fillRect(x - 0.5, y - 3, 1, 6);
    }
  }
  ctx.restore();
};

/** Aura Academia Brand Mark with 3D tilt & orbital concentric rings */
window.drawBrandMark = function(ctx, cx, cy, size = 64, rot = 0, opacity = 1.0) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx, cy);

  // Outer orbital glow
  const glow = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 1.4);
  glow.addColorStop(0, 'rgba(0, 74, 198, 0.16)');
  glow.addColorStop(1, 'rgba(0, 74, 198, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Orbital Ring 1 (outer tilted ellipse)
  ctx.save();
  ctx.rotate(rot);
  ctx.strokeStyle = '#004AC6';
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.95, size * 0.52, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  // Satellite particle 1
  ctx.fillStyle = '#06B6D4';
  const p1x = Math.cos(rot * 2) * size * 0.95 * Math.cos(Math.PI / 4) - Math.sin(rot * 2) * size * 0.52 * Math.sin(Math.PI / 4);
  const p1y = Math.cos(rot * 2) * size * 0.95 * Math.sin(Math.PI / 4) + Math.sin(rot * 2) * size * 0.52 * Math.cos(Math.PI / 4);
  ctx.beginPath();
  ctx.arc(p1x, p1y, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Orbital Ring 2 (counter-rotating tilted ellipse)
  ctx.save();
  ctx.rotate(-rot * 1.3);
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = size * 0.035;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.82, size * 0.44, -Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Central Core Prism
  const coreGrad = ctx.createLinearGradient(-size * 0.35, -size * 0.35, size * 0.35, size * 0.35);
  coreGrad.addColorStop(0, '#004AC6');
  coreGrad.addColorStop(0.5, '#2563EB');
  coreGrad.addColorStop(1, '#06B6D4');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Core white spark
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-size * 0.08, -size * 0.08, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/** Universal Header Navigation bar (anchored at top, 72px height) */
window.drawUniversalHeader = function(ctx, t, activeTab = 'Overview', highlightBtn = null) {
  const T = window.DESIGN_TOKENS;
  const width = 1920;
  const h = 72;

  ctx.save();
  // Frosted white bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.fillRect(0, 0, width, h);

  // Border bottom
  ctx.strokeStyle = T.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(width, h);
  ctx.stroke();

  // Brand lockup on left
  drawBrandMark(ctx, 48, h / 2, 20, t * 0.6);
  ctx.font = '600 20px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = T.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Aura Academia', 78, h / 2 - 1);

  // Academic LMS Badge
  window.drawRoundedRect(ctx, 230, h / 2 - 11, 108, 22, 11);
  ctx.fillStyle = T.brandBlueLight;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 74, 198, 0.2)';
  ctx.stroke();
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillStyle = T.brandBlue;
  ctx.textAlign = 'center';
  ctx.fillText('ACADEMIC LMS', 284, h / 2 + 1);

  // Center Navigation Tabs
  const navTabs = ['Overview', 'Modules', 'Ecosystem', 'Capabilities', 'Architecture', 'Technology'];
  let tabX = 640;
  navTabs.forEach(tab => {
    const isActive = (tab === activeTab);
    ctx.font = isActive ? '600 14px "Plus Jakarta Sans", sans-serif' : '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isActive ? T.brandBlue : T.textSecondary;
    ctx.textAlign = 'left';
    ctx.fillText(tab, tabX, h / 2);

    if (isActive) {
      ctx.fillStyle = T.brandBlue;
      ctx.fillRect(tabX, h - 3, ctx.measureText(tab).width, 3);
    }
    tabX += 130;
  });

  // Right CTA buttons
  // 1. Sign In button
  const isSignInHovered = (highlightBtn === 'signin');
  window.drawRoundedRect(ctx, 1580, h / 2 - 18, 92, 36, 18);
  ctx.fillStyle = isSignInHovered ? T.surfaceAlt : 'transparent';
  ctx.fill();
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isSignInHovered ? T.brandBlue : T.textPrimary;
  ctx.textAlign = 'center';
  ctx.fillText('Sign In', 1626, h / 2 + 1);

  // 2. Explore LMS Button (Primary)
  const isExploreHovered = (highlightBtn === 'explore');
  const btnW = 142;
  const btnX = 1690;
  window.drawRoundedRect(ctx, btnX, h / 2 - 18, btnW, 36, 18);
  ctx.fillStyle = isExploreHovered ? T.activeBlue : T.brandBlue;
  ctx.fill();
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('Explore LMS →', btnX + btnW / 2, h / 2 + 1);

  ctx.restore();
};

/** Elegant White Card with border and subtle elevation */
window.drawCard = function(ctx, x, y, w, h, radius = 12, fill = '#FFFFFF', stroke = '#E2E8F0', shadow = true) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = 'rgba(11, 28, 48, 0.06)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
  }
  window.drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
};

/** Status badge pill (e.g. Green "Verified", Amber "Pending", Red "Critical") */
window.drawBadge = function(ctx, x, y, text, type = 'info') {
  const T = window.DESIGN_TOKENS;
  let bg = T.brandBlueLight;
  let fg = T.brandBlue;
  let border = 'rgba(0, 74, 198, 0.2)';

  if (type === 'success') {
    bg = T.statusGreenBg;
    fg = T.statusGreen;
    border = 'rgba(5, 150, 105, 0.2)';
  } else if (type === 'warning') {
    bg = T.warningAmberBg;
    fg = T.warningAmber;
    border = 'rgba(217, 119, 6, 0.2)';
  } else if (type === 'danger') {
    bg = T.criticalRedBg;
    fg = T.criticalRed;
    border = 'rgba(220, 38, 38, 0.2)';
  }

  ctx.save();
  ctx.font = '600 11px "JetBrains Mono", monospace';
  const tw = ctx.measureText(text).width;
  const pw = tw + 18;
  const ph = 22;

  window.drawRoundedRect(ctx, x, y - ph / 2, pw, ph, ph / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pw / 2, y + 1);
  ctx.restore();
};
