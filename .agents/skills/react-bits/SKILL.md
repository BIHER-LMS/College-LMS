---
name: react-bits
description: "Use this skill when users want to browse, select, install, or customize React Bits components (215+ animated components and backgrounds for React) in React/Next.js/Vite projects using shadcn CLI or jsrepo. Covers text animations, cursor interactions, cards, galleries, micro-interactions, and shader/particle backgrounds."
metadata:
  short-description: "Animated React components and backgrounds from React Bits"
license: "MIT + Commons Clause"
---

# React Bits Integration Guide

React Bits is a collection of 215+ animated components and backgrounds for React, built with Tailwind CSS, standard CSS, Framer Motion (`motion`), and Three.js/WebGL shaders.

## Supported Integration Methods

React Bits is a **component library / registry** rather than a standalone agent package. Do NOT clone the full React Bits documentation website into project skills. Instead, integrate React Bits directly using the official methods:

### 1. shadcn CLI Installation (Recommended)

React Bits natively integrates with the `shadcn` registry. The component name suffix specifies the variant:
- `JS` or `TS` (JavaScript vs TypeScript)
- `CSS` or `TW` (Vanilla CSS vs Tailwind CSS)

```bash
# Add a component using shadcn CLI
npx shadcn@latest add @react-bits/<ComponentName>-<Language>-<Styling>

# Examples:
npx shadcn@latest add @react-bits/SplitText-TS-TW
npx shadcn@latest add @react-bits/DecryptedText-TS-TW
npx shadcn@latest add @react-bits/BlobCursor-TS-TW
npx shadcn@latest add @react-bits/SpotlightCard-TS-TW
npx shadcn@latest add @react-bits/Aurora-TS-TW
```

### 2. Registry Configuration in `components.json`

Add the `@react-bits` registry to your project's `components.json` to allow your agent and the shadcn CLI to auto-resolve React Bits components:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "registries": {
    "@react-bits": "https://reactbits.dev/r/{name}.json"
  }
}
```

### 3. Alternative: `jsrepo` CLI

You can also use `jsrepo` to install components directly from the web endpoint:

```bash
npx jsrepo@latest add https://reactbits.dev/r/SplitText-TS-TW
```

### 4. Claude Code MCP Integration

To enable live querying of shadcn and React Bits registries via MCP:

```bash
npx shadcn@latest mcp init --client claude
```

## Component Categories & Highlights

| Category | Highlights |
|---|---|
| **Text Animations** | `SplitText`, `BlurText`, `ShinyText`, `DecryptedText`, `TrueFocus`, `VariableProximity`, `WaveText`, `RotatingText`, `CountUp` |
| **Animations / Cursor** | `BlobCursor`, `Magnet`, `FollowCursor`, `ClickSpark`, `SplashCursor`, `PixelTrail`, `StarBorder` |
| **Components / Cards** | `SpotlightCard`, `TiltedCard`, `PixelCard`, `Dock`, `FlowingMenu`, `ElasticSlider`, `InfiniteScroll`, `Masonry`, `Stack` |
| **Micro Interactions** | Animated buttons, theme toggles, status badges, sound-reactive buttons |
| **Backgrounds (Canvas/WebGL)** | `Aurora`, `Hyperspeed`, `Particles`, `Threads`, `Waves`, `GridDistortion`, `Ripple`, `Ballpit`, `LiquidChrome` |

## Prerequisites & Dependencies

Target applications should ensure the following dependencies are installed based on the selected components:

```bash
# Core animation dependencies
npm install motion clsx tailwind-merge

# For WebGL / 3D backgrounds (e.g. Hyperspeed, LiquidChrome, Ballpit)
npm install three @types/three

# For icon-enabled components
npm install lucide-react
```

## Licensing Notice

React Bits is licensed under **MIT + Commons Clause**:
- Free for personal and commercial projects.
- You **cannot** sell, sublicense, or redistribute the components or library itself as a standalone product, UI kit, or commercial component package.
