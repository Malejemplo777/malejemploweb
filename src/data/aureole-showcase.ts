export interface AureoleShot {
  name: string;
  blurb: string;
  offSrc: string;
  onSrc: string;
  /** CSS transform-origin for the zoomed-in view; defaults to center. */
  zoomOrigin?: string;
}

// v0 renders from WEB_MEDIA/01_web_optimizado -- final examples get re-shot
// from the production "WEB" timeline once GATE.24's crop is uniform across
// all hero planos (see LEEME_PLAN.md).
export const aureoleShowcase: AureoleShot[] = [
  {
    name: 'Water & Pines',
    blurb: 'Low sun raking across the water, soft glow in the reflections.',
    offSrc: '/aureole/before-after/P1042466_agua-pinos_off_2560.webp',
    onSrc: '/aureole/before-after/P1042466_agua-pinos_on_2560.webp',
  },
  {
    name: 'Headlights at Night',
    blurb: 'A single point source in the dark — the classic halation case.',
    offSrc: '/aureole/before-after/P1042528_faros_off_2560.webp',
    onSrc: '/aureole/before-after/P1042528_faros_on_2560.webp',
  },
  {
    name: 'Sun at the Horizon',
    blurb: 'Backlit across the water — Edge Halation around the sun and the treeline.',
    offSrc: '/aureole/before-after/P1042507_sol-horizonte_off_2560.webp',
    onSrc: '/aureole/before-after/P1042507_sol-horizonte_on_2560.webp',
  },
  {
    name: 'Cabin at Night',
    blurb: 'Warm porch light in the dark, glow wrapping around the source.',
    offSrc: '/aureole/before-after/P1042390_cabana-noche_off_2560.webp',
    onSrc: '/aureole/before-after/P1042390_cabana-noche_on_2560.webp',
    zoomOrigin: '68% 28%',
  },
];
