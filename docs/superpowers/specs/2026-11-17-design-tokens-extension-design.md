# Design tokens extension and component specs

**Date:** 2026-11-17  
**Status:** Approved for implementation planning  
**Product:** JS One public site (`web/`)  
**Deliverable:** Full build (docs + CSS tokens + component updates)

## Goal

Extend the JS One design system with missing tokens (breakpoints, spacing, elevation/z-index, type scale with Malay/Chinese line-height prep, icons, imagery, chart colors, motion) and ship component specs for 404, empty, form validation/success, form loading, mobile nav, and Solutions dropdown behavior.

## Decisions (locked)

| Topic | Choice |
| --- | --- |
| Scope | Full build: expand `docs/DESIGN.md`, wire tokens in `global.css`, update components |
| Docs shape | Single `docs/DESIGN.md` as source of truth (no split component doc, no separate `tokens.css`) |
| Elevation | Overlay-only navy-tinted shadows; content cells stay hairline/flat |
| Solutions dropdown | Fallback four core offers as in-page anchors + All solutions; CMS children still win |
| Loading | Form submit only (spinner + `aria-busy`); no page skeletons |

## Non-goals

- Public `/ms` or `/zh` routes (Phase 7); locale type rules still ship via `:lang()` for prep
- Soft card elevation / SaaS-style multi-layer shadows on content
- New icon npm dependency or icon font
- Chart library; tokens only for SVG/CSS diagrams
- Page-level skeleton loaders or preview busy overlays beyond existing preview copy

## Architecture

1. **Docs:** Expand `docs/DESIGN.md` to include all token tables and component behavior (replace the short Phase 5 note; preserve CTA, theme, fonts/images notes).
2. **Runtime tokens:** Extend `@theme` / `:root` / `[data-theme='dark']` in `web/src/styles/global.css`.
3. **Components:** Update existing primitives and pages:
   - `web/src/components/ui/EmptyState.astro`, `Alert.astro`
   - `web/src/pages/404.astro`
   - `web/src/components/sections/ContactForm.astro` (+ shared `.btn.is-loading` / `.spinner`)
   - `web/src/components/Header.astro` (z-index tokens, overlay shadow, Solutions fallback children)
   - `web/src/components/FallbackSolutions.astro` (stable section `id`s for anchors)
   - i18n keys as needed for loading / empty / nav labels

Semantic color tokens already exist (`--bg`, `--fg`, `--primary`, `--accent`, `--danger`, `--success`, etc.). This pass does not redesign the palette.

---

## Tokens

### Breakpoints

Named reference tokens (documentation + CSS custom properties). Media queries continue to use literal `min-width` values matching these names (custom properties in `@media` are unreliable across engines).

| Token | Value | Role |
| --- | --- | --- |
| `--bp-sm` | `640px` | Container gutters |
| `--bp-md` | `768px` | Display type tightening; tablet |
| `--bp-lg` | `1024px` | Desktop header; hide mobile nav (`lg:`) |
| `--bp-xl` | `1280px` | Wider nav chrome |
| `--bp-2xl` | `1536px` | Optional wide ceiling |

Align new layout rules to this set only.

### Spacing

4px base. Prefer `.section-pad` / `.container-site` for page rhythm; use scale for gaps, stacks, and component padding.

