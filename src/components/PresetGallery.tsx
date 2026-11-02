import { useState } from 'react';
import { blurbFor, essentialsPresets, genrePresets, type Preset } from '../data/presets';
import type { Lang } from '../i18n';

const tabDefs: { key: 'essentials' | 'genre'; presets: Preset[] }[] = [
  { key: 'essentials', presets: essentialsPresets },
  { key: 'genre', presets: genrePresets },
];

const copy = {
  en: { groups: 'Preset groups', essentials: 'Essentials', genre: 'By genre', alt: (n: string) => `${n} preset applied` },
  es: { groups: 'Grupos de presets', essentials: 'Esenciales', genre: 'Por género', alt: (n: string) => `Imagen con el preset ${n} aplicado` },
};

// Same frame (shot 07) graded with each preset, from /public/library.
const LOOK_FILE: Record<string, string> = {
  'Cinema 35': 'cinema35',
  'Cinema 65': 'cinema65',
  'Editorial 4:3': 'editorial_pro',
  'Urban Editorial': 'urban_pro',
  'Dusty Western': 'dustywestern',
  'Romance / Reverie': 'romance',
  'Homegrown VHS': 'homegrownvhs',
  'Classic Horror': 'classichorror',
  'Worn-Out VHS': 'wornoutvhs',
  'Terror Found Footage': 'terrorfoundfootage',
};

export default function PresetGallery({ lang = 'en' }: { lang?: Lang }) {
  const c = copy[lang];
  const tabs = tabDefs.map((t) => ({ ...t, label: c[t.key] }));
  const [active, setActive] = useState<'essentials' | 'genre'>('essentials');
  const current = tabs.find((t) => t.key === active)!;

  return (
    <div className="preset-gallery">
      <div className="tabs" role="tablist" aria-label={c.groups}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={active === tab.key}
            className={active === tab.key ? 'tab active' : 'tab'}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid" role="tabpanel">
        {current.presets.map((preset) => (
          <div className="card" key={preset.name}>
            <div className="thumb">
              {LOOK_FILE[preset.name] ? (
                <img src={`/library/m07_${LOOK_FILE[preset.name]}.webp`} alt={c.alt(preset.name)} loading="lazy" />
              ) : (
                <svg aria-hidden="true">
                  <filter id={`grain-${preset.name.replace(/\s+/g, '-')}`}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"></feTurbulence>
                    <feColorMatrix type="saturate" values="0"></feColorMatrix>
                  </filter>
                  <rect width="100%" height="100%" filter={`url(#grain-${preset.name.replace(/\s+/g, '-')})`}></rect>
                </svg>
              )}
              <span className="format">{preset.format}</span>
            </div>
            <p className="name">{preset.name}</p>
            <p className="blurb">{blurbFor(preset, lang)}</p>
          </div>
        ))}
      </div>

      <style>{`
        .preset-gallery { display: flex; flex-direction: column; gap: 1.5rem; }
        .tabs { display: flex; gap: 0.5rem; }
        .tab {
          font-family: var(--font-body, inherit);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          background: transparent;
          color: var(--color-fg-muted, #a8a49c);
          border: 1px solid var(--color-border, #2a2a2a);
          cursor: pointer;
        }
        .tab.active {
          color: var(--color-bg, #0a0a0a);
          background: var(--color-fg, #f5f3ef);
          border-color: var(--color-fg, #f5f3ef);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
          gap: 1rem;
        }
        .card { display: flex; flex-direction: column; gap: 0.5rem; }
        .thumb {
          position: relative;
          /* 16/9, not the preset's own crop format: these are full exported
             stills, and GATE.24's crop bars are baked into that 16:9 frame --
             cropping the thumbnail to the preset's format would cut the bars
             off instead of showing them. */
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid var(--color-border, #2a2a2a);
          background: radial-gradient(120% 120% at 30% 20%, #232323 0%, #0a0a0a 70%);
        }
        .thumb svg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.16; mix-blend-mode: overlay; }
        .thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        .format {
          position: absolute;
          bottom: 0.5rem;
          left: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          background: rgba(10, 10, 10, 0.7);
          padding: 0.25rem 0.4rem;
          border: 1px solid rgba(245, 243, 239, 0.2);
        }
        .name { margin: 0; font-weight: 600; font-size: 0.9rem; color: var(--color-fg, #f5f3ef); }
        .blurb { margin: 0; font-size: 0.875rem; color: var(--color-fg-muted, #a8a49c); max-width: none; }
      `}</style>
    </div>
  );
}
