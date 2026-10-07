export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: 'available' | 'coming-soon';
  href: string;
  /** Matches a data-theme block in global.css; omit for the neutral Malejemplo look. */
  theme: string;
}

// Home page lists this array as a catalogue so adding the next product later
// is just adding an entry here -- see GATE24_Web_Brief_v2.md section 3.
export const products: Product[] = [
  {
    slug: 'gate24',
    name: 'GATE.24',
    tagline: 'One-click cinematic finish for DaVinci Resolve.',
    description:
      'Crop bars, lens-tied vignette, stock-matched grain, and skin-safe contrast in one effect — 13 presets included.',
    status: 'available',
    href: '/gate24/',
    theme: 'gate24',
  },
];
