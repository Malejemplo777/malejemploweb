export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: 'available' | 'coming-soon';
  href: string;
  /** Matches a data-theme block in global.css; omit for the neutral Malejemplo look. */
  theme: string;
  /** Spanish copy for the /es/ pages; name and href aren't translated. */
  es: { tagline: string; description: string };
}

// Home page lists this array as a catalogue so adding the next product later
// is just adding an entry here -- see GATE24_Web_Brief_v2.md section 3.
export const products: Product[] = [
  {
    slug: 'gate24',
    name: 'GATE.24',
    tagline: 'One-click cinematic finish for DaVinci Resolve.',
    description:
      'Crop bars, lens-tied vignette, stock-matched grain, and skin-safe contrast in one effect — 10 presets included.',
    status: 'available',
    href: '/gate24/',
    theme: 'gate24',
    es: {
      tagline: 'El acabado cinematográfico para DaVinci Resolve, en un clic.',
      description:
        'Barras de recorte, viñeta que imita la óptica, grano según la película y contraste que respeta la piel, todo en un solo efecto. Incluye 10 presets.',
    },
  },
];
