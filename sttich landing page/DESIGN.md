---
name: Precision Academic Research
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0d1c32'
  on-primary-container: '#76849f'
  inverse-primary: '#b9c7e4'
  secondary: '#4f5e80'
  on-secondary: '#ffffff'
  secondary-container: '#c7d7fe'
  on-secondary-container: '#4e5d7e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002114'
  on-tertiary-container: '#069669'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#b6c6ed'
  on-secondary-fixed: '#091b39'
  on-secondary-fixed-variant: '#374767'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: '1.45'
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.06em
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system frames academic education and rigorous self-directed research as an engineering discipline. It serves serious learners, researchers, and technical professionals who demand focus, density, and institutional trust over gamification or decorative distraction.

The visual style is rooted in Technical Rationalism:
- Zero decorative embellishments, no blur-based glassmorphism, no rounded friendly corners, and zero skeuomorphism.
- Extreme structural precision using hairline borders, architectural grid layouts, and strict geometric proportions.
- An exacting monospace and geometric typographic balance that turns syllabus management, research literature, and lecture notes into a clean, distraction-free analytical environment.
- The interface acts as an authoritative, quiet canvas where content, syntax, and data density carry total visual priority.

## Colors

The color system is strictly architectural and functional, relying on deep maritime navies, surgical paper neutrals, and high-visibility status indicators.

### Surface Hierarchy
- **Canvas Base (`#F8FAFC`):** The primary backdrop for the entire viewport. Provides low eye-fatigue contrast against pure white cards.
- **Surface Elevation (`#FFFFFF`):** Work surfaces, lecture cards, and editor panes sit cleanly on pure white.
- **Muted Section Fill (`#F1F5F9`):** Inset code blocks, data tables headers, and metadata containers.

### Ink Hierarchy
- **Ink Primary (`#0A192F`):** Deepest navy for headlines, dominant labels, and primary interactive states.
- **Ink Body (`#0F172A`):** High-contrast charcoal slate optimized for long-form reading and coursework text.
- **Ink Secondary (`#334155`):** Structural subtitles, form field titles, and secondary list descriptions.
- **Ink Muted (`#64748B`):** Captions, timestamps, table column keys, and empty states.
- **Border Neutral (`#E2E8F0`):** Single-pixel boundary separating structural blocks and data cells.

### Functional Status Indicators
Color is reserved strictly for operational status; it is never used for decorative tinting:
- **Success / Completed (`#059669`):** Submissions accepted, modules passed, milestones verified.
- **Warning / In-Progress (`#D97706`):** Active cohorts, impending schedules, open drafts.
- **Danger / Urgent (`#EF4444`):** Approaching hard deadlines, overdue assignments, system errors.
- **Neutral / Queued (`#64748B`):** Locked prerequisites, unscheduled reading, archived cohorts.

## Typography

Typography establishes an analytical tension between `Space Grotesk` (structural display, sectional indices, academic module titles) and `Geist` (body content, technical code citations, data values, dense syllabus tables).

- **Headlines (`Space Grotesk`):** Tight negative letter-spacing with an engineered geometric cadence. Used strictly for curriculum headers, section dividers, and metrics.
- **Body & Data (`Geist`):** Set at neutral leading for long-form synthesis of papers and reading assignments. Numbers and tabular data must leverage tabular figures (`tnum`) to keep technical statistics aligned across rows.
- **Labeling:** All status badges, module IDs, course codes, and tabular meta-labels utilize `label-sm` with uppercase styling and expanded tracking (`+0.06em`) to function as precision index markers.

## Layout & Spacing

The layout is built upon an uncompromising, rigid 12-column baseline grid designed to maximize horizontal reading efficiency and clean tabular segmentation.

### Layout Mechanics
- **Grid Configuration:** Desktop interfaces employ a 12-column layout (`margin: 3rem`, `gutter: 1.5rem`) constrained to an absolute maximum width of `1440px`. Mobile viewports compress to a 4-column system (`margin: 1.25rem`, `gutter: 1rem`).
- **Rhythm & Alignment:** Spacing strictly adheres to an 8px base factor (`0.25rem`, `0.5rem`, `1rem`, `1.5rem`, `2.5rem`). Whitespace is intentional and tectonic—used to segment distinct computational modules rather than rely on heavy divider art.
- **Density Tiering:** Data-dense academic schedules, course directories, and grading tables use `space-xs` and `space-sm` for intra-component padding, while long-form learning modules deploy `space-lg` and `space-xl` to ensure cognitive decompression during study sessions.

