import type { ImageMetadata } from 'astro';
import m07 from '../assets/shots/m07-cinema35.webp';
import m02 from '../assets/shots/m02-original.webp';
import m04 from '../assets/shots/m04-original.webp';
import m05 from '../assets/shots/m05-cinema35.webp';
import m08 from '../assets/shots/m08-dustywestern.webp';
import type { Lang } from '../i18n';

// Frames from the GATE.24 shoot (D:\GATE24_CONTENIDO\03_fotogramas), converted
// to WebP. `cover` in a guide's frontmatter is one of these keys.
export interface Shot {
  src: ImageMetadata;
  alt: Record<Lang, string>;
  /** Short caption shown on the image, e.g. which look it carries. */
  caption: Record<Lang, string>;
}

export const shots = {
  'm07-cinema35': {
    src: m07,
    alt: { en: 'A figure walking along a beach at sunset, graded with the Cinema 35 look', es: 'Una figura camina por una playa al atardecer, con el look Cinema 35' },
    caption: { en: 'Cinema 35', es: 'Cinema 35' },
  },
  'm02-original': {
    src: m02,
    alt: { en: 'Rooftop view over a town street lined with pine trees under a clear sky', es: 'Vista desde una azotea sobre una calle con pinos y cielo despejado' },
    caption: { en: 'Original', es: 'Original' },
  },
  'm04-original': {
    src: m04,
    alt: { en: 'A wet street at night with red tail lights and street lamps', es: 'Una calle mojada de noche con luces rojas de coches y farolas' },
    caption: { en: 'Original', es: 'Original' },
  },
  'm05-cinema35': {
    src: m05,
    alt: { en: 'A curved white building with a street mirror and a school-crossing sign', es: 'Un edificio blanco curvo con un espejo de calle y una señal de paso escolar' },
    caption: { en: 'Cinema 35', es: 'Cinema 35' },
  },
  'm08-dustywestern': {
    src: m08,
    alt: { en: 'A paper cup of hot chocolate on a wooden bench in warm light', es: 'Un vaso de papel con chocolate caliente sobre un banco de madera con luz cálida' },
    caption: { en: 'Dusty Western', es: 'Dusty Western' },
  },
} satisfies Record<string, Shot>;

export type ShotKey = keyof typeof shots;
