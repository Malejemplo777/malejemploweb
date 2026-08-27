import { useMemo, useState } from 'react';
import { presets, essentialsPresets, genrePresets, type Preset, type GrainStock } from '../data/presets';

// CSS-only approximation of GATE.24's real OpenCL pipeline, driven by the
// plugin's real per-preset recipe values (see data/presets.ts). This is NOT
// the real color engine -- it can't be, that's C++/OpenCL pixel math, not
// something portable to a browser. It's an honest, data-driven approximation
// so visitors can get a feel for all 13 presets on a photo of their choice.

const rawPhotos: { key: string; label: string; src: string }[] = [
  { key: 'cine-35', label: 'City street', src: '/showcase/cine-35-before.jpg' },
  { key: 'western', label: 'Desert road', src: '/showcase/western-before.jpg' },
  { key: 'romance', label: 'Golden hour', src: '/showcase/romance-before.jpg' },
  { key: 'vhs', label: 'Living room', src: '/showcase/vhs-before.jpg' },
  { key: 'terror', label: 'Dark hallway', src: '/showcase/terror-before.jpg' },
];

const FRAME_RATIO = 16 / 9;

function parseRatio(format: string): number {
  const [w, h] = format.split(':').map(Number);
  return w / h;
}

function cropOrientation(format: string): 'letterbox' | 'pillarbox' | 'none' {
  const ratio = parseRatio(format);
  if (Math.abs(ratio - FRAME_RATIO) < 0.01) return 'none';
  return ratio > FRAME_RATIO ? 'letterbox' : 'pillarbox';
}

const vignetteShape: Record<Preset['recipe']['vignetteCharacter'], string> = {
  anamorphic: 'ellipse 75% 48%',
  spherical: 'ellipse 60% 60%',
  tele: 'ellipse 92% 92%',
};

const grainFrequency: Record<GrainStock, number> = {
  '8mm': 0.35,
  '16mm': 0.55,
  '35mm': 0.8,
  '65mm': 1.15,
};

function vignetteStyle(recipe: Preset['recipe']): React.CSSProperties {
  const { vignetteCharacter, vignetteIntensity, vignetteRolloff } = recipe;
  const shape = vignetteShape[vignetteCharacter];
  const innerPct = Math.max(15, 60 - vignetteRolloff * 45);
  const isLeak = vignetteIntensity < 0;
  const strength = Math.min(0.85, Math.abs(vignetteIntensity) * (isLeak ? 1.1 : 1.4));
  const color = isLeak ? `rgba(255, 225, 180, ${strength})` : `rgba(0, 0, 0, ${strength})`;
  return {
    background: `radial-gradient(${shape} at center, transparent ${innerPct}%, ${color} 100%)`,
    mixBlendMode: isLeak ? 'screen' : 'normal',
  };
}

function grainStyle(recipe: Preset['recipe']): { opacity: number; baseFrequency: number } {
  return {
    opacity: Math.min(0.42, 0.03 + recipe.grainIntensity * 0.55),
    baseFrequency: grainFrequency[recipe.grainStock],
  };
}

function contrastFilter(recipe: Preset['recipe']): string {
  return `contrast(${1 + recipe.contrast * 0.6}) brightness(${1 - recipe.shadowLift * 0.25})`;
}

const protectionLabel: Record<Preset['recipe']['protection'], string> = {
  none: 'No protection',
  midtones: 'Midtone protection',
  skin: 'Skin-tone protection',
  both: 'Skin + midtone protection',
};

