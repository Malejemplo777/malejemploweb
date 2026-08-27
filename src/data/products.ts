export interface Product {
  slug: string;
  name: string;
  tagline: string;
  status: 'available' | 'coming-soon';
  href: string;
}

// Home page lists this array as a catalogue so adding the next product later
// is just adding an entry here -- see GATE24_Web_Brief_v2.md section 3.
export const products: Product[] = [
  {
    slug: 'gate24',
    name: 'GATE.24',
    tagline: 'One-click cinematic finish for DaVinci Resolve.',
    status: 'available',
    href: '/gate24',
  },
];
