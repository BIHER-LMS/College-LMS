---
name: motion-primitives
description: "Use this skill when users want to browse, add, and build with Motion Primitives components (UI motion components built on Motion/Framer Motion and Tailwind CSS). Covers accordions, animated groups, dialogs, sliders, text effects, magnetic cursors, and transition panels via the motion-primitives CLI."
metadata:
  short-description: "UI motion components built with Motion and Tailwind CSS"
license: "MIT"
---

# Motion Primitives Integration Guide

Motion Primitives is an open-source (MIT) collection of beautifully designed, composable motion components for React built with [Motion](https://motion.dev/) (formerly Framer Motion) and [Tailwind CSS](https://tailwindcss.com/).

## Supported Integration Methods

Motion Primitives is a **component library / CLI registry** rather than a standalone agent package. Do NOT clone the full Motion Primitives showcase website into project skills. Instead, integrate Motion Primitives using its official CLI or registry endpoints:

### 1. Motion Primitives CLI Installation (Recommended)

Install individual components directly into your project's `components/motion-primitives/` directory:

```bash
# Add a component
npx motion-primitives add <component-name>

# List all available components
npx motion-primitives list

# Add with custom options
npx motion-primitives add text-effect
npx motion-primitives add animated-group
npx motion-primitives add dialog
npx motion-primitives add transition-panel
```

### 2. Official Registry Endpoints

The official registry can be fetched programmatically to inspect schemas, dependencies, and code:
- **Registry index:** `https://raw.githubusercontent.com/ibelick/motion-primitives/main/public/c/registry.json`
- **Component files:** `https://raw.githubusercontent.com/ibelick/motion-primitives/main/public/c/<component-name>.json`

### 3. Prerequisites & Dependencies

Target applications require:
```bash
# Core animation and utility packages
npm install motion lucide-react clsx tailwind-merge
```

Ensure Tailwind CSS is configured in your project (`tailwind.config.js` or Tailwind v4 `@theme`).

## Available Components in Registry

The official Motion Primitives registry includes 33+ components:

| Category | Components |
|---|---|
| **Text Effects** | `text-effect`, `text-loop`, `text-morph`, `text-roll`, `text-scramble`, `text-shimmer`, `text-shimmer-wave` |
| **Containers & Layout** | `animated-background`, `animated-group`, `transition-panel`, `infinite-slider`, `in-view`, `carousel` |
| **Interactive Overlays** | `dialog`, `disclosure`, `popover`, `accordion`, `toolbar` |
| **Feedback & Dynamics** | `border-trail`, `animated-number`, `cursor`, `magnetic`, `glow-effect`, `tilt` |

## Usage Pattern: Composable Motion

Motion Primitives components are designed to be copied directly into your codebase and composed like native primitive React components:

```tsx
import { TextEffect } from '@/components/motion-primitives/text-effect';

export function HeroHeading() {
  return (
    <TextEffect per="word" as="h1" preset="fade-in-blur">
      Unleash dynamic motion with precision
    </TextEffect>
  );
}
```

```tsx
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';

export function FeatureList({ items }) {
  return (
    <AnimatedGroup
      className="grid grid-cols-3 gap-4"
      preset="scale"
    >
      {items.map(item => (
        <div key={item.id} className="p-4 bg-zinc-900 rounded-lg">
          {item.title}
        </div>
      ))}
    </AnimatedGroup>
  );
}
```

## Licensing Notice

Motion Primitives is open-source under the **MIT License**. It is completely free for personal and commercial applications.