export default function LivePresetPlayground() {
  const [photoKey, setPhotoKey] = useState(rawPhotos[2].key); // golden hour has faces -- best default
  const [presetName, setPresetName] = useState(presets[0].name);
  const [group, setGroup] = useState<'essentials' | 'genre'>('essentials');

  const photo = rawPhotos.find((p) => p.key === photoKey) ?? rawPhotos[0];
  const preset = presets.find((p) => p.name === presetName) ?? presets[0];
  const orientation = useMemo(() => cropOrientation(preset.format), [preset.format]);
  const ratio = useMemo(() => parseRatio(preset.format), [preset.format]);
  const grain = useMemo(() => grainStyle(preset.recipe), [preset.recipe]);
  const grainId = `playground-grain-${preset.name.replace(/[^a-z0-9]+/gi, '-')}`;

  const groupPresets = group === 'essentials' ? essentialsPresets : genrePresets;

  return (
    <div className="playground">
      <div className="controls">
        <div className="control-block">
          <p className="label">Photo</p>
          <div className="chips">
            {rawPhotos.map((p) => (
              <button
                key={p.key}
                type="button"
                className={p.key === photoKey ? 'chip active' : 'chip'}
                onClick={() => setPhotoKey(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-block">
          <p className="label">Preset group</p>
          <div className="chips">
            <button type="button" className={group === 'essentials' ? 'chip active' : 'chip'} onClick={() => setGroup('essentials')}>
              Essentials
            </button>
            <button type="button" className={group === 'genre' ? 'chip active' : 'chip'} onClick={() => setGroup('genre')}>
              By genre
            </button>
          </div>
          <div className="chips wrap">
            {groupPresets.map((p) => (
              <button
                key={p.name}
                type="button"
                className={p.name === presetName ? 'chip small active' : 'chip small'}
                onClick={() => setPresetName(p.name)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stage" style={{ aspectRatio: '16 / 9' }}>
        <img src={photo.src} alt={photo.label} className="base-photo" style={{ filter: contrastFilter(preset.recipe) }} />

        <svg className="grain-layer" style={{ opacity: grain.opacity }} aria-hidden="true">
          <filter id={grainId}>
            <feTurbulence type="fractalNoise" baseFrequency={grain.baseFrequency} numOctaves={2} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${grainId})`} />
        </svg>

        <div className="vignette-layer" style={vignetteStyle(preset.recipe)} />

        {orientation !== 'none' && (
          <div
            className="crop-window"
            style={
              orientation === 'letterbox'
                ? { aspectRatio: String(ratio), width: '100%', height: 'auto' }
                : { aspectRatio: String(ratio), height: '100%', width: 'auto' }
            }
          />
        )}

        <span className="tag tag-preset">{preset.name}</span>
        <span className="tag tag-format">{preset.format}</span>
      </div>

      <p className="caption">
        {protectionLabel[preset.recipe.protection]} &middot; {preset.recipe.grainStock} grain &middot; approximation only --
        not GATE.24's real color engine, see note below.
      </p>

      <style>{`
        .playground { display: flex; flex-direction: column; gap: 1.25rem; }
        .controls { display: flex; flex-direction: column; gap: 1rem; }
        .control-block { display: flex; flex-direction: column; gap: 0.5rem; }
        .label {
          font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--color-fg-muted, #a8a49c); margin: 0;
        }
        .chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .chips.wrap { margin-top: 0.35rem; }
        .chip {
          font-family: var(--font-body, inherit); font-size: 0.82rem; font-weight: 600;
          padding: 0.5rem 0.9rem; background: transparent; color: var(--color-fg-muted, #a8a49c);
          border: 1px solid var(--color-border, #2a2a2a); cursor: pointer;
        }
        .chip.small { font-size: 0.75rem; padding: 0.4rem 0.7rem; }
        .chip.active {
          color: var(--color-bg, #0a0a0a); background: var(--color-fg, #f5f3ef); border-color: var(--color-fg, #f5f3ef);
        }
        .stage {
          position: relative; width: 100%; overflow: hidden; background: #000;
          border: 1px solid var(--color-border, #2a2a2a);
        }
        .base-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .grain-layer { position: absolute; inset: 0; width: 100%; height: 100%; mix-blend-mode: overlay; pointer-events: none; }
        .vignette-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .crop-window {
          position: absolute; inset: 0; margin: auto; max-width: 100%; max-height: 100%;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 1); pointer-events: none;
        }
        .tag {
          position: absolute; z-index: 2; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; background: rgba(10, 10, 10, 0.75); color: #f5f3ef;
          padding: 0.35rem 0.6rem; border: 1px solid rgba(245, 243, 239, 0.2);
        }
        .tag-preset { bottom: 0.75rem; left: 0.75rem; }
        .tag-format { bottom: 0.75rem; right: 0.75rem; }
        .caption { margin: 0; font-size: 0.78rem; color: var(--color-fg-muted, #a8a49c); max-width: none; }
      `}</style>
    </div>
  );
}
