# Homepage Proof section design

**Date:** 2026-11-17  
**Status:** Approved for implementation  
**Theme:** Precision Engineering (`docs/DESIGN.md`)  
**Content:** `docs/content-brief.md` § Proof

## Decisions

- **Composition:** Vertical stack (one job: credibility once).
- **Testimonial:** Optional single reviewed CMS quote only; omit when absent (no placeholder).
- **Certifications:** Clients page only; not on homepage Proof.
- **Metrics:** Homepage once; each metric has its own count context.

## Section frame

- Surface: muted band, flat, hairline cells only.
- Chrome: eyebrow · headline · one supporting sentence · CTAs (View Clients / Company Overview).
- Stack: logo/sector strip → metrics → partner badges (full) → one case teaser → optional testimonial → CTAs.
- Omit empty blocks; never invent logos, quotes, or awards.

## Components

| Component | Layout | Key fields | Mobile | Missing-asset fallback |
| --- | --- | --- | --- | --- |
| Partner badges | Hairline cell grid; full credential text | eyebrow, name, href?, logo? | Stack 1-col | Text wordmark; omit empty |
| Certifications | Hairline cells (Clients only) | heading, body?, title | Stack 1-col | Text title; omit empty |
| Client logo strip | Hairline grid 2→6 cols | eyebrow, logo+alt or label | 2-col; no marquee | Sector name cells; omit if none |
| Headline metrics | 3-col band; mono values | value, label, **context** per metric; optional band footnote | Stack 1-col | Drop incomplete; hide band if &lt;2 |
| Case teaser | Left primary rule, not a card | eyebrow, title, body, metric?, href? | Full width | Omit if title/body missing |
| Testimonial | Single hairline cell | quote, author?, role?, avatar? | Full width | Omit if no reviewed quote |

### Metric count definitions

| Value | Label | Counts |
| --- | --- | --- |
| 20+ | Years experience | Calendar years since founding (October 2006) |
| 80+ | Projects delivered | Completed implementation, AMS, and system-development engagements |
| 60+ | Enterprise clients | Distinct organisations engaged (not seats or named logos) |

## Cross-page placement

| Element | Home Proof | Solutions | Industries | Contact | Clients |
| --- | --- | --- | --- | --- | --- |
| Partner badges | Full | Compact | — | Compact **or** metrics | Full |
| Certifications | — | — | — | — | Full |
| Logo / sector strip | Yes | — | — | Never | Yes |
| Metrics | Once | — | — | Alt to badges | Yes |
| Case teaser | One | 1–2 | One | — | All |
| Single testimonial | Optional CMS | — | — | — | Later / gallery |
| Proof section chrome | Homepage-only | — | — | — | Own page CTA |

## Out of scope

- Inventing named client logos or testimonials.
- Public MS/ZH routes (Phase 7).
- Changing Hero / Why / CTA jobs.