| Token | Value |
| --- | --- |
| `--space-0` | `0` |
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-5` | `1.5rem` |
| `--space-6` | `2rem` |
| `--space-7` | `2.5rem` (new) |
| `--space-8` | `3rem` |
| `--space-9` | `3.5rem` (new) |
| `--space-10` | `4rem` |
| `--space-12` | `5rem` (new) |
| `--space-16` | `7rem` (new) |

### Elevation

**Content:** Hairline cells (`.card` / `.cell`). `--shadow-sm`, `--shadow-md`, `--shadow-lg` remain `none` on content surfaces.

**Overlays only:**

| Token | Use |
| --- | --- |
| `--shadow-overlay` | Nav disclosure panel, floating menus |
| `--shadow-overlay-strong` | Mobile nav sheet edge / sticky chrome if needed |

Light theme: navy-tinted soft shadow (e.g. `0 8px 24px rgb(0 12 40 / 0.12)`).  
Dark theme: deeper opacity, still subtle (e.g. `0 8px 28px rgb(0 0 0 / 0.45)`).  
Exact values chosen at implementation to clear contrast without looking like soft SaaS cards.

### Z-index

| Token | Value | Role |
| --- | --- | --- |
| `--z-base` | `0` | Content |
| `--z-raised` | `10` | In-section sticky |
| `--z-header` | `50` | Site header |
| `--z-dropdown` | `60` | Nav disclosure |
| `--z-overlay` | `70` | Mobile nav / scrims |
| `--z-skip` | `100` | Skip link |

Replace hard-coded `z-50` / `z-index: 100` where Header / skip-link are touched.

### Type scale

Font: Plus Jakarta Sans Variable + CJK system fallbacks. All sizes multiply by `--font-scale`.

#### Display (keep fluid clamps)

| Class | Size | Weight | LH EN (base / md+) | Tracking EN (base / md+) |
| --- | --- | --- | --- | --- |
| `.display-xl` | `clamp` ~1.75→3.75rem | 700 | 1.12 / 1.08 | −0.03 / −0.04 |
| `.display-lg` | ~1.5→2.75rem | 700 | 1.15 / 1.12 | −0.028 / −0.035 |
| `.display-md` | ~1.25→2rem | 700 | 1.20 / 1.15 | −0.025 / −0.03 |

#### Body / UI (new named roles where missing)

| Class | Size | Weight | LH EN | Use |
| --- | --- | --- | --- | --- |
| `.body-lg` | `1.125rem` | 400 | 1.65 | Lead paragraphs |
| `.body-md` | `1rem` | 400 | 1.6 | Default body |
| `.body-sm` | `0.875rem` | 400 | 1.55 | Secondary / dense |
| `.label` | `0.875rem` | 500 | 1.4 | Form labels (existing class) |
| `.caption` | `0.75rem` | 400 | 1.45 | Meta, helper |
| `.eyebrow` | `0.75rem` | 500 | 1.35 | Mono uppercase (existing) |

#### Locale adjustments (`:lang(ms)` / `:lang(zh)`)

| Role | MS line-height | ZH line-height | Tracking |
| --- | --- | --- | --- |
| Display | EN + 0.06 | EN + 0.08 | MS: keep slight negative; ZH: `letter-spacing: 0` |
| Body | EN + 0.08 | EN + 0.12 | ZH: no negative tracking |
| Label / caption | EN + 0.05 | EN + 0.08 | Same as above |

Also: Malay headings keep `hyphens: auto`. Chinese: no hyphenation; prefer `line-break: strict` on display if wrapping is harsh. Measure: `.prose-measure` (~62ch); flexible containers for longer Malay copy.

### Icons

- Inline SVG only; no new icon package.
- Stroke `currentColor`; width `1.5` (dense) to `2` (chrome).
- Sizes: 16 / 20 / 24 (`size-4` / `size-5` / `size-6`); touch target ≥44px via control padding.
- `stroke-linecap` / `stroke-linejoin`: `round`.
- Never color alone for meaning; decorative icons `aria-hidden="true"`.
- Prefer hairline technical marks over filled decorative icons in marketing sections.

### Imagery and photography

- Real enterprise / professional context (workflows, offices, Malaysian settings). Avoid stock handshake clichés and neon AI art.
- Heroes: full-bleed edge-to-edge. Content images: hairline cells, not soft floating cards.
- Grade: cool neutrals + navy; cyan/lime reserved for UI chrome, not heavy photo overlays.
- Always per-locale alt; Sanity CDN WebP/AVIF + `srcset`; LQIP OK; lazy below fold; LCP eager + preload (existing).
- Team photos: consistent headroom, calm lighting, no heavy filters.

### Chart and diagram colors

| Token | Maps to |
| --- | --- |
| `--chart-1` | `--primary` |
| `--chart-2` | `--accent` |
| `--chart-3` | Navy structure (`#001F5C`; lightened in dark theme) |
| `--chart-4` | `--fg-subtle` |
| `--chart-grid` | `--grid-line` |
| `--chart-positive` | `--success` |
| `--chart-negative` | `--danger` |

Decorative SVG continues to prefer `--illust-*`. Charts/diagrams use `--chart-*`. Do not convey meaning by cyan vs lime alone; add labels or patterns.

### Motion

| Token | Value |
| --- | --- |
| `--duration-fast` | `160ms` |
| `--duration-base` | `240ms` |
| `--duration-slow` | `480ms` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

**Allowed:** opacity/transform fades, header condensation, nav disclosure, reveal-on-scroll, view-transition crossfade, form spinner rotation, overlay open ≤240ms.

