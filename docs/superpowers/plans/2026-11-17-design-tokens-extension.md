# Design Tokens Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved design-token extension (docs + CSS + component updates) for breakpoints, spacing, elevation/z-index, type scale (EN/MS/ZH), icons/imagery/charts/motion guidance, plus 404/empty/form loading-validation-success, mobile nav, and Solutions dropdown behavior.

**Architecture:** Expand `docs/DESIGN.md` as the single source of truth. Wire runtime tokens into `web/src/styles/global.css`. Update existing Header, FallbackSolutions, ContactForm, EmptyState/404, and i18n — no new token package, no icon npm dep, no page skeletons.

**Tech Stack:** Astro static site, Tailwind CSS v4 (`@theme` in `global.css`), i18n JSON (`en`/`ms`/`zh`), inline SVG icons.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-11-17-design-tokens-extension-design.md`
- Elevation: overlay-only navy-tinted shadows; content `--shadow-sm/md/lg` stay `none`
- Loading: form submit only (`.btn.is-loading` + `.spinner`)
- Solutions fallback children when CMS has none; CMS children win when present
- Public site remains English-only; still ship `:lang(ms)` / `:lang(zh)` type rules
- No new dependencies; no em dashes in user-facing copy
- Visible strings only via i18n / Sanity
- Do not commit unless the user explicitly asks

---

## File map

| File | Responsibility |
| --- | --- |
| `docs/DESIGN.md` | Full token tables + component specs (replaces short Phase 5 note) |
| `web/src/styles/global.css` | `@theme` tokens, type roles, spinner, overlay shadows, lang LH |
| `web/src/components/Header.astro` | z-index tokens, overlay shadow, Solutions fallback children |
| `web/src/components/FallbackSolutions.astro` | Offer `id`s for anchors |
| `web/src/components/sections/ContactForm.astro` | `.btn.is-loading` / `.spinner` wiring |
| `web/src/components/ui/EmptyState.astro` | Align body class with type scale if needed |
| `web/src/pages/404.astro` | Confirm against 404 spec (minimal change) |
| `web/src/components/icons/Icon.astro` | Confirm stroke style matches icon guide |
| `web/src/i18n/{en,ms,zh}.json` | Nav Solutions child labels + any loading strings |

---

### Task 1: Expand `docs/DESIGN.md`

**Files:**
- Modify: `docs/DESIGN.md`
- Reference: `docs/superpowers/specs/2026-11-17-design-tokens-extension-design.md`

**Interfaces:**
- Consumes: Approved spec tables
- Produces: Canonical DESIGN.md sections used by later tasks (token names must match CSS)

- [ ] **Step 1: Replace DESIGN.md content**

Rewrite `docs/DESIGN.md` to include, in order:

1. CTA hierarchy (correct classes: `.btn-cta`, `.btn-brand`, `.btn-ghost`, `.btn-on-dark` — not `.btn-primary`)
2. Breakpoints table (`--bp-sm` … `--bp-2xl`)
3. Spacing scale (`--space-0` … `--space-16` as in spec)
4. Elevation + z-index
5. Type scale (display, body, locale LH)
6. Icons, imagery, chart colors, motion
7. Component specs: 404, empty, form validation/success, form loading, mobile nav, Solutions dropdown
8. Keep theme toggle + fonts/images notes from current DESIGN.md

Copy exact token names and values from the spec. No TBD.

- [ ] **Step 2: Spot-check README pointer**

Confirm `README.md` still links to `docs/DESIGN.md` (no path change needed).

- [ ] **Step 3: Verification**

Open `docs/DESIGN.md` and confirm every token name in the spec appears once with a value.

---

### Task 2: CSS tokens and type roles in `global.css`

**Files:**
- Modify: `web/src/styles/global.css`

**Interfaces:**
- Consumes: Token names from Task 1 / spec
- Produces: CSS variables and utility classes used by Header, forms, type

- [ ] **Step 1: Extend `@theme` block**

In the existing `@theme { ... }` block (around lines 11–64), add after current space tokens:

```css
  --space-0: 0;
  --space-7: 2.5rem;
  --space-9: 3.5rem;
  --space-12: 5rem;
  --space-16: 7rem;

  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;

  --z-base: 0;
  --z-raised: 10;
  --z-header: 50;
  --z-dropdown: 60;
  --z-overlay: 70;
  --z-skip: 100;

  --chart-1: var(--primary);
  --chart-2: var(--accent);
  --chart-3: #001f5c;
  --chart-4: var(--fg-subtle);
  --chart-grid: var(--grid-line);
  --chart-positive: var(--success);
  --chart-negative: var(--danger);
