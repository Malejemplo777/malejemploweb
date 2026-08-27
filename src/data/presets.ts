export type PresetGroup = 'essentials' | 'genre';
export type VignetteCharacter = 'anamorphic' | 'spherical' | 'tele';
export type GrainStock = '8mm' | '16mm' | '35mm' | '65mm';
export type ProtectionMode = 'none' | 'midtones' | 'skin' | 'both';

export interface PresetRecipe {
  vignetteCharacter: VignetteCharacter;
  /** Signed: positive darkens the edge, negative is a "light leak". */
  vignetteIntensity: number;
  /** 0-1, higher = softer/wider falloff. */
  vignetteRolloff: number;
  grainStock: GrainStock;
  grainIntensity: number;
  contrast: number;
  shadowLift: number;
  protection: ProtectionMode;
}

export interface Preset {
  name: string;
  group: PresetGroup;
  format: string;
  blurb: string;
  /** Real recipe values, straight from Gate24Plugin.cpp / 07_ESTADO_ACTUAL_v0.9.md --
   * drives both the CSS approximation in the live playground and, loosely, the blurb copy. */
  recipe: PresetRecipe;
  /** True for the small set featured in the interactive before/after showcase slider. */
  flagship?: boolean;
  /** Free-stock search terms to help source a matching photo (Pexels/Pixabay/Mixkit). */
  stockHint?: string;
  /** CSS gradient colors used for the themed placeholder until a real photo exists. */
  tint?: [string, string];
  /** Real graded stills, added once sourced (GATE24_Web_Brief_v2.md section 12). */
  sampleBefore?: string;
  sampleAfter?: string;
}

