# Ashutosh Gupta — Portfolio

A premium, interactive 3D portfolio for **Ashutosh Gupta**, Senior Software Engineer — Backend (Python) & AI Platforms. Every word of content is sourced from the résumé (`public/resume/Ashutosh_Gupta_Resume.pdf`); nothing is invented.

**Design concept — "Control Plane":** the site presents an engineer the way he presents software: as a live, observable system. Section eyebrows are HTTP routes (`GET /experience`, `POST /contact`), the status badge reads `OPERATIONAL` (backed by the résumé's 99.9% uptime), and the hero is a cursor-reactive orbital system — service nodes streaming request pulses into a golden core.

## Stack

- **Next.js 16** (App Router, static export) · **React 19** · **TypeScript**
- **Tailwind CSS v4** design tokens, glassmorphism, aurora gradients
- **Three.js + React Three Fiber + drei** — hero orbital scene & 3D skill constellation
- **Framer Motion** (reveals, layout animation, springs) · **GSAP ScrollTrigger** (hero scrub) · **Lenis** (smooth scroll)
- **shadcn/ui-style primitives** (Radix + cva) · **cmdk** command palette · **Lucide** icons

## Features

- Cursor-reactive 3D hero with performance tiers (device-aware particle budgets), lazy mounting, frameloop pausing offscreen, WebGL error fallback
- Interactive 3D skills constellation — search, category filters, hover inspection, click-to-pin, plus a fully keyboard/screen-reader accessible list fallback
- Experience timeline with scroll-drawn trace and expandable role cards
- Holographic tilt project cards with case-study dialogs (challenge → solution → outcomes)
- Command palette (`⌘K` / `/`) with content search, navigation, and actions
- Dark/light theme (persisted), custom cursor, magnetic buttons, ripples, optional synthesized UI sounds (muted by default), Konami easter egg
- Contact form that drafts an email in the visitor's mail app (`mailto:`) — zero data stored; copy-to-clipboard for email/phone
- SEO: metadata, Open Graph/Twitter image, JSON-LD `Person`, `sitemap.xml`, `robots.txt`
- PWA: web manifest + offline service worker
- Accessibility: skip link, focus rings, semantic landmarks, labels, `prefers-reduced-motion` disables smooth scroll, 3D, and decorative animation site-wide

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run build`     | Static export → `out/`                          |
| `npm run serve`     | Preview the export locally                      |
| `npm run lint`      | ESLint (Next + React Compiler rules)            |
| `npm run typecheck` | `tsc --noEmit`                                  |
| `npm run format`    | Prettier (with Tailwind class sorting)          |
| `npm run icons`     | Regenerate favicon/PWA icons/OG image via sharp |

## Editing content

All copy lives in **`lib/resume.ts`** — one typed file for identity, experience, projects, skills, education, credentials, and the section registry. Update it and the whole site follows. Replace `public/resume/Ashutosh_Gupta_Resume.pdf` to update the downloadable résumé.

## Deployment

The build is a fully static export (`out/`) — deployable to all three targets without code changes.

### GitHub Pages (zero-config)

1. Push this repo to GitHub (`main` branch).
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Done — `.github/workflows/deploy.yml` builds with the correct base path
   (auto-detected: `/repo-name`, or root for `username.github.io`) and deploys.

### Vercel

Import the repo — `vercel.json` is included; the static export is detected automatically. Optionally set `NEXT_PUBLIC_SITE_URL=https://your-domain` in project env for canonical/OG URLs.

### Netlify

Import the repo — `netlify.toml` sets `npm run build` and publishes `out/`. Set `NEXT_PUBLIC_SITE_URL` likewise.

### Environment variables

| Variable                       | Purpose                                                         |
| ------------------------------ | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Canonical site URL for SEO/OG (default: GitHub Pages URL)       |
| `NEXT_PUBLIC_BASE_PATH`        | Sub-directory base path (set automatically by the GH workflow)  |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Set to your domain to enable Plausible analytics                |

### Analytics

Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to enable privacy-friendly [Plausible](https://plausible.io) tracking (no cookies, GDPR-friendly). On Vercel you can instead `npm i @vercel/analytics` and add its `<Analytics />` to `components/analytics.tsx`.

## Project structure

```
app/            layout (fonts, SEO, JSON-LD), page, error/404, manifest/sitemap/robots
components/
  sections/     hero, about, experience, projects, skills, education, contact, footer
  three/        R3F scenes + scene shell (lazy mount, perf tiers, error boundary)
  navigation/   glass navbar, command palette, theme toggle
  effects/      cursor, reveals, counters, magnetic, typewriter, spotlight, konami
  ui/           shadcn-style primitives (button, dialog, command, toast, …)
hooks/          perf tier, scrollspy, clipboard, sound synth, konami, mounted
lib/            resume.ts (single source of truth), utils
public/         resume PDF, icons, OG image, service worker
scripts/        icon/OG generator (sharp)
```

## Performance notes

3D scenes are dynamically imported (`ssr: false`), mounted only near the viewport, and pause their frame loops when offscreen or when the tab is hidden. Particle budgets and device-pixel-ratio caps scale down on low-power devices; reduced-motion users get static posters and native scrolling. Fonts are self-hosted via `next/font`; the export ships no server runtime.
