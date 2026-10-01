---
title: "AUREOLE.650 vs Dehancer vs FilmConvert Halation: Which Halation Plugin Is Worth It?"
description: "A practical comparison of AUREOLE.650, Dehancer, and FilmConvert's Halation add-on for colorists adding real film halation and glow in DaVinci Resolve."
publishDate: 2026-10-01
---

If you're trying to add real film halation — that warm red bloom around bright edges, not just a generic glow — in DaVinci Resolve, you've probably run into **Dehancer**, **FilmConvert's Halation add-on**, and — if you're reading this — **AUREOLE.650**. Here's how they actually differ.

## The short version

- **FilmConvert** added Halation as a paid add-on to Nitrate in late 2023. It's one mechanism with one set of controls (sensitivity, strength, hue, softness) — there's no bloom control of its own; you get a bloom-like look by desaturating the halation to zero.
- **Dehancer** bundles halation into its film stock emulation — it's part of the overall look each stock profile produces, not a control you dial in on top of your existing grade. Depth comes from the stock library (60+ profiles), not from halation-specific parameters.
- **AUREOLE.650** treats **Edge Halation** (the contour ring along bright edges) and **General Glow** (the soft bloom over extended bright areas) as two separate, independently-tunable mechanisms — each with its own threshold, so a blown-out sky doesn't have to drown out a streetlamp. $15 one-time, beta.

## Feature by feature

| | Dehancer | FilmConvert (Halation add-on) | AUREOLE.650 |
|---|---|---|---|
| Price | $29/mo billed annually, or $999 lifetime (video) | $59 add-on + $119+ for Nitrate | $15 one-time (beta) |
| Halation vs. glow/bloom | Bundled with grain as one look | One mechanism; bloom = halation desaturated to zero | Two independent effects, each its own threshold |
| Live preview of what's detected as a source | No | No | Yes — Halation Mask, Glow Mask, and Affected Zone preview modes |
| GPU-accelerated | Yes | Yes | Yes (OpenCL) |
| Runs on | Resolve, Premiere, AE, FCP | Resolve, Premiere, FCP, AE | DaVinci Resolve (free or Studio) |

## Where each one actually makes sense

**Pick FilmConvert's Halation add-on** if you're already on Nitrate for its film stock emulation and just want a halation layer on top — one set of sliders, no separate glow mechanism to learn.

**Pick Dehancer** if halation is one piece of a bigger film-emulation workflow and you want it baked into a stock profile rather than controlled on its own.

**Pick AUREOLE.650** if a single threshold for "what counts as a bright source" keeps giving you the wrong trade-off — a streetlamp that needs a strong edge ring against a sky that shouldn't glow at all, or the other way around. Separating Edge Halation from General Glow means each gets its own threshold instead of splitting the difference.

## Worth knowing before you buy

AUREOLE.650 is currently in **beta**: verified on Windows with an AMD GPU, not yet tested on Nvidia, Intel, or Mac. The installer isn't code-signed yet. It runs on the free version of DaVinci Resolve — no Studio license required.

<!-- TODO: link to AUREOLE.650 product page CTA once the beta is out of the current testing pass -->
