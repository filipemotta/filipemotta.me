# Filipe Motta — Portfolio

Personal portfolio website built with **React 18**, **Vite**, and **Tailwind CSS**.

## Project Structure

```
portfolio/
├── index.html                 # Entry HTML
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── index.js               # React DOM mount
    ├── index.css              # Tailwind directives + global styles
    ├── App.jsx                # Root component (composes sections)
    ├── styles/
    │   └── theme.js           # Design tokens (colors, fonts)
    ├── data/
    │   ├── jobs.js            # Work experience entries
    │   ├── certifications.js  # Certification list
    │   ├── skills.js          # Skill groups & levels
    │   └── highlights.js      # Hero stats (years, clusters, etc.)
    ├── hooks/
    │   ├── useInView.js       # IntersectionObserver for scroll animations
    │   └── useActiveSection.js# Scroll-spy for nav highlighting
    └── components/
        ├── Nav.jsx            # Fixed navigation bar
        ├── Hero.jsx           # Hero section with particles & counters
        ├── About.jsx          # About section with terminal display
        ├── Skills.jsx         # Skill bars grouped by category
        ├── Experience.jsx     # Timeline section
        ├── TimelineItem.jsx   # Single timeline card
        ├── Certifications.jsx # Certifications grid
        ├── CertBadge.jsx      # Individual cert badge
        ├── Contact.jsx        # Contact CTA section
        ├── Footer.jsx         # Footer
        ├── FadeIn.jsx         # Scroll-triggered fade animation
        ├── Counter.jsx        # Animated number counter
        ├── Particles.jsx      # Floating background particles
        ├── SkillBar.jsx       # Animated skill progress bar
        └── TerminalText.jsx   # Terminal-style code display
```

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy

The `npm run build` command generates a `dist/` folder ready for static hosting:

- **Vercel**: Push to GitHub and import; Vite is auto-detected.
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`.
- **GitHub Pages**: Use `vite-plugin-gh-pages` or deploy `dist/` manually.
- **Custom domain**: Point your domain to whichever hosting you choose and drop the `dist/` contents there.

## Customization

- **Colors & fonts** → `src/styles/theme.js`
- **Experience data** → `src/data/jobs.js`
- **Certifications** → `src/data/certifications.js`
- **Skill bars** → `src/data/skills.js`
- **Hero stats** → `src/data/highlights.js`
