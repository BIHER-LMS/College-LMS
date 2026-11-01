---
name: Academic Infrastructure
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#57dffe'
  on-secondary-container: '#006172'
  tertiary: '#4b5472'
  on-tertiary: '#ffffff'
  tertiary-container: '#636c8c'
  on-tertiary-container: '#eeefff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#bdc5e9'
  on-tertiary-fixed: '#111a36'
  on-tertiary-fixed-variant: '#3d4664'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: -0.003em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system establishes an ultra-precise, mission-critical workspace for higher education. Drawing rigorous execution principles from Stripe, Linear, Apple, and Vercel, the system treats academic management not as casual schoolware, but as sovereign digital infrastructure. The target audience encompasses researchers, department deans, university registrars, faculty leaders, and ambitious students requiring absolute clarity and functional speed.

The design philosophy converges around:
- **Enterprise Academic Fidelity:** Dense, actionable data models with uncompromising hierarchy and zero superfluous decoration.
- **Instrument Precision:** Hairline structural dividers, micro-radii, crisp contrast ratios, and deliberate keyboard-first affordances.
- **Architectural Calm:** Expansive whitespace paired with calibrated typography balances high data density with focus, eliminating cognitive fatigue during prolonged administrative and study sessions.

## Colors

The palette is engineered exclusively for high-clarity daylight environments:
- **Canvas & Surfaces:** Primary canvas relies on absolute white (`#ffffff`), offset by surgical boundary tints (`#f8fafc` for structural sidebars and secondary wells; `#f1f5f9` for table headers, inactive segments, and code blocks).
- **Ink & Typography:** Primary text reads in deep sovereign navy (`#0b132b` to `#0f172a`), bypassing harsh pure black to reduce eye strain while maintaining maximum WCAG AAA legibility. Secondary descriptors settle into muted slate (`#475569`), while tertiary metadata and shortcuts use balanced ash (`#64748b`).
- **Brand & Signal:** Actionable focal points leverage electric blue (`#2563eb`, with `#1d4ed8` on hover/press). Secondary operational accents (e.g., active compute, automated syllabus syncing, live lectures) use vivid cyan (`#06b6d4` and `#38bdf8`).
- **Borders & Dividers:** Spatial separation relies strictly on calibrated hairline stroke boundaries (`#e2e8f0` default, `#cbd5e1` for active or focused boundaries).

## Typography

The typography couples the geometric modernity of **Plus Jakarta Sans** for prominent headers with the utilitarian legibility of **Inter** for dense transactional UI, metrics, and academic text.

- **Headlines:** Set in Plus Jakarta Sans with tightly tracking negative letter spacing. This delivers an authoritative yet refined presence suited for course titles, department overviews, and lecture modules.
- **Body & Data:** Powered by Inter at standard body scales. Features tabular figures (`tnum`) for grade books, course credits, rosters, and timestamped assignment submissions.
- **Code & Identifiers:** Where course codes (e.g., `CS-4420`), API credentials, or institutional identifiers are displayed, use `JetBrains Mono` at label scales for scannability.

## Layout & Spacing

The layout is built on a responsive 12-column grid system designed around a desktop workbench paradigm:
- **Canvas Shell:** Fluid horizontal layout bounded to a max-width of 1600px with fixed collateral navigation. The left navigational sidebar anchors at `260px` fixed width on desktop, collapsing to an icon-rail (`64px`) or an off-canvas drawer on viewport widths below `1024px`.
- **Vertical Rhythm:** Rooted in a strict 4px base increment. Data tables and form layouts utilize tight vertical units (`space-xs`, `space-sm`) to maximize visible information density, while editorial surfaces and syllabus dashboards transition into relaxed breathing space (`space-lg`, `space-xl`).
- **Breakpoints:**
  - **Mobile (< 768px):** 4 columns, `margin: 1rem`, `gutter: 1rem`. Multi-pane views stack into tabbed screens.
  - **Tablet (768px – 1023px):** 8 columns, `margin: 1.5rem`, `gutter: 1.25rem`. Secondary inspection panels collapse into slide-over sheets.
  - **Desktop (≥ 1024px):** 12 columns, `margin: 2rem`, `gutter: 1.5rem`. Full triple-pane capability (primary nav, main content feed, analytical inspector).

## Elevation & Depth

