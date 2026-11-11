# JS One - Admin guide

How to run the site day-to-day: content in Sanity, rebuilds on the Ubuntu VM (or optional Cloudflare Pages), and languages EN / MS / ZH.

## Who does what

| Role | Can do |
| ---- | ------ |
| **Administrator** | Everything editors can, plus Sanity project members, API tokens, webhooks, Studio deploy |
| **Editor** | Create/edit/publish pages, news, homepage sections, navigation, footer, settings |

Configure roles in [Sanity Manage](https://www.sanity.io/manage) → Project → API → Roles. See `studio/src/roles.ts`.

## Daily content workflow

1. Open Studio (`npm run dev:studio` locally, or your hosted Studio URL).
2. Edit content. Prefer **reviewed** flags before relying on the live site.
3. Publish.
4. The Sanity webhook triggers a rebuild on the server (usually a few minutes). See [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md).

### Reviewed flags (required)

Unreviewed copy must not ship:

- **Pages & news** (one document per language): check **Reviewed for publish**.
- **Field-level** text (settings, nav, footer, homepage blocks): each EN / MS / ZH value has its own **Reviewed** checkbox.

English is the fallback when another language is missing or unreviewed.

### Languages

| UI language | URL | CMS code | HTML `lang` |
| ----------- | --- | -------- | ----------- |
| English | `/…` (no prefix) | `en` | `en` |
| Malay | `/ms/…` | `ms` | `ms` |
| Chinese (Simplified) | `/zh/…` | `zh` | `zh-Hans` |

- **Pages / news**: use the document internationalization controls to create translations.
- **Homepage, navigation, footer, site settings**: edit EN / MS / ZH fields side by side.

### Homepage vs pages

| Area | Where in Studio | Notes |
| ---- | --------------- | ----- |
| Homepage | **Homepage** singleton | Localized section blocks (`homeHero`, etc.) |
| Inner pages | **Pages** | Add / reorder section blocks; one doc per language |
| News | **News** | Title, excerpt, body, image, SEO |
| Nav / footer / brand | **Navigation**, **Footer**, **Site settings** | Singletons - don’t create duplicates |

### Page builder blocks

Hero · Text + image · Services grid · Team · Testimonials · CTA · FAQ · Contact form · Logo strip  

Images need **alt text** (per language on localized images).

### SEO per page

Fill **Meta title**, **Meta description**, and **OG image** on each page/news document (and homepage SEO group). Defaults can live under Site settings → Default SEO.

## Preview drafts

1. In Studio, open **Presentation**.
2. The site enables preview via `/api/preview` (cookie + banner).
3. Exit with **Exit preview** or `/api/exit-preview`.

Static HTML still reflects the last build until the webhook rebuilds. Presentation is for routing/context; publish + rebuild for public updates.

Manual enable (ops):  
`/api/preview?secret=<SANITY_PREVIEW_SECRET>&redirect=/about/`

## Contact form

Live form posts to `/api/contact` with Cloudflare Turnstile (CAPTCHA only - no Pages required).

Required env (on the Node server / `web/.env`):

- `PUBLIC_TURNSTILE_SITE_KEY` (build-time / public)
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL` (e.g. `info@jsone.com.my`)
- optional `CONTACT_FROM_EMAIL`
- local only: `TURNSTILE_SKIP=true`

## Rebuild webhook

Sanity Manage → API → Webhooks:

- URL: `https://www.jsone.com.my/api/sanity-webhook?secret=<SANITY_WEBHOOK_SECRET>`
- Events: create / update / delete on content types you care about

On Ubuntu, set `REBUILD_COMMAND` to `scripts/rebuild.sh` (see [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md)).  
Optional Cloudflare Pages: also set `CF_DEPLOY_HOOK_URL`.

## Hosting

**Recommended - Ubuntu VM:** [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) (Nginx + Node `server/`).

**Optional - Cloudflare Pages:**

| Setting | Value |
| ------- | ----- |
| Root | `web` |
| Build | `npm run build` |
| Output | `dist` |
| Functions | `functions/` |

Copy secrets from `web/.env.example`. Also set `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, and `SANITY_API_READ_TOKEN` for preview/draft APIs.

### Analytics (optional, privacy-friendly)

Set **one** of:

- `PUBLIC_CF_WEB_ANALYTICS_TOKEN` - Cloudflare Web Analytics, or  
- `PUBLIC_PLAUSIBLE_DOMAIN` - Plausible

## Accessibility & quality checklist

Before a major release:

- [ ] Keyboard: skip link, menus, FAQ, language switcher, form
- [ ] Images have meaningful alt in every published language
- [ ] Contrast: body text and footer links readable
- [ ] Malay strings don’t overflow buttons/headings
- [ ] Lighthouse: Performance / A11y / Best Practices / SEO ≥ 90 on a production URL
- [ ] Only reviewed content is published

## Local development

```bash
npm install
cp web/.env.example web/.env          # fill Sanity + optional Turnstile
cp studio/.env.example studio/.env

npm run dev:web      # http://localhost:4321  (Astro)
npm run dev:server   # http://127.0.0.1:8787 (API; Astro proxies /api/* here)
npm run dev:studio   # http://localhost:3333
npm run build && npm run start   # static + API together on :4321
```

Contact form posts to `/api/contact`. With `astro dev` / `astro preview`, run **`npm run dev:server`** in a second terminal so `/api` is proxied to port 8787. Without it you will see `404` on `/api/contact`.

Without a Sanity project ID the site still builds using i18n fallbacks for chrome/homepage.

## Troubleshooting

| Symptom | Check |
| ------- | ----- |
| Old content on live site | Webhook secret, `REBUILD_COMMAND` / deploy hook, `systemctl status jsone-web` |
| Translation missing | Reviewed flag; EN fallback; document language field |
| Form fails | Turnstile keys, Resend key, Node server logs |
| Preview unauthorized | `SANITY_API_READ_TOKEN`, Presentation origin, preview secrets |
| Studio blank | `SANITY_STUDIO_PROJECT_ID` / dataset CORS / login |
| Site not reachable | Nginx, firewall, `jsone-web` service - [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) |

## Seed content reminder

Company facts and messaging live in `docs/content-brief.md` (from the company profile and revamp mockups). Use it when first filling Site settings, Homepage, About, and Solutions.