// Source of truth: CLaude/Products/Gate.24/GATE24/src/Gate24Plugin.cpp.
// Panel translated to English 2026-08-25 (was Spanish-only before that --
// see GATE24_Web_Brief_v2.md section 1 for the history). Names below are the
// current English labels; sample image filenames still use the original
// Spanish-derived slugs (western/romance/vhs/terror/etc.) -- cosmetic only,
// not worth renaming files over.
export const presets: Preset[] = [
  {
    name: 'Cinema 35', group: 'essentials', format: '2.39:1', blurb: 'Anamorphic widescreen, 35mm grain.',
    flagship: true, stockHint: 'cinematic wide shot, city or landscape', tint: ['#3a3a3a', '#0a0a0a'],
    sampleBefore: '/showcase/cine-35-before.jpg', sampleAfter: '/showcase/cine-35-after.jpg',
    recipe: { vignetteCharacter: 'anamorphic', vignetteIntensity: 0.20, vignetteRolloff: 0.62, grainStock: '35mm', grainIntensity: 0.126, contrast: 0.24, shadowLift: 0.035, protection: 'both' },
  },
  {
    name: 'Cinema 65', group: 'essentials', format: '2.20:1', blurb: 'Large-format restraint, 65mm grain.',
    sampleAfter: '/showcase/cine-65-after.jpg',
    recipe: { vignetteCharacter: 'tele', vignetteIntensity: 0.05, vignetteRolloff: 0.85, grainStock: '65mm', grainIntensity: 0.019, contrast: 0.08, shadowLift: 0.010, protection: 'both' },
  },
  {
    name: 'Editorial 4:3', group: 'essentials', format: '4:3', blurb: 'Boxy, printed-page contrast.',
    sampleAfter: '/showcase/editorial-4-3-after.jpg',
    recipe: { vignetteCharacter: 'tele', vignetteIntensity: 0.08, vignetteRolloff: 0.80, grainStock: '16mm', grainIntensity: 0.144, contrast: 0.20, shadowLift: 0.045, protection: 'both' },
  },
  {
    name: 'Urban Editorial', group: 'essentials', format: '1:1', blurb: 'Square crop, punchy skin-safe contrast.',
    sampleAfter: '/showcase/editorial-urbano-after.jpg',
    recipe: { vignetteCharacter: 'anamorphic', vignetteIntensity: 0.22, vignetteRolloff: 0.45, grainStock: '16mm', grainIntensity: 0.324, contrast: 0.360, shadowLift: 0.030, protection: 'skin' },
  },
  {
    name: 'Social 9:16', group: 'essentials', format: '9:16', blurb: 'Vertical delivery, light touch.',
    sampleAfter: '/showcase/social-9-16-after.jpg',
    recipe: { vignetteCharacter: 'spherical', vignetteIntensity: 0.16, vignetteRolloff: 0.60, grainStock: '35mm', grainIntensity: 0.108, contrast: 0.16, shadowLift: 0.030, protection: 'both' },
  },
  {
    name: 'Social 1:1', group: 'essentials', format: '1:1', blurb: 'Square delivery, light touch.',
    sampleAfter: '/showcase/social-1-1-after.jpg',
    recipe: { vignetteCharacter: 'spherical', vignetteIntensity: 0.12, vignetteRolloff: 0.60, grainStock: '35mm', grainIntensity: 0.09, contrast: 0.16, shadowLift: 0.030, protection: 'both' },
  },
  {
    name: 'Social 4:5', group: 'essentials', format: '4:5', blurb: 'Portrait delivery, light touch.',
    sampleAfter: '/showcase/social-4-5-after.jpg',
    recipe: { vignetteCharacter: 'spherical', vignetteIntensity: 0.12, vignetteRolloff: 0.60, grainStock: '35mm', grainIntensity: 0.09, contrast: 0.16, shadowLift: 0.030, protection: 'both' },
  },
  {
    name: 'Dusty Western', group: 'genre', format: '2.39:1', blurb: 'Dusty, heavy grain, hard vignette.',
    flagship: true, stockHint: 'desert road, dusty rural landscape, cowboy/rural scene', tint: ['#5a4326', '#1a1206'],
    sampleBefore: '/showcase/western-before.jpg', sampleAfter: '/showcase/western-after.jpg',
    recipe: { vignetteCharacter: 'anamorphic', vignetteIntensity: 0.30, vignetteRolloff: 0.45, grainStock: '16mm', grainIntensity: 0.36, contrast: 0.34, shadowLift: 0.040, protection: 'both' },
  },
  {
    name: 'Romance / Reverie', group: 'genre', format: '2:1', blurb: 'Light-leak glow, soft roll-off.',
    flagship: true, stockHint: 'golden hour couple, flowers, soft dreamy backlight', tint: ['#5a3a3a', '#1a0e12'],
    sampleBefore: '/showcase/romance-before.jpg', sampleAfter: '/showcase/romance-after.jpg',
    recipe: { vignetteCharacter: 'tele', vignetteIntensity: -0.32, vignetteRolloff: 0.75, grainStock: '35mm', grainIntensity: 0.144, contrast: 0.14, shadowLift: 0.055, protection: 'both' },
  },
  {
    name: 'Homegrown VHS', group: 'genre', format: '4:3', blurb: 'Warm, soft, home-video glow.',
    flagship: true, stockHint: 'family living room, kids playing, home video style', tint: ['#4a4222', '#141206'],
    sampleBefore: '/showcase/vhs-before.jpg', sampleAfter: '/showcase/vhs-after.jpg',
    recipe: { vignetteCharacter: 'spherical', vignetteIntensity: -0.080, vignetteRolloff: 0.900, grainStock: '8mm', grainIntensity: 0.198, contrast: 0.14, shadowLift: 0.040, protection: 'both' },
  },
  {
    name: 'Classic Horror', group: 'genre', format: '2.39:1', blurb: 'Crushed shadows, heavy vignette.',
    flagship: true, stockHint: 'dark hallway, abandoned building, forest at night', tint: ['#241a1a', '#050505'],
    sampleBefore: '/showcase/terror-before.jpg', sampleAfter: '/showcase/terror-after.jpg',
    recipe: { vignetteCharacter: 'anamorphic', vignetteIntensity: 0.50, vignetteRolloff: 0.38, grainStock: '35mm', grainIntensity: 0.252, contrast: 0.48, shadowLift: 0.005, protection: 'both' },
  },
  {
    name: 'Worn-Out VHS', group: 'genre', format: '4:3', blurb: 'Degraded tape, blown highlights.',
    sampleAfter: '/showcase/vhs-deteriorado-after.jpg',
    recipe: { vignetteCharacter: 'spherical', vignetteIntensity: -0.333, vignetteRolloff: 0.5, grainStock: '8mm', grainIntensity: 0.675, contrast: 0.20, shadowLift: 0.140, protection: 'midtones' },
  },
  {
    name: 'Terror Found Footage', group: 'genre', format: '4:3', blurb: 'Raw, grainy, unstable.',
    sampleAfter: '/showcase/terror-found-footage-after.jpg',
    recipe: { vignetteCharacter: 'spherical', vignetteIntensity: 0.40, vignetteRolloff: 0.28, grainStock: '16mm', grainIntensity: 0.495, contrast: 0.30, shadowLift: 0.015, protection: 'midtones' },
  },
];

export const essentialsPresets = presets.filter((p) => p.group === 'essentials');
export const genrePresets = presets.filter((p) => p.group === 'genre');

// Featured in the interactive showcase slider on /gate24 -- a deliberately
// small, thematically distinct subset, not all 13 (see GATE24_Web_Brief_v2.md
// section 5/12 for why: production cost of sourcing+grading real stills for
// all 13 isn't worth it, a handful of contrasting moods tells the story).
export const flagshipPresets = presets.filter((p) => p.flagship);
