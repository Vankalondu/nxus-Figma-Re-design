# NXUS — Figma Redesign

The NXUS (formerly Qaza) football scouting terminal. A React single-page app
exported from Figma Make, covering role-based scout dashboards, player and match
management, reporting, and an admin interface.

Original design: https://www.figma.com/design/car8FJe9v4Y0tUpvTvtsKi/Latest-Qaza-Version

## Tech stack

- **React 18** + **React Router 7** (SPA)
- **Vite 6** (dev server & build)
- **Tailwind CSS 4** + **shadcn/ui** (Radix) components
- **Recharts** for charts, **motion** for animation
- Deployed to **Cloudflare Pages**

## Getting started

```bash
npm install       # install dependencies
npm run dev       # start the dev server (http://localhost:5173)
```

## Build

```bash
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

## Authentication (mock)

Login is **client-side only** — there is no backend. Any email + password is
accepted, and the **role is derived from the email prefix**:

| Email starts with | Lands on |
|-------------------|----------|
| `senior@…`        | Senior Scout dashboard |
| `lead@…`          | Lead Scout dashboard |
| `head@…`          | Head Scout dashboard |
| `country@…` / anything else | Country Scout dashboard |

## QA — automated end-to-end tests

[Playwright](https://playwright.dev) drives a real browser to verify the app.
Tests live in `tests/` and run against the production build.

```bash
npm run test:e2e        # run the full suite (headless)
npm run test:e2e:ui     # interactive UI mode for debugging
```

Coverage:
- **Smoke** — login page and every key route render without crashing
- **Auth & roles** — each email prefix lands on the correct dashboard
- **Responsive** — no horizontal overflow at mobile / tablet / desktop widths

Tests run automatically on every push and pull request to `main` via GitHub
Actions (`.github/workflows/playwright.yml`). A green check means the app builds
and all flows pass; the HTML report is uploaded as a build artifact on failure.
