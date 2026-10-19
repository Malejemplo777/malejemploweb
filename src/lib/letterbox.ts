// Letterbox / pillarbox maths. Pure and framework-free so the page can run it
// at build time (the ratios table) and the React island at runtime.

export interface Ratio {
  id: string;
  /** width / height */
  value: number;
  /** Label shown on the chip, e.g. "2.39:1" */
  label: string;
}

export const ratios: Ratio[] = [
  { id: '2.39', value: 2.39, label: '2.39:1' },
  { id: '2.35', value: 2.35, label: '2.35:1' },
  { id: '2.20', value: 2.2, label: '2.20:1' },
  { id: '2.00', value: 2, label: '2:1' },
  { id: '1.85', value: 1.85, label: '1.85:1' },
  { id: '4:3', value: 4 / 3, label: '4:3' },
  { id: '1:1', value: 1, label: '1:1' },
  { id: '4:5', value: 4 / 5, label: '4:5' },
  { id: '9:16', value: 9 / 16, label: '9:16' },
];

export interface Source {
  id: string;
  w: number;
  h: number;
  label: string;
}

export const sources: Source[] = [
  { id: 'hd', w: 1920, h: 1080, label: '1920×1080' },
  { id: 'qhd', w: 2560, h: 1440, label: '2560×1440' },
  { id: 'uhd', w: 3840, h: 2160, label: '3840×2160' },
  { id: 'dci4k', w: 4096, h: 2160, label: '4096×2160' },
  { id: 'vertical', w: 1080, h: 1920, label: '1080×1920' },
];

export type Mode = 'letterbox' | 'pillarbox' | 'none';

export interface Bars {
  mode: Mode;
  /** Pixels of black on EACH side (top and bottom, or left and right). */
  bar: number;
  /** Bar size as a % of the dimension it cuts (height for letterbox,
   *  width for pillarbox). For letterbox this is the same scale as
   *  GATE.24's vertical crop control. */
  barPct: number;
  visibleW: number;
  visibleH: number;
  /** The ratio you really get once bars are rounded to whole pixels. */
  actual: number;
}

/** Bars needed to show `target` (width/height) inside a `w`x`h` frame. */
export function calcBars(w: number, h: number, target: number): Bars {
  const source = w / h;
  // Within a hair of equal: nothing to add. 0.0005 is far below one pixel on
  // any real frame, so it only swallows float noise.
  if (Math.abs(source - target) < 0.0005) {
    return { mode: 'none', bar: 0, barPct: 0, visibleW: w, visibleH: h, actual: source };
  }
  if (target > source) {
    const bar = Math.round((h - w / target) / 2);
    const visibleH = h - 2 * bar;
    return { mode: 'letterbox', bar, barPct: (bar / h) * 100, visibleW: w, visibleH, actual: w / visibleH };
  }
  const bar = Math.round((w - h * target) / 2);
  const visibleW = w - 2 * bar;
  return { mode: 'pillarbox', bar, barPct: (bar / w) * 100, visibleW, visibleH: h, actual: visibleW / h };
}
