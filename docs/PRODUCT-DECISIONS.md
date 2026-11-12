# Product decisions (Phase 0)

Locked decisions so docs, Studio guidance, and code stay aligned. Change these deliberately - then update this file and related docs together.

## Public languages

| Decision | Detail |
| -------- | ------ |
| **Public site** | **English only** |
| URL | No locale prefix (`/`, `/about/`, …) |
| Astro / routing | `web/astro.config.mjs` and `web/src/i18n/locales.ts` → `locales = ['en']` |
| Language switcher | **Not shown** on the public site |
| Sitemap / hreflang | English only (`x-default` → EN). `/ms/` and `/zh/` are excluded from the sitemap filter |

### CMS & translation prep (not public yet)

| Decision | Detail |
| -------- | ------ |
| Studio locales | EN / MS / ZH fields and document translations **remain** in schemas |
| UI string files | `web/src/i18n/{en,ms,zh}.json` kept for a future go-live |
| Editor priority | **Ship reviewed English first.** MS/ZH may be drafted in Studio but **do not appear** on the live site until Phase 7 (improvements roadmap) |
| Fallback | Missing/unreviewed non-EN still falls back to reviewed English in code paths that resolve locales |

**Revisit:** Improvements Phase 7 - restore public `ms` / `zh` routes, switcher, localized sitemap, and hreflang. Until then, do not document Malay/Chinese URLs as live.

## Hosting & deploy

| Path | Status | Notes |
| ---- | ------ | ----- |
| **Ubuntu VM (Nginx + Node `server/`)** | **Primary / production** | Go-live: [GO-LIVE.md](GO-LIVE.md) · install: [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) |
| Cloudflare Pages Functions | **Retired** | Former `web/functions/` removed (Phase 8). Do not redeploy Pages as production API. |
| GitHub Pages (`.github/workflows/deploy-pages.yml`) | **Not production** | Manual `workflow_dispatch` only; requires Sanity secret or explicit `allow_fallback_only`. Static-only; no `/api/*` |

**API surface:** **`server/` only** (contact, preview, draft, webhook, health). Contact CAPTCHA still uses Cloudflare **Turnstile** (CAPTCHA service - Pages not required).

Optional `CF_DEPLOY_HOOK_URL` on the Node webhook remains an emergency mirror hook only; production rebuilds use `REBUILD_COMMAND`.

## Related docs

| Doc | Role |
| --- | ---- |
| [GO-LIVE.md](GO-LIVE.md) | **Production go-live checklist** (backup + secret rotation) |
| [ACCEPTANCE.md](ACCEPTANCE.md) | Phase 9 cover-all gate (automated + staging sign-off) |
| [IMPROVEMENTS.md](IMPROVEMENTS.md) | Phased upgrade checklist |
| [ADMIN.md](ADMIN.md) | Day-to-day editor & ops guide (must match these decisions) |
| [DEPLOY-UBUNTU.md](DEPLOY-UBUNTU.md) | Production install detail |
| Root `README.md` | Repo overview |
| `studio/README.md` | Studio setup (Ubuntu webhook/preview) |
