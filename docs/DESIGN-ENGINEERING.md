# JS One design system — engineering companion

Maps `docs/DESIGN.md` (designer-facing) to runtime classes, attributes, and form/security details. Designers use DESIGN.md; engineers use this file plus `web/src/styles/global.css`.

| Field | Value |
| ---- | ---- |
| **Document** | Precision Engineering — engineering companion |
| **Pairs with** | `docs/DESIGN.md` **v2.0.0+** |
| **Runtime tokens** | `web/src/styles/global.css` |
| **Contrast CI** | `npm run check:contrast` → `scripts/check-design-contrast.mjs` |

---

## 1. Class and component map

| Concern | Runtime |
| ---- | ---- |
| Tokens / primitives | `web/src/styles/global.css` |
| Fonts | `web/src/styles/fonts.css` |
| Logo | `web/public/images/logo.png` |
| CTA | `.btn` · `.btn-cta` (lime) · `.btn-brand` (cyan) · `.btn-ghost` · `.btn-on-dark` · `.btn-sm` / `.btn-lg` · `.is-loading` |
| Type roles | `.display-xl` · `.display-lg` · `.display-md` · `.body-lg` · `.body-md` · `.body-sm` · `.label` · `.caption` · `.eyebrow` · `.metric` · `.title-accent` |
| Layout | `.container-site` · `.section-pad` · `.section-defer` · `.prose-measure` · `.surface-grid` · `.panel-invert` · `.hero-stage` · `.hero-bleed` · `.mobile-cta-pad` |
| Surfaces | `.card` · `.cell` · `.cell-control` · `.empty-state` · `.preview-chrome` |
| Forms | `.field` · `.label` · `.field-error` · `.field-label-float` · `.alert` · `.alert-success` · `.alert-danger` · `.alert-info` · `.spinner` |
| Trust / pages | `HomeHero` · `PageHero` · `Fallback*` · `ContactForm` · `EmptyState` · `Breadcrumbs` · `MobileCtaBar` · `ConsentBanner` · `Header` · `Footer` |
| Diagrams | `SapOpenTextMap` · `NetworkGraph` · `.map-label` · `.map-label-title` · `.map-path-accent` |
| Z-index | `--z-base` 0 · `--z-raised` 10 · `--z-header` 50 · `--z-dropdown` 60 · `--z-mobile-cta` 70 · `--z-consent` 80 · `--z-overlay` 90 · `--z-skip` 100 |

---

## 2. `html` / `body` state classes and data attributes

| Hook | Where | Purpose |
| ---- | ---- | ---- |
| `html.js` | Set when JS boots | Enables scroll-reveal hide-until-visible (DESIGN §6 / §7) |
| `html[data-theme="light"\|"dark"]` | Theme toggle | Theme tokens |
| `html[data-font-scale="sm"\|"md"\|"lg"]` | Font-size toggle | `--font-scale` |
| `body.keyboard-open` | Mobile CTA / consent scripts | Hide bottom chrome while virtual keyboard open (2.4.11) |
| `body.has-consent-banner` | Consent banner | Layout / pad sync |
| `[data-site-header]` / `[data-condensed]` | Header | Condensed logo on scroll |
| `[data-mobile-cta]` | Mobile CTA bar | Show/hide / compact modes (DESIGN §10) |
| `[data-mobile-nav]` / `[data-menu-toggle]` | Header | Full-viewport nav + focus trap |
| `[data-consent-banner]` | Consent | Measured `--consent-banner-height` |
| `[data-reveal]` / `[data-reveal-child]` / `.is-revealed` | Sections | Scroll reveal |
| `[data-theme-toggle]` / `[data-font-size-toggle]` | Footer / nav | Preferences |
| `[data-form-again]` | ContactForm | Reset after success |

CSS variables driven by JS: `--consent-banner-height`, `--mobile-cta-height` (and compact when that mode ships).

---

## 3. ARIA and accessibility hooks (implementation)

