---
title: "Halation vs Bloom: What's the Difference (and Why It Matters for Grading)"
description: "Halation and bloom look similar but come from different physical causes in real film — here's the difference, and why treating them as one slider gets you the wrong trade-off."
publishDate: 2026-10-01
---

"Halation" and "bloom" get used interchangeably in a lot of plugin marketing, but on real film they come from **different physical causes** — and that difference is exactly why bundling them into one slider forces a bad trade-off.

## Bloom: light spreading before it hits the emulsion

Bloom (sometimes called "glow") is a soft, colorless spread around anything very bright — a window, a practical light, direct sun. It comes from light scattering inside the lens and diffusing across the whole bright area, roughly evenly in every direction. It has no preference for edges; a large blown-out sky blooms just as readily as a small hard light.

## Halation: light bouncing back through the emulsion

Halation is narrower and warmer — a reddish-orange ring specifically along **high-contrast edges**, classically around a streetlamp or a window frame against a dark background. It happens because light passes through the film's emulsion, hits the base or the camera's backing, and reflects back up through the emulsion a second time — tinted red because the anti-halation layer (there specifically to absorb this bounce-back) doesn't catch all of it. It's an edge phenomenon, not an area phenomenon.

## Why one slider doesn't work

Because they're physically different, they respond to different things:

- Bloom cares about **how bright** something is — raise a brightness threshold and you catch more of a blown sky along with your intended light source.
- Halation cares about **contrast at an edge** — a silhouette against a bright sky can halate even when nothing in the shot is fully blown out.

A single "halation" control that's actually doing both has to pick one threshold for two different jobs. Turn it up to get a visible edge ring on a dim streetlamp, and a bright sky starts blooming along with it. Turn it down to keep the sky clean, and the streetlamp's edge ring disappears.

## Treating them separately

This is the reasoning behind AUREOLE.650 splitting **Edge Halation** and **General Glow** into two independent mechanisms, each with its own threshold: Edge Halation reacts to contrast at edges (so a streetlamp against a dark background can ring strongly), General Glow reacts to sustained brightness (so a blown-out sky doesn't need to trigger the edge mechanism at all). You tune "what counts as a source" for each one separately, instead of finding a single number that's wrong for both.

<!-- TODO: embed a before/after pair showing the same shot with only Edge Halation vs only General Glow, once final renders exist -->
