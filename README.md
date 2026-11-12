# JS One Website

Corporate website for **[J.S. One Sdn Bhd](https://www.jsone.com.my)** (JS One) - OpenText ECM & SAP specialist.

Monorepo: **Astro** static site (`/web`) + **Sanity** Studio (`/studio`) + **Node** API (`/server`), deployed primarily on **Ubuntu / Nginx**.

**Public language:** English only. Malay and Simplified Chinese remain in the CMS / i18n files for a future go-live - they are **not** routed on the live site yet. See [docs/PRODUCT-DECISIONS.md](docs/PRODUCT-DECISIONS.md).

## Repository layout

```
├── web/          Astro site (static output → dist)
├── studio/       Sanity CMS Studio
├── server/       Node (Hono) API - contact, preview, webhooks
├── deploy/       Nginx + systemd unit examples
├── scripts/      Rebuild helper for the VM
└── docs/         Admin, deploy, and content brief
```

## Prerequisites

- **Node.js** ≥ 22.23.4
- npm (workspaces)
- Sanity project (optional for local chrome/fallback; required for live CMS content)

## Quick start

```bash
npm install

cp web/.env.example web/.env
cp studio/.env.example studio/.env
# Fill PUBLIC_SANITY_PROJECT_ID / SANITY_STUDIO_PROJECT_ID when ready

npm run dev          # Astro  → http://localhost:4321
npm run dev:studio   # Studio → http://localhost:3333
npm run dev:server   # API    → see server/.env.development

npm run build        # web/dist + server/dist
npm run start        # static site + API → http://localhost:4321
```

Without Sanity env vars, the site still builds using i18n fallback chrome/homepage content.

**Do not commit** `.env` files or API tokens. Only `*.env.example` files belong in git.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Astro dev server |
| `npm run dev:studio` | Sanity Studio |
| `npm run dev:server` | Local API server |
| `npm run build` | Build web + server |
| `npm run typecheck` | Astro check + server/studio `tsc` |
| `npm run test:unit` | Server unit tests (webhook auth) |
| `npm run test:e2e` | Playwright smoke + acceptance + axe (needs `build:web` first) |
| `npm run test:lighthouse` | Lighthouse CI on Home / Solutions / Contact |
| `npm run test:ci` | typecheck → unit → build web → e2e → Lighthouse |
| `npm run start` | Serve `web/dist` + `/api/*` |
| `npm run preview` | Astro preview of static build |

## Stack

- **Web:** Astro (`output: 'static'`) + TypeScript + Tailwind CSS v4 + i18n routing
- **CMS:** Sanity - document-level + field-level EN/MS/ZH, reviewed flags before publish
- **API:** Node / Hono - contact form, draft preview, Sanity rebuild webhook
- **Deploy (production):** Ubuntu VM - Nginx + Node `server/` ([docs/GO-LIVE.md](docs/GO-LIVE.md))
- **Not production:** GitHub Pages workflow (static only; no `/api`)
- **Forms:** Cloudflare Turnstile + Resend
- **Analytics:** Cloudflare Web Analytics or Plausible (optional)

## Documentation

| Doc | Audience |
| --- | -------- |
| [docs/GO-LIVE.md](docs/GO-LIVE.md) | **Production go-live** + backup / secret rotation |
| [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) | Phase 9 final acceptance gate |
| [docs/PRODUCT-DECISIONS.md](docs/PRODUCT-DECISIONS.md) | Locked product decisions (locales, hosting) |
| [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) | Phased upgrade checklist |
| [docs/CI.md](docs/CI.md) | PR checks, Playwright, Lighthouse, Pages preview |
| [docs/SEED.md](docs/SEED.md) | Seed Sanity from content brief; replace Fallback\* |
| [docs/DESIGN.md](docs/DESIGN.md) | CTA hierarchy, spacing, form primitives |
| [docs/ADMIN.md](docs/ADMIN.md) | Editors & admins (CMS, webhook, form, preview) |
| [docs/DEPLOY-UBUNTU.md](docs/DEPLOY-UBUNTU.md) | Ubuntu VM install detail |
| [docs/content-brief.md](docs/content-brief.md) | Seed content from company materials |
| [studio/README.md](studio/README.md) | Studio setup |

Environment variables: see [`web/.env.example`](web/.env.example) and [`studio/.env.example`](studio/.env.example).

## Deploy

| Target | Guide |
| ------ | ----- |
| **Ubuntu VM (Nginx + Node) - production** | [docs/GO-LIVE.md](docs/GO-LIVE.md) → [docs/DEPLOY-UBUNTU.md](docs/DEPLOY-UBUNTU.md) |
| GitHub Pages | Preview only - [docs/CI.md](docs/CI.md) |

## Quality targets

- WCAG 2.1 AA (skip link, focus, contrast, labels, reduced motion)
- Lighthouse ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- Minimal third-party scripts; no full CJK webfonts

## Brand

- Cyan `#00B8E0` · Lime `#C0C820` · Navy `#001F5C`
- Tagline: *We care for your content growth of tomorrow.*
- Contact: info@jsone.com.my · +603 2242 3986