Visual hierarchy rejects exaggerated, cloudy drop shadows in favor of Linear- and Stripe-style precision layered physics:
- **Surface Layering:** Stacking depth is communicated through micro-tinted canvas containers rather than heavy shadows. Level 0 rests on `#ffffff` or `#f8fafc`, Level 1 modules on `#ffffff` with a `#e2e8f0` border, and Level 2 overlays on `#ffffff` accompanied by an ultra-crisp dual-layer contact ring.
- **Precision Outlines:** All interactive panels, inputs, and cards feature a crisp `1px` stroke in `#e2e8f0`. Highlighting and active focus transition to `#2563eb` with an immediate outer ring of `rgba(37, 99, 235, 0.12)` spanning `3px`.
- **Ambient Shadow Token (Overlays Only):** Modals, dropdown menus, and command palettes implement an ambient occlusion shadow: `0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.08)`.
- **Frosted Blur (Navigation Bars & Floating Headers):** Sticky course headers utilize CSS backdrop blur (`12px`) combined with `rgba(255, 255, 255, 0.85)` opacity and a `1px` bottom border in `#e2e8f0`.

## Shapes

This design system uses a restrained corner radius level (`1` - Soft) to project institutional stability and engineering rigor:
- **Controls & Small Elements:** Form inputs, action buttons, chips, and table cells carry a tight `4px` (`0.25rem`) to `6px` radius.
- **Cards & Paneling:** Grade sheets, lecture modules, and administrative cards resolve at `8px` (`0.5rem`).
- **Dialogs & Overlays:** Command interfaces (Linear-style cmd+k modals) and modal sheets cap at `10px` (`0.625rem`).
- **Circular Indicators:** Avatars, academic progress rings, and real-time network statuses retain absolute 50% circular geometry.

## Components

### Buttons
- **Primary:** Solid `#2563eb` fill with `#ffffff` text, 1px subtle inner top border in `rgba(255, 255, 255, 0.2)`. Padding `0.5rem 1rem`, typography `label-md`. Hover state shifts to `#1d4ed8`.
- **Secondary / Neutral:** Crisp `#ffffff` background with `1px solid #e2e8f0`, text `#0f172a`. Hover state switches background to `#f8fafc` and border to `#cbd5e1`.
- **Ghost:** Borderless, text `#475569`, active click reveals `#f1f5f9`. Used for utility toolbars, inline pagination, and icon toggles.

### Inputs & Form Controls
- **Text & Select Fields:** Height 36px (compact desktop) or 40px (default). Background `#ffffff`, border `1px solid #e2e8f0`, radius `6px`. Font `body-md` in `#0f172a`. Focused state activates border `#2563eb` with a 3px ring in `rgba(37, 99, 235, 0.12)`.
- **Checkboxes & Radios:** Scaled to 16px × 16px with a 4px border radius for checkboxes and 50% for radios. Checked state fills `#2563eb` displaying a pure white geometric check or pip.

### Cards & Module Containers
- Solid `#ffffff` background with a mandatory `1px solid #e2e8f0` border. Headers feature a distinct `48px` structural row with subtle bottom border `#f1f5f9` separating titles from data tables and content feeds.
- Padding inside cards adheres to strict `1.25rem` (`20px`). Zero drop shadow on static cards; hovering interactive lecture cards induces a 1px border shift to `#cbd5e1` with a micro-offset `0 2px 4px rgba(15, 23, 42, 0.04)`.

### Badges, Tags & Chips
- Ultra-compact: padding `2px 8px`, border radius `4px`, typography `label-sm` uppercase with `0.03em` tracking.
- Semantic combinations use low-saturation tinted backgrounds with high-contrast text:
  - *Active / Published:* Background `rgba(6, 182, 212, 0.08)`, border `1px solid rgba(6, 182, 212, 0.25)`, text `#0891b2`.
  - *Prerequisite / Pending:* Background `rgba(245, 158, 11, 0.08)`, border `1px solid rgba(245, 158, 11, 0.25)`, text `#b45309`.
  - *Institutional Core:* Background `#f1f5f9`, border `1px solid #e2e8f0`, text `#334155`.

### Academic-Specific Modules
- **Grade & Assessment Ledger:** Monospaced numerical values (`JetBrains Mono`), tight row height (36px), zebra-striping via `#fafafa` alternating states, and strict right-alignment for percentage and GPA figures.
- **Command Palette (Cmd+K):** Centered overlay modal, 640px wide, floating `120px` from viewport top. Deep dark search input accompanied by categorical section dividers (e.g., `Courses`, `Faculty`, `Assignments`, `System`). Keyboard shortcuts explicitly marked via kbd tags styled with `#f1f5f9` fills and `#cbd5e1` outlines.