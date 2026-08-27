# Malejemplo — Web

Marketing site for Malejemplo, starting with the GATE.24 DaVinci Resolve plugin. Built with
[Astro](https://astro.build) + React islands.

The living brief with every product/design/business decision behind this site is
[`GATE24_Web_Brief_v2.md`](./GATE24_Web_Brief_v2.md) — read that before making structural changes,
it's the source of truth, not this README.

## Status

Functionally complete for a first launch: all 13 presets have real graded stills, the screencast is
recorded and embedded, forms/newsletter/analytics wiring is in place, and the GATE.24 Gumroad page is
live and linked. English content only (Spanish is a planned phase 2, see brief section 1). What's
left is mostly business/ops, not build work — see "Open items" below.

## Commands

| Command           | Action                                      |
| :----------------- | :------------------------------------------ |
| `npm install`       | Install dependencies                        |
| `npm run dev`       | Start local dev server at `localhost:4321`  |
| `npm run build`     | Build production site to `./dist/`          |
| `npm run preview`   | Preview the production build locally        |

## Configuration

Copy `.env.example` to `.env` and fill in:

- `PUBLIC_GA_MEASUREMENT_ID` — Google Analytics; the cookie banner only loads it after consent. Not
  set yet — decide if/when to turn this on (brief section 8).
- `PUBLIC_NEWSLETTER_FORM_ACTION` / `PUBLIC_CONTACT_FORM_ACTION` — Formspree endpoints, already live.
- `PUBLIC_GUMROAD_URL` — already live: `https://malejemplo6.gumroad.com/l/gate24`.

Also update `SITE_URL` in `astro.config.mjs` once a real domain is registered (brief section 4 — this
is deliberately still deferred, doesn't block anything else).

## Open items

- **Domain** — not registered yet, deliberately deferred (brief section 4).
- **Mobile drag** on the `/gate24` before/after slider is unreliable on touch devices; deprioritized
  since most buyers will visit from desktop, where DaVinci Resolve itself runs (brief section 11bis).
- **Google Analytics** — not turned on; decide if/when.
- **8 of the 13 preset gallery photos** only have an "after" still (by design — the gallery just
  needs one image per preset, not a before/after pair; the 5 "flagship" presets in the interactive
  showcase have both).

## Project structure

```
src/
├── components/         # Header, Footer, forms, sliders, ResolvePanel, etc.
├── content/guides/      # Markdown guide articles (astro:content collection)
├── data/                # presets.ts, products.ts, social.ts -- edit these, not the pages, for content
├── layouts/             # BaseLayout.astro (head/meta/SEO, header, footer, cookie consent)
├── pages/               # File-based routes
└── styles/global.css    # Design tokens (colors, type) and base styles

scripts/                 # One-off asset processing scripts (image optimization), kept for reference
public/showcase/         # Real graded preset stills (18 files)
```
