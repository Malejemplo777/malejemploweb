export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: 'available' | 'coming-soon';
  href: string;
  /** Matches a data-theme block in global.css; omit for the neutral Malejemplo look. */
  theme: string;
  /** How long this slide stays up in the home carousel, in ms. */
  carouselDuration: number;
}

// Home page lists this array as a catalogue so adding the next product later
// is just adding an entry here -- see GATE24_Web_Brief_v2.md section 3.
// Order matters: the home carousel opens on the first entry, so AUREOLE.650
// (the paid product) leads while GATE.24 is pay-what-you-want/free.
export const products: Product[] = [
  {
    slug: 'aureole',
    name: 'AUREOLE.650',
    tagline: 'Real film halation and glow for DaVinci Resolve, calibrated to real footage.',
    description:
      'Independent Edge Halation and General Glow, each with its own threshold and live preview — not one generic bloom over everything bright.',
    status: 'available',
    href: '/aureole/',
    theme: 'aureole',
    carouselDuration: 7000,
  },
  {
    slug: 'gate24',
    name: 'GATE.24',
    tagline: 'One-click cinematic finish for DaVinci Resolve.',
    description:
      'Crop bars, lens-tied vignette, stock-matched grain, and skin-safe contrast in one effect — 13 presets included.',
    status: 'available',
    href: '/gate24/',
    theme: 'gate24',
    carouselDuration: 4500,
  },
];