**Disallowed:** bounce springs, long decorative loops without Pause/Play, motion required for comprehension.

**Reduced motion:** existing global kill-switch; overlays snap open/close; spinner becomes static + text.

---

## Component specs

### 404

- Page: `web/src/pages/404.astro` using `EmptyState`.
- Eyebrow `404`, `titleAs="h1"`, body, primary CTA to home (`.btn-cta`).
- Layout: `.container-site`, vertically centered, min-height ~60dvh.
- `noindex` remains. No required illustration.

### Empty state

- Primitive: `.empty-state` + `EmptyState.astro`.
- Dashed border, muted surface, optional eyebrow, title (`h1`/`h2`), body, one primary action, optional slot.
- Copy must state what is empty and the next step.
- Used for 404 and CMS-empty lists (e.g. news).

### Form validation and success

- Field invalid: `aria-invalid="true"`, error text in `.field-error` via `aria-describedby`, border `--danger`.
- Show field errors after blur or submit (existing contact timing); not on first keystroke.
- Form-level: `Alert` with `.alert-danger` (`role="alert"`) or `.alert-success` (`role="status"`).
- On error: preserve entered values. On success: clear success messaging + next-step copy; prevent double submit while busy.

### Form loading

- On submit: `aria-busy="true"` on form, disable submit, show spinner, swap label to i18n “Sending…” (or existing equivalent).
- Reusable pattern: `.btn.is-loading` + `.spinner` (1.5px stroke, `--primary`, rotate `--duration-slow` linear).
- Under `prefers-reduced-motion`: no spin; keep busy text.
- Apply on contact form; document for future forms. No page skeletons.

### Mobile nav

- Full-viewport panel at `--z-overlay`; optional `--shadow-overlay-strong` on sheet edge.
- Body scroll lock; focus trap; Escape closes; focus returns to menu toggle.
- Open/close ≤ `--duration-base` opacity (instant when reduced motion).
- Nested children indented (existing pattern); Solutions fallback children appear here.
- Footer of panel: font size + theme toggles, full-width Get in touch.

### Solutions dropdown

**Fallback children** (when CMS item has no children), desktop disclosure + mobile nest:

1. All solutions → `/solutions/` (parent overview; also keep parent trigger label “Solutions”)
2. OpenText ECM → `/solutions/#opentext-ecm`
3. SAP & OpenText integrations → `/solutions/#sap-integrations`
4. Application Management Services → `/solutions/#ams`
5. System development → `/solutions/#system-development`

**Implementation notes:**

- Add matching `id` attributes on offer blocks in `FallbackSolutions.astro`.
- Wire fallback in `Header.astro` fallback link list (and any shared nav builder if extracted).
- If CMS provides children, use CMS only (no merge of invented anchors).
- Desktop: click to toggle (not hover-only); one disclosure open at a time; outside click + Escape close; panel `--z-dropdown` + `--shadow-overlay`; full keyboard support (existing binder, verify after token/CSS changes).

### CTA class note

Runtime primary conversion class is `.btn-cta` (lime `--accent`). `DESIGN.md` historically said `.btn-primary`; the expanded doc must match runtime (`.btn-cta`, `.btn-brand`, `.btn-ghost`, `.btn-on-dark`).

---

## Implementation outline (for planning)

1. Expand `docs/DESIGN.md` with all tables above.
2. Add CSS tokens (breakpoints, spacing gaps, elevation overlays, z-index, chart colors, body/caption type, `:lang` line-heights).
3. Apply z-index + overlay shadow on Header / skip-link / dropdown panels.
4. Standardize form loading (`.spinner`, `.btn.is-loading`) on ContactForm.
5. Verify EmptyState / 404 against empty + 404 specs (minimal markup tweaks if needed).
6. Solutions fallback children + offer `id`s; confirm mobile nest + desktop disclosure.
7. i18n strings for any new visible labels.
8. Targeted checks: typecheck/lint if available; keyboard pass on nav; reduced-motion smoke; visual check light/dark.

## Success criteria

- `DESIGN.md` documents every token and component behavior listed here.
- New CSS tokens exist and are used by Header, skip-link, dropdown, spinner, and type roles.
- Contact form loading/validation/success match the spec.
- 404 and empty states match the empty-state spec.
- Solutions fallback dropdown/mobile children deep-link to working anchors.
- Overlay shadows appear only on overlays; content cells remain flat/hairline.
- `prefers-reduced-motion` respected for nav, spinner, and transitions.