```

Keep existing `--space-1`…`--space-6`, `--space-8`, `--space-10`. Insert `--space-0` before `--space-1`. Do not remove illustration tokens.

- [ ] **Step 2: Overlay shadows on light/dark themes**

In `:root, [data-theme='light']` replace or add:

```css
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --shadow-overlay: 0 8px 24px rgb(0 12 40 / 0.12);
  --shadow-overlay-strong: 0 12px 40px rgb(0 12 40 / 0.18);
```

In `[data-theme='dark']`:

```css
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --shadow-overlay: 0 8px 28px rgb(0 0 0 / 0.45);
  --shadow-overlay-strong: 0 16px 48px rgb(0 0 0 / 0.55);
  --chart-3: #4a6fa5;
```

- [ ] **Step 3: Body/caption utilities + locale line-heights**

In `@layer utilities`, after existing `.display-*` / `.eyebrow` blocks, add:

```css
  .body-lg {
    font-size: calc(1.125rem * var(--font-scale));
    line-height: 1.65;
    font-weight: 400;
  }
  .body-md {
    font-size: calc(1rem * var(--font-scale));
    line-height: 1.6;
    font-weight: 400;
  }
  .body-sm {
    font-size: calc(0.875rem * var(--font-scale));
    line-height: 1.55;
    font-weight: 400;
  }
  .caption {
    font-size: calc(0.75rem * var(--font-scale));
    line-height: 1.45;
    font-weight: 400;
  }

  :lang(ms) .display-xl { line-height: 1.18; }
  :lang(ms) .display-lg { line-height: 1.21; }
  :lang(ms) .display-md { line-height: 1.26; }
  :lang(ms) .body-lg { line-height: 1.73; }
  :lang(ms) .body-md { line-height: 1.68; }
  :lang(ms) .body-sm { line-height: 1.63; }
  :lang(ms) .label { line-height: 1.45; }
  :lang(ms) .caption { line-height: 1.5; }

  :lang(zh) .display-xl,
  :lang(zh) .display-lg,
  :lang(zh) .display-md {
    letter-spacing: 0;
    line-break: strict;
  }
  :lang(zh) .display-xl { line-height: 1.2; }
  :lang(zh) .display-lg { line-height: 1.23; }
  :lang(zh) .display-md { line-height: 1.28; }
  :lang(zh) .body-lg { line-height: 1.77; letter-spacing: 0; }
  :lang(zh) .body-md { line-height: 1.72; letter-spacing: 0; }
  :lang(zh) .body-sm { line-height: 1.67; letter-spacing: 0; }
  :lang(zh) .label { line-height: 1.48; letter-spacing: 0; }
  :lang(zh) .caption { line-height: 1.53; letter-spacing: 0; }
```

Also add md+ MS/ZH overrides if EN md+ display LH is tighter (add ~0.06/0.08 on top of the md+ EN values inside `@media (min-width: 768px)`).

- [ ] **Step 4: Spinner + loading button + skip z-index**

Update `.skip-link` to `z-index: var(--z-skip)`.

Add:

```css
  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 9999px;
    border: 1.5px solid color-mix(in oklab, var(--primary) 30%, transparent);
    border-top-color: var(--primary);
    animation: jsone-spin var(--duration-slow) linear infinite;
  }
  .btn.is-loading .spinner,
  .btn.is-loading [data-submit-spinner] {
    display: inline-block;
  }
  @keyframes jsone-spin {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
      border-top-color: color-mix(in oklab, var(--primary) 30%, transparent);
      background: color-mix(in oklab, var(--primary) 25%, transparent);
    }
  }
