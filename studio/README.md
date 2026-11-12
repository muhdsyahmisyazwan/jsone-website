# JS One - Sanity Studio

Headless CMS for the JS One corporate site (`/web`).

**Public site language:** English only. Studio still offers EN / MS / ZH so translations can be prepared; MS/ZH are **not** live on the website yet. See [`docs/PRODUCT-DECISIONS.md`](../docs/PRODUCT-DECISIONS.md).

## Setup

1. Create a Sanity project at [sanity.io/manage](https://www.sanity.io/manage) (or run `npx sanity@latest login` then `npx sanity@latest init --env` inside this folder).
2. Copy `.env.example` → `.env` and set:

```env
SANITY_STUDIO_PROJECT_ID=xxxxxxxx
SANITY_STUDIO_DATASET=production
```

3. From the monorepo root:

```bash
npm install
npm run dev:studio
```

Studio runs at http://localhost:3333 by default.

## Content model

| Type | i18n | Notes |
| ---- | ---- | ----- |
| `siteSettings` | Field-level EN/MS/ZH | Singleton - brand, contact, default SEO |
| `navigation` | Field-level | Singleton - main menu + dropdowns |
| `footer` | Field-level | Singleton - columns + legal links |
| `homePage` | Field-level in sections | Singleton - page builder with localized blocks |
| `page` | Document-level | `@sanity/document-internationalization` |
| `news` | Document-level | Articles / insights |

### Reviewed flags

- **Document-level** (`page`, `news`): boolean `reviewed` - must be `true` for the front end to use the document.
- **Field-level** (`localeString`, `localeText`, etc.): each locale has `{ value, reviewed }`.

Front-end queries filter on these flags so unreviewed copy never ships by accident.

**Editor priority today:** review and publish **English**. MS/ZH fields are optional prep until the public multi-locale go-live ([IMPROVEMENTS.md](../docs/IMPROVEMENTS.md) Phase 7).

**Publish gate:** Page, News, and Homepage Publish actions stay disabled until **Reviewed for publish** is checked.

**Site status tool:** Studio → Site status reads `GET {previewOrigin}/api/health` (CORS allowed for Studio / localhost) for rebuild freshness and contact readiness.

**Seeding:** Follow [docs/SEED.md](../docs/SEED.md) so Fallback\* pages are replaced by CMS sections.

### Page builder blocks

Document pages: `hero`, `textImage`, `servicesGrid`, `team`, `testimonials`, `cta`, `faq`, `contactForm`, `logoStrip`

Homepage (localized): same set prefixed with `home*` (`homeHero`, …).

Images always require alt text (per language for localized images).

## Preview (Presentation Tool)

Studio includes Sanity **Presentation**. Set in `studio/.env`:

```env
SANITY_STUDIO_PREVIEW_ORIGIN=https://www.jsone.com.my
```

Preview mode enable URL on the site: `/api/preview?secret=<SANITY_PREVIEW_SECRET>&redirect=/`

Match `SANITY_PREVIEW_SECRET` on the **Ubuntu Node server** env (`web/.env` / systemd).

Static HTML reflects the **last rebuild** until the Sanity webhook runs. Presentation is for routing/context; publish + rebuild for public updates.

## Rebuild webhook

**Production (Ubuntu):** In Sanity Manage → API → Webhooks:

- URL: `https://www.jsone.com.my/api/sanity-webhook` (**do not** append `?secret=`)
- Header: `x-sanity-webhook-secret: <SANITY_WEBHOOK_SECRET>` (or Bearer / Sanity signature)
- Trigger on create/update/delete for content types you care about
- On the VM, set `REBUILD_COMMAND` to the absolute path of `scripts/rebuild.sh` — see [DEPLOY-UBUNTU.md](../docs/DEPLOY-UBUNTU.md)

Production go-live checklist: [docs/GO-LIVE.md](../docs/GO-LIVE.md).

## Roles (admin vs editor)

Configure in Sanity Manage → Project → **API** → **Roles**:

| Role | Intent |
| ---- | ------ |
| **Administrator** | Full content + project settings + members |
| **Editor** | Create/edit/publish content; no member/API management; avoid deleting singletons |

See `src/roles.ts` for the intended permission matrix.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Local Studio |
| `npm run build` | Build static Studio |
| `npm run deploy` | Deploy hosted Studio |
| `npm run typegen` | Extract schema + generate types |
