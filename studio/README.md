# JS One - Sanity Studio

Headless CMS for the JS One corporate site (`/web`).

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

- **Document-level** (`page`, `news`): boolean `reviewed` - must be `true` to publish to the live site.
- **Field-level** (`localeString`, `localeText`, etc.): each locale has `{ value, reviewed }`.

Front-end queries (Phase 3) must filter on these flags so unreviewed copy never ships by accident.

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

Match `SANITY_PREVIEW_SECRET` in Cloudflare Pages env vars.

## Rebuild webhook

In Sanity Manage → API → Webhooks:

- URL: `https://www.jsone.com.my/api/sanity-webhook?secret=<SANITY_WEBHOOK_SECRET>`
- Trigger on create/update/delete for content types you care about
- Cloudflare Pages → Deploy hooks → paste URL into `CF_DEPLOY_HOOK_URL`

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