```

- [ ] **Step 5: Verify CSS parses**

Run from `web/`:

```bash
npm run check
```

Expected: no new CSS-related errors from these tokens (existing project issues OK only if pre-existing; fix anything introduced).

---

### Task 3: Header z-index, overlay shadow, Solutions fallback

**Files:**
- Modify: `web/src/components/Header.astro`
- Modify: `web/src/i18n/en.json`, `web/src/i18n/ms.json`, `web/src/i18n/zh.json`

**Interfaces:**
- Consumes: `--z-header`, `--z-dropdown`, `--z-overlay`, `--shadow-overlay`, `--shadow-overlay-strong`
- Produces: Fallback Solutions children with hrefs `/solutions/` and hash anchors

- [ ] **Step 1: Add i18n keys**

In each locale `nav` object add:

```json
"solutionsAll": "All solutions",
"solutionsEcm": "OpenText ECM",
"solutionsSap": "SAP & OpenText integrations",
"solutionsAms": "Application Management Services",
"solutionsDev": "System development"
```

Translate appropriately in `ms.json` / `zh.json` (complete sentences/phrases, no em dashes).

- [ ] **Step 2: Build Solutions fallback children**

In `Header.astro` `fallbackLinks`, change the Solutions entry to include children:

```ts
{
  label: t(locale, 'nav.solutions'),
  href: localePath(locale, '/solutions/'),
  children: [
    {label: t(locale, 'nav.solutionsAll'), href: localePath(locale, '/solutions/')},
    {label: t(locale, 'nav.solutionsEcm'), href: localePath(locale, '/solutions/#opentext-ecm')},
    {label: t(locale, 'nav.solutionsSap'), href: localePath(locale, '/solutions/#sap-integrations')},
    {label: t(locale, 'nav.solutionsAms'), href: localePath(locale, '/solutions/#ams')},
    {label: t(locale, 'nav.solutionsDev'), href: localePath(locale, '/solutions/#system-development')},
  ],
},
```

Ensure the `fallbackLinks.map` that copies `children` still works (About already has children).

- [ ] **Step 3: Apply z-index and overlay shadow classes**

- Header root: use `z-[var(--z-header)]` instead of `z-50` (or style attribute / arbitrary value Tailwind supports).
- Dropdown panel wrapper: `z-[var(--z-dropdown)]`; inner panel add `shadow-[var(--shadow-overlay)]`.
- Mobile nav: `z-[var(--z-overlay)]`; add `shadow-[var(--shadow-overlay-strong)]` on the sheet container if it reads clearly.

Keep existing disclosure JS (click, Escape, outside click, focus trap).

- [ ] **Step 4: Manual keyboard check list**

Verify (dev server or build preview):

1. Tab to Solutions → Enter/Space opens
2. Escape closes
3. Mobile: Solutions children visible indented
4. CMS nav with children still overrides (no merge)

---

### Task 4: Solutions offer anchor IDs

**Files:**
- Modify: `web/src/components/FallbackSolutions.astro`

**Interfaces:**
- Consumes: Hash IDs from Task 3
- Produces: DOM `id`s `opentext-ecm`, `sap-integrations`, `ams`, `system-development`

- [ ] **Step 1: Add id to offers data**

```ts
const offers: {
  id: string
  title: string
  forKey: string
  body: string
  icon: ServiceIconName
}[] = [
  {
    id: 'opentext-ecm',
    title: 'solutions.offerEcmTitle',
    forKey: 'solutions.offerEcmFor',
    body: 'solutions.offerEcmBody',
    icon: 'layers',
  },
  {
    id: 'sap-integrations',
    title: 'solutions.offerSapTitle',
    forKey: 'solutions.offerSapFor',
    body: 'solutions.offerSapBody',
    icon: 'workflow',
  },
  {
    id: 'ams',
    title: 'solutions.offerAmsTitle',
    forKey: 'solutions.offerAmsFor',
    body: 'solutions.offerAmsBody',
    icon: 'support',
  },
  {
    id: 'system-development',
    title: 'solutions.offerDevTitle',
    forKey: 'solutions.offerDevFor',
    body: 'solutions.offerDevBody',
    icon: 'plug',
  },
]
```

- [ ] **Step 2: Render id on list items**

```astro
<li id={item.id} class="flex flex-col gap-3 bg-bg-elevated p-5 sm:p-6" data-reveal-child>
```

- [ ] **Step 3: Verify anchors**

After build/preview, `/solutions/#ams` scrolls to AMS card (scroll-margin already on `[id]`).

