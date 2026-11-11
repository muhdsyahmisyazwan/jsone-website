# JS One Website

Corporate website for **[J. S. One Sdn Bhd](https://www.jsone.com.my)** (JS One) — OpenText ECM & SAP specialist.

Monorepo: **Astro** static site (`/web`) + **Sanity** Studio (`/studio`) + **Node** API (`/server`), deployed primarily on **Ubuntu / Nginx**.

Languages: **English** (default) · **Malay** (`/ms`) · **Simplified Chinese** (`/zh`).

## Repository layout

```
├── web/          Astro site (static output → dist)
├── studio/       Sanity CMS Studio
├── server/       Node (Hono) API — contact, preview, webhooks
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
| `npm run start` | Serve `web/dist` + `/api/*` |
| `npm run preview` | Astro preview of static build |

## Stack

- **Web:** Astro (`output: 'static'`) + TypeScript + Tailwind CSS v4 + i18n routing
- **CMS:** Sanity — document-level + field-level EN/MS/ZH, reviewed flags before publish
- **API:** Node / Hono — contact form, draft preview, Sanity rebuild webhook
- **Deploy (primary):** Ubuntu VM — Nginx + Node (`docs/DEPLOY-UBUNTU.md`)
- **Optional:** Cloudflare Pages + `web/functions/` (legacy)
- **Forms:** Cloudflare Turnstile + Resend
- **Analytics:** Cloudflare Web Analytics or Plausible (optional)

## Documentation

| Doc | Audience |
| --- | -------- |
| [docs/ADMIN.md](docs/ADMIN.md) | Editors & admins (CMS, webhook, form, preview) |
| [docs/DEPLOY-UBUNTU.md](docs/DEPLOY-UBUNTU.md) | Ubuntu VM: Nginx + Node |
| [docs/content-brief.md](docs/content-brief.md) | Seed content from company materials |
| [studio/README.md](studio/README.md) | Studio setup |
| [web/functions/README.md](web/functions/README.md) | Legacy Cloudflare Pages Functions |

Environment variables: see [`web/.env.example`](web/.env.example) and [`studio/.env.example`](studio/.env.example).

## Deploy

| Target | Guide |
| ------ | ----- |
| **Ubuntu VM (Nginx + Node)** | [docs/DEPLOY-UBUNTU.md](docs/DEPLOY-UBUNTU.md) |
| Cloudflare Pages (optional) | Root `web`, output `dist`, functions in `web/functions/` |

## Quality targets

- WCAG 2.1 AA (skip link, focus, contrast, labels, reduced motion)
- Lighthouse ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- Minimal third-party scripts; no full CJK webfonts

## Brand

- Cyan `#00B8E0` · Lime `#C0C820` · Navy `#001F5C`
- Tagline: *We care for your content growth of tomorrow.*
- Contact: info@jsone.com.my · +603 2242 3986
