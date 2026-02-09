# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No test framework or linter is configured.

## Architecture

Single-page React 18 portfolio site using Vite + Tailwind CSS. No router — the page is a vertical scroll of sections.

**App.jsx** composes all sections in order: Nav → Hero → About → Skills → Experience → Certifications → Contact → Footer. The `useActiveSection` hook provides scroll-spy for nav highlighting.

### Key layers

- **`src/styles/theme.js`** — Single source of truth for design tokens (colors, fonts). All components import from here rather than hardcoding values. The teal accent (`#3FBDB6`) and dark background (`#0F1419`) define the visual identity.
- **`src/data/`** — Content is separated from presentation. `jobs.js`, `certifications.js`, `skills.js`, and `highlights.js` export arrays/objects consumed by section components. Edit these files to update portfolio content.
- **`src/hooks/`** — `useInView.js` (IntersectionObserver wrapper for scroll-triggered animations) and `useActiveSection.js` (scroll-spy for Nav).
- **`src/components/`** — Section components (Hero, About, Skills, etc.) and reusable primitives (FadeIn, Counter, Particles, SkillBar, TerminalText, CertBadge, TimelineItem).

### Styling approach

Tailwind utility classes for layout/spacing, inline styles referencing `theme.js` tokens for colors and fonts. No CSS modules or styled-components.

### Fonts

Google Fonts (Plus Jakarta Sans, JetBrains Mono) loaded via a `<link>` tag in App.jsx, URL defined in `theme.js`.
