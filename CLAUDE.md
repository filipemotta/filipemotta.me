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

## Adding a post

Posts live in `src/data/posts.js` and appear in three places, all built from the same `PostCard` (`src/components/Posts.jsx`):

- Home Posts section (`id="posts"`, between Publications and Experience): 3 per page, paginated in place, plus a "See all posts" link to `/posts`.
- `/posts` (`src/pages/PostsPage.jsx`): all posts, 6 per page, page in the URL (`/posts?page=2`).
- `/posts/<slug>` (`src/pages/PostPage.jsx`): permalink with full text; sets document title and meta description.

To add one, append a single object to the array; no other file needs to change. Order in the file is irrelevant (sorted by `date` desc). An empty array hides the home section and its nav link.

Routing uses `react-router-dom` (`BrowserRouter` in `src/index.jsx`, routes in `App.jsx`). On Netlify, `netlify.toml` rewrites only `/posts` and `/posts/*` to `/index.html` (status 200, not forced) so `/istio/` and functions are untouched. If you add a new client-side route, add a matching rewrite there. New UI strings go in both `src/i18n/en.js` and `src/i18n/pt.js`.

Posts are bilingual and follow the site's PT/EN switcher (cards, `/posts`, `/posts/<slug>`, and the permalink's document title/meta description). Localized fields are objects `{ en, pt }`; if the current language is missing, the other one is shown (`localizePost` in `src/components/Posts.jsx`). Write both versions for every new post; keep commands, versions, CVE ids and URLs identical across them, and keep the same paragraph/list structure.

```js
{
  slug: "my-post",
  date: "2026-11-07",
  title: { en: "English title", pt: "Título em português" },
  text: { en: `English text…`, pt: `Texto em português…` },
  sourceUrl: "https://example.com/changelog",
  sourceLabel: "Example Changelog",                 // or { en, pt }
  tags: ["Kubernetes", { en: "Security", pt: "Segurança" }],
}
```

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | Shared. Unique, URL-safe. Permalink is `/posts/<slug>`; changing it breaks shared links. Legacy `#post-<slug>` anchors on home redirect to the permalink. |
| `date` | yes | Shared. `yyyy-mm-dd`. Shown formatted in the current site language. |
| `title` | yes | `{ en, pt }` (at least one). |
| `text` | yes | `{ en, pt }` (at least one), each a template literal. Blank line = new paragraph; single newlines become `<br>`; plain `http(s)://` URLs are auto-linked. Posts over ~700 chars collapse behind "Read more / Ler mais". |
| `sourceUrl` | yes | Shared. Original source of the subject (changelog, official blog, docs). Rendered as the "Source / Fonte" link. |
| `sourceLabel` | no | Plain string (same in both languages) or `{ en, pt }`. Defaults to the URL hostname. |
| `tags` | no | Shared array. Each entry is a plain string (names that don't translate, e.g. `"Kubernetes"`) or `{ en, pt }`. |

There is no per-post `lang` field or language badge anymore.

Rule: the Posts area must never mention or link to LinkedIn or X/Twitter (no share buttons, no "originally posted on").