---

### Task 5: Form loading + EmptyState/404 alignment

**Files:**
- Modify: `web/src/components/sections/ContactForm.astro`
- Modify: `web/src/components/ui/EmptyState.astro` (if needed)
- Modify: `web/src/pages/404.astro` (if needed)
- Review: `web/src/components/icons/Icon.astro`

**Interfaces:**
- Consumes: `.spinner`, `.btn.is-loading` from Task 2
- Produces: Contact submit uses shared loading pattern

- [ ] **Step 1: Update ContactForm spinner markup**

Replace the submit spinner span classes with:

```astro
<span class="spinner hidden" data-submit-spinner aria-hidden="true"></span>
```

In `setSubmitting`, also toggle `is-loading` on the button:

```js
submit.classList.toggle('is-loading', on)
spinner?.classList.toggle('hidden', !on)
```

Keep `aria-busy` on the form and `sendingLabel` swap (already uses `form.sending`).

- [ ] **Step 2: EmptyState body class**

Change body paragraph to use `body-md` (keep `max-w-prose` / muted color):

```astro
{body && <p class="body-md mx-auto max-w-prose text-fg-muted">{body}</p>}
```

- [ ] **Step 3: 404**

Confirm `404.astro` already matches spec (EmptyState, eyebrow 404, h1, CTA). No structural change unless missing.

- [ ] **Step 4: Icon stroke check**

Read `Icon.astro` SVG attributes; ensure `stroke="currentColor"`, round caps/joins, fill none for stroke icons. Adjust only if they diverge from the icon guide.

---

### Task 6: Verification

**Files:** none new

- [ ] **Step 1: Typecheck**

```bash
cd web && npm run check
```

Expected: pass, or only pre-existing unrelated diagnostics.

- [ ] **Step 2: Build**

```bash
cd web && npm run build
```

Expected: success; `dist` includes solutions page with offer ids.

- [ ] **Step 3: Grep sanity**

```bash
rg "opentext-ecm|shadow-overlay|--z-skip|body-lg|solutionsAll" web docs/DESIGN.md
```

Expected: hits in CSS, Header, FallbackSolutions, i18n, DESIGN.md.

- [ ] **Step 4: Report**

List what changed, any caveats (CMS nav override, EN-only public), verification commands run.

---

## Spec coverage checklist

| Spec item | Task |
| --- | --- |
| Breakpoints | 1, 2 |
| Spacing scale | 1, 2 |
| Elevation / z-index | 1, 2, 3 |
| Type scale + MS/ZH | 1, 2, 5 |
| Icons / imagery / charts / motion docs | 1 (+ Icon check in 5) |
| Chart CSS tokens | 2 |
| 404 / empty | 1, 5 |
| Form validation/success/loading | 1, 5 |
| Mobile nav behavior + tokens | 1, 3 |
| Solutions dropdown + anchors | 3, 4 |

## Self-review notes

- No TBD placeholders in tasks
- Token names consistent across DESIGN.md, CSS, Header
- Commit steps omitted (user must request commits)
