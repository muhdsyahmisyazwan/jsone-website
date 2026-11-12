# JS One - Admin guide

How to run the site day-to-day: content in Sanity, rebuilds on the **Ubuntu VM** (production), and English on the public site.

Product decisions (locales + hosting): [PRODUCT-DECISIONS.md](PRODUCT-DECISIONS.md). Go-live: [GO-LIVE.md](GO-LIVE.md). Acceptance: [ACCEPTANCE.md](ACCEPTANCE.md). Upgrade checklist: [IMPROVEMENTS.md](IMPROVEMENTS.md).

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

| Surface | Status |
| ------- | ------ |
| **Public website** | **English only** (no `/ms` or `/zh` routes, no language switcher) |
| **Studio / CMS** | EN / MS / ZH fields still exist so translations can be prepared |
| **Live priority** | Ship **reviewed English** first. MS/ZH drafts do **not** appear on the live site yet |

| Language | Public URL | CMS code | HTML `lang` (when public) |
| -------- | ---------- | -------- | ------------------------- |
| English | `/…` (no prefix) — **live** | `en` | `en` |
| Malay | `/ms/…` — **not public yet** | `ms` | `ms` |
| Chinese (Simplified) | `/zh/…` — **not public yet** | `zh` | `zh-Hans` |

- **Pages / news**: document internationalization controls exist for future MS/ZH; for now publish reviewed **English** documents.
- **Homepage, navigation, footer, site settings**: EN / MS / ZH fields side by side — fill and review **EN** for go-live; MS/ZH optional prep only.
- Multi-locale public go-live is tracked as **Phase 7** in [IMPROVEMENTS.md](IMPROVEMENTS.md).

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

1. In Studio, open **Presentation** (or open **Site status** to see last rebuild / contact readiness).
2. The site enables preview via `/api/preview` (cookie + banner).
3. While the preview cookie is set, the banner calls `/api/draft?path=…` and shows **live draft** metadata (title, reviewed, sections). Hero headings with `data-preview-field="hero-heading"` can update from the draft.
4. Exit with **Exit preview** or `/api/exit-preview`.

**Important:** Public visitors still see the **last rebuild**. Draft preview does not replace the full page builder HTML until publish + webhook. Use the draft panel to confirm the document before publishing.

Manual enable (ops):  
`/api/preview?secret=<SANITY_PREVIEW_SECRET>&redirect=/about/`

### Publish gates

- **Page**, **News**, and **Homepage** cannot use Studio **Publish** until **Reviewed for publish** is checked (`studio/src/actions/requireReviewed.ts`).
- Configure Sanity Manage roles from `studio/src/roles.ts` (Administrator vs Editor).
- Seed content: [SEED.md](SEED.md).

## Contact form

Live form posts to `/api/contact` with Cloudflare Turnstile (CAPTCHA only - no Pages required).

Required env (on the Node server / `web/.env`):

- `PUBLIC_TURNSTILE_SITE_KEY` (build-time / public)
- `TURNSTILE_SECRET_KEY` (**required in production**)
- `RESEND_API_KEY` (**required in production** — no “log only” success)
- `CONTACT_TO_EMAIL` (e.g. `info@jsone.com.my`)
- optional `CONTACT_FROM_EMAIL`
- local only: `TURNSTILE_SKIP=true` (rejected when `NODE_ENV=production`)

Rate limit: about **5 requests / 15 minutes / IP** (Node + Nginx). Excess returns `429 rate_limited`.

## Rebuild webhook

Sanity Manage → API → Webhooks:

- **URL:** `https://www.jsone.com.my/api/sanity-webhook` (**no** `?secret=` — query secrets are rejected)
- **Auth (pick one):**
  - HTTP header `x-sanity-webhook-secret: <SANITY_WEBHOOK_SECRET>`, or
  - `Authorization: Bearer <SANITY_WEBHOOK_SECRET>`, or
  - Sanity’s signed webhook (`sanity-webhook-signature`) using the same secret
- Events: create / update / delete on content types you care about

On Ubuntu, set `REBUILD_COMMAND` to the **absolute** path of `scripts/rebuild.sh` (see [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md)). Rebuilds are debounced (~60s) and flock-locked.

**Publish latency:** the live site is static HTML. Editors see draft via Presentation; public visitors get the last successful rebuild. HTML is served with `max-age=0, must-revalidate` so a finished rebuild is visible immediately; hashed `/_astro/` assets stay long-cached. See [GO-LIVE.md](GO-LIVE.md) and [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) “Faster publish”.

### Health & rebuild freshness

`GET /api/health` returns static readiness, contact config flags, and rebuild status (`lastStartedAt`, `logMtime`, `logAgeSec`). After a webhook, check that `rebuild.log` mtime updates within a few minutes.

### SEO / crawl

- Canonical host: `https://www.jsone.com.my` (`astro.config.mjs` `site`)
- `robots.txt` → Sitemap `https://www.jsone.com.my/sitemap-index.xml`; `/api/` disallowed
- Organization JSON-LD uses CMS email, phone, address, logo, and `socialLinks` when set in Site settings

## Hosting

**Production — Ubuntu VM:** start with [GO-LIVE.md](GO-LIVE.md); install detail in [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) (Nginx + Node `server/`).

**API:** Node `server/` only (contact, preview, draft, webhook, health). Former Cloudflare Pages Functions were removed.

**Not production:** GitHub Pages builds are static-only (no `/api/contact`, preview, or webhook). Do not use them as the live corporate site.

### Analytics (optional, privacy-friendly)

Set **one** of:

- `PUBLIC_CF_WEB_ANALYTICS_TOKEN` - Cloudflare Web Analytics, or  
- `PUBLIC_PLAUSIBLE_DOMAIN` - Plausible

## Accessibility & quality checklist

Before a major release:

- [ ] Keyboard: skip link, menus, FAQ, form (language switcher N/A until Phase 7)
- [ ] Images have meaningful alt (English on public pages; per-language when MS/ZH go live)
- [ ] Contrast: body text and footer links readable
- [ ] Lighthouse: Performance / A11y / Best Practices / SEO ≥ 90 on a production URL
- [ ] Only reviewed **English** content is relied on for the live site
- [ ] (Phase 7+) Malay/Chinese strings don’t overflow buttons/headings

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
| Translation missing | Expected for MS/ZH on public site today; for EN check reviewed flag / document language |
| Form fails | Turnstile keys, Resend key, Node server logs |
| Preview unauthorized | `SANITY_API_READ_TOKEN`, Presentation origin, preview secrets |
| Studio blank | `SANITY_STUDIO_PROJECT_ID` / dataset CORS / login |
| Site not reachable | Nginx, firewall, `jsone-web` service - [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) |

## Seed content reminder

Company facts and messaging live in `docs/content-brief.md` (from the company profile and revamp mockups). Use it when first filling Site settings, Homepage, About, and Solutions.
