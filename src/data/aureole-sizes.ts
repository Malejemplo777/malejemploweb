export interface SizeDemo {
  title: string;
  paramLabel: string;
  blurb: string;
  /** CSS transform-origin for the zoomed-in view; defaults to center. */
  zoomOrigin?: string;
  sizes: { label: string; src: string }[];
}

// Raw renders from CLE/.../WEB_MEDIA/05_video_ab, cropped + transcoded for
// web (crop=GATE.24 bars, scale 1280w, h264 crf23) in WEB_MEDIA/05_video_ab/web.
export const aureoleSizeDemos: SizeDemo[] = [
  {
    title: 'Edge Halation Size',
    paramLabel: 'beach walk',
    blurb: 'Width of the Edge Halation ring: S=5px, M=9.5px, L=14px, XL=22px at 4K.',
    zoomOrigin: '58% 30%',
    sizes: [
      { label: 'Off', src: '/aureole/sizes/playa_off.mp4' },
      { label: 'S', src: '/aureole/sizes/playa_edge-S.mp4' },
      { label: 'M', src: '/aureole/sizes/playa_edge-M.mp4' },
      { label: 'L', src: '/aureole/sizes/playa_edge-L.mp4' },
      { label: 'XL', src: '/aureole/sizes/playa_edge-XL.mp4' },
    ],
  },
  {
    title: 'General Glow Size',
    paramLabel: 'water & pines',
    blurb: 'Width and softness of the diffuse glow: M is the original behavior, L/XL push toward a wider, warmer film halo.',
    zoomOrigin: '58% 50%',
    sizes: [
      { label: 'Off', src: '/aureole/sizes/agua-pinos_off.mp4' },
      { label: 'S', src: '/aureole/sizes/agua-pinos_glow-S.mp4' },
      { label: 'M', src: '/aureole/sizes/agua-pinos_glow-M.mp4' },
      { label: 'L', src: '/aureole/sizes/agua-pinos_glow-L.mp4' },
      { label: 'XL', src: '/aureole/sizes/agua-pinos_glow-XL.mp4' },
    ],
  },
];