## Elevation & Depth

This system discards multi-tiered blurred dropshadows and translucent glassmorphism entirely. Depth is achieved strictly through planar stacking and hairline boundaries.

### Planar Stacking
- **Flat Elevation (Level 0):** The primary background canvas (`#F8FAFC`).
- **Structural Elevation (Level 1):** Module cards, assignment sidebars, and course content units sit on pure white (`#FFFFFF`) framed by a continuous `1px solid #E2E8F0` border.
- **Transient Elements (Modals, Overlays, Menus):** Overlays retain an opaque white fill (`#FFFFFF`) paired with an intentional, unblurred offset micro-shadow: `0 1px 3px 0 rgba(10, 25, 47, 0.08), 0 1px 1px 0 rgba(10, 25, 47, 0.04)`.
- **Focus & Interaction:** Hover states never elevate upward in 3D space. Instead, surfaces indicate focus via an immediate hairline border shift from `#E2E8F0` to `#0A192F`.

## Shapes

The geometric directive is strictly monolithic and sharp: zero corner radii across the entire system.

- **Corner Radius:** `0px` applied universally across buttons, cards, form inputs, tooltips, dialogs, and badges.
- **Architectural Reference:** Components mimic physical paper indexes, punchcards, and scientific monitors. Clean right angles ensure seamless edge-to-edge docking when creating dense multi-column analytical dashboards.
- **Separators:** Line dividers are uniformly `1px solid` with no soft gradients or fading termination points.

## Components

### Buttons
- **Primary:** Filled `#0A192F` background, `#FFFFFF` text, `0px` border radius, `0.75rem 1.25rem` padding. In hover state, transitions immediately to `#112240` with no motion or scale transformation.
- **Secondary / Outline:** Pure white background, `1px solid #E2E8F0`, `#0A192F` text. In hover state, border snaps to `#0A192F`.
- **Destructive:** Transparent background, `1px solid #EF4444`, text `#EF4444`. On hover, fills with `#EF4444` and text shifts to `#FFFFFF`.

### Cards & Syllabus Modules
- Container: Surface `#FFFFFF`, border `1px solid #E2E8F0`, zero border radius.
- Header Slot: Divided from the card body via a single `1px solid #E2E8F0` rule. Houses module numbering, credit counts, and operational status chips.
- Interaction: On interactive cards, hover triggers a border color transition to `#0A192F`. No translate-Y or lift shadow is permitted.

### Status Chips & Badges
- Construction: `0px` corners, `0.25rem 0.5rem` padding, font `label-sm` uppercase.
- Complete: Background `#ECFDF5`, border `1px solid #059669`, text `#059669`.
- In Progress: Background `#FFFBEB`, border `1px solid #D97706`, text `#D97706`.
- Urgent / Due: Background `#FEF2F2`, border `1px solid #EF4444`, text `#EF4444`.
- Queued / Inactive: Background `#F1F5F9`, border `1px solid #CBD5E1`, text `#64748B`.

### Form Inputs & Select Fields
- Height: Standardized to a rigorous `40px` line.
- Styling: Flat `#FFFFFF` interior, `1px solid #CBD5E1` border, `0px` radius, padding `0.5rem 0.75rem`. Text rendered in `Geist` `body-md` (`#0F172A`).
- Focus State: Replaces ambient glow with a crisp `2px solid #0A192F` outline offset by `0px`.

### Checkboxes & Radios
- Sharp square design (`16px x 16px`) with zero rounded corners.
- Inactive: Background `#FFFFFF`, border `1px solid #94A3B8`.
- Checked: Background `#0A192F`, border `1px solid #0A192F`, containing a high-contrast white check or square glyph.

### Academic Data Tables
- Header: `#F8FAFC` background with a lower border of `1px solid #0A192F`. Column headers rendered in `label-sm` with text color `#64748B`.
- Cells: Bordered bottom `1px solid #E2E8F0`, vertical padding `0.75rem`, horizontal padding `1rem`. All numeric values set in tabular digits.