| Pattern | Attributes / behaviour |
| ---- | ---- |
| Skip link | `.skip-link` → `#main-content`; `#main-content` may be `tabindex="-1"` |
| Focus | Global `:focus-visible` uses `--ring`; `.btn-cta` ring `#000C28`; `.panel-invert` / `.btn-on-dark` / `.preview-chrome` ring `#EEF6FB` |
| Invalid fields | `aria-invalid="true"` · `aria-describedby` → `.field-error` id |
| Required | `aria-required="true"` + visible cue; sr-only “required” where needed |
| Mobile CTA Contact on Contact page | `aria-current="page"` allowed on lime Contact only |
| Breadcrumbs | Current crumb plain text + `aria-current="page"` |
| Consent | `role="dialog"` · `aria-modal="false"` · labelled by title/body ids |
| Decorative map / initials | `aria-hidden="true"` on SVG / initials square |
| WhatsApp / external | Announce new tab (sr-only) · `rel="noopener noreferrer"` |
| Mobile nav | `aria-expanded` on toggle · focus trap while open · Escape returns focus |
| Alerts | `.alert-danger` → `role="alert"` · `.alert-success` → `role="status"` (via `Alert` component) |
| Empty / 404 | `EmptyState` with `titleAs="h1"` on 404 |

Designer rules live in DESIGN §7; do not weaken them for convenience.

---

## 4. Contact form — honeypot, Turnstile, field names

Designer-facing field list and validation **intent**: DESIGN §10. Implementation details:

| Concern | Implementation |
| ---- | ---- |
| Visible fields | `name`, `email`, `tel` / phone, `organization` / company, `message`, consent checkbox |
| Honeypot | Hidden input **`name="company_url"`** (and matching label for a11y tree if present). Must not be shown; `tabindex="-1"` · `autocomplete="off"`. Server rejects if filled. **Never remove** (DESIGN §14). |
| Locale | Hidden field with current UI locale |
| Turnstile | Cloudflare Turnstile widget when `PUBLIC_` / server site key configured; theme `auto`. Client errors → i18n `form.errorTurnstile`. Server verifies token. If misconfigured, show status (not a silent open form). Accessible path required (DESIGN §7 / 3.3.8). |
| Submit | `.btn-brand` (cyan), not lime; spinner via `.spinner` / `[data-submit-spinner]` · `.is-loading` |
| Success | Thanks panel `role="status"`; **Send another** = `.btn-ghost` `[data-form-again]` |
| Endpoint | `POST /api/contact` (Hono server) |

Malaysian phone normalization and message-length caps: server is source of truth; client mirrors DESIGN §10 rules.

---

## 5. Token tables and contrast CI

### Generate §2 tables from CSS

```bash
# Markdown tables (stdout) for pasting into DESIGN.md §2 after token edits
node scripts/check-design-contrast.mjs --markdown

# CI / local gate (exit 1 on failure)
npm run check:contrast
```

The script:

1. Parses `:root, [data-theme='light']` and `[data-theme='dark']` custom properties from `web/src/styles/global.css`.
2. Resolves `rgb(… / α)` borders by blending onto `--bg` / `--bg-elevated` / `--bg-muted` when needed.
3. Emits semantic token tables + contrast pairs.
4. **Fails** if any configured **text** pair &lt; **4.5:1** or **UI** pair (control border, focus ring, illust stroke, status on soft fill) &lt; **3:1**.

Authoritative numbers for DESIGN.md §2 should be regenerated after palette changes; do not hand-edit ratios without re-running the script.

### Pair lists (maintained in the script)

- **Text AA:** `fg`/`fg-muted`/`fg-subtle`/`primary`/`danger`/`success` on `bg` / `bg-elevated` / `bg-muted`; `primary-fg` on `primary`; `accent-fg` on `accent`; soft-fill text pairs.
- **UI 3:1:** `border-control` vs surfaces; `ring` vs surfaces; `illust-accent` vs `bg` / `bg-elevated`; status colors on `*-soft` fills.

Decorative `--border` / `--border-strong` are **not** required to pass 3:1 (DESIGN §2 / 1.4.11).

---

## 6. Related docs

| Doc | Role |
| ---- | ---- |
| `docs/DESIGN.md` | Designer rules, page specs, density, a11y intent |
| `docs/content-brief.md` | Copy / IA seed |
| `docs/PRODUCT-DECISIONS.md` | English-only lock, Phase 7 |
| `docs/ADMIN.md` | Editor / trust placement |
| `docs/DEPLOY-UBUNTU.md` | Production API + static |

Live: https://www.jsone.com.my · https://jsone.com.my/
