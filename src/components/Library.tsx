import { useEffect, useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import type { Lang } from '../i18n';

// The 8 master shots from the GATE.24 shoot, each graded with every look.
// Files live in /public/library (converted from D:\GATE24_CONTENIDO\03_fotogramas).
const SHOTS = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08'] as const;

interface Look {
  id: string;
  name: string;
  tier: 'lite' | 'full';
}

// Lite = free version (5 presets, no movement); full = GATE.24. Names stay English in every language:
// they are what the plugin's panel shows.
const LOOKS: Look[] = [
  { id: 'cinema35', name: 'Cinema 35', tier: 'lite' },
  { id: 'cinema65', name: 'Cinema 65', tier: 'lite' },
  { id: 'editorial_lite', name: 'Editorial 4:3', tier: 'lite' },
  { id: 'urban_lite', name: 'Urban Editorial', tier: 'lite' },
  { id: 'romance', name: 'Romance / Reverie', tier: 'lite' },
  { id: 'editorial_pro', name: 'Editorial 4:3', tier: 'full' },
  { id: 'urban_pro', name: 'Urban Editorial', tier: 'full' },
  { id: 'dustywestern', name: 'Dusty Western', tier: 'full' },
  { id: 'homegrownvhs', name: 'Homegrown VHS', tier: 'full' },
  { id: 'classichorror', name: 'Classic Horror', tier: 'full' },
  { id: 'wornoutvhs', name: 'Worn-Out VHS', tier: 'full' },
  { id: 'terrorfoundfootage', name: 'Terror Found Footage', tier: 'full' },
];

const copy = {
  en: {
    shots: 'Choose a shot',
    shot: 'Shot',
    looks: 'Choose a look',
    lite: 'Lite · free',
    full: 'GATE.24',
    zoomIn: '+ Zoom in on the grain',
    zoomOut: '– Zoom out',
    hint: 'Drag to compare. Every frame is a real shot, graded with the plugin.',
  },
  es: {
    shots: 'Elige un plano',
    shot: 'Plano',
    looks: 'Elige un look',
    lite: 'Lite · gratis',
    full: 'GATE.24',
    zoomIn: '+ Acercar para ver el grano',
    zoomOut: '– Alejar',
    hint: 'Arrastra para comparar. Cada fotograma es un plano real, etalonado con el plugin.',
  },
};

const src = (shot: string, look: string) => `/library/${shot}_${look}.webp`;

export default function Library({ lang = 'en' }: { lang?: Lang }) {
  const c = copy[lang];
  const [shot, setShot] = useState<(typeof SHOTS)[number]>('m07');
  const [lookId, setLookId] = useState('cinema35');
  const [zoomed, setZoomed] = useState(false);
  const look = LOOKS.find((l) => l.id === lookId) ?? LOOKS[0];

  // Warm the cache for the rest of this shot's looks once the page is idle,
  // so switching looks is instant.
  useEffect(() => {
    const warm = () => LOOKS.forEach((l) => (new Image().src = src(shot, l.id)));
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(warm);
    else setTimeout(warm, 600);
  }, [shot]);

  const group = (tier: 'lite' | 'full') => (
    <div className="lib-group" key={tier}>
      <span className="lib-tier">{tier === 'lite' ? c.lite : c.full}</span>
      <div className="lib-chips">
        {LOOKS.filter((l) => l.tier === tier).map((l) => (
          <button
            key={l.id}
            type="button"
            className={l.id === look.id ? 'lib-chip on' : 'lib-chip'}
            aria-pressed={l.id === look.id}
            onClick={() => setLookId(l.id)}
          >
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="lib">
      <div className="lib-shots" role="group" aria-label={c.shots}>
        {SHOTS.map((s, i) => (
          <button
            key={s}
            type="button"
            className={s === shot ? 'lib-shot on' : 'lib-shot'}
            aria-pressed={s === shot}
            aria-label={`${c.shot} ${i + 1}`}
            onClick={() => setShot(s)}
          >
            <img src={`/library/${s}_thumb.webp`} alt="" width={180} height={95} loading="lazy" draggable={false} />
          </button>
        ))}
      </div>

      <BeforeAfterSlider
        beforeSrc={src(shot, 'original')}
        afterSrc={src(shot, look.id)}
        afterLabel={look.name}
        lang={lang}
        zoom={zoomed ? 2.4 : 1}
      />

      <div className="lib-bar">
        <p className="lib-hint">{c.hint}</p>
        <button type="button" className="lib-zoom" aria-pressed={zoomed} onClick={() => setZoomed((z) => !z)}>
          {zoomed ? c.zoomOut : c.zoomIn}
        </button>
      </div>

      <div className="lib-looks" role="group" aria-label={c.looks}>
        {group('lite')}
        {group('full')}
      </div>

      <style>{`
        .lib { display: flex; flex-direction: column; gap: 1rem; }
        .lib-shots { display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.5rem; }
        .lib-shot {
          padding: 0; border: 1px solid var(--color-border, #2a2a2a); background: #000;
          cursor: pointer; opacity: 0.55; transition: opacity 0.2s ease, border-color 0.2s ease;
          aspect-ratio: 16 / 9; overflow: hidden; touch-action: manipulation;
        }
        .lib-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lib-shot:hover { opacity: 0.85; }
        .lib-shot.on { opacity: 1; border-color: var(--color-fg, #f5f5f3); }
        .lib-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .lib-hint { margin: 0; font-size: 0.9rem; color: var(--color-fg-muted, #a8a49c); max-width: none; }
        .lib-zoom {
          flex-shrink: 0; font-family: var(--font-body, inherit); font-size: 0.8125rem; font-weight: 600;
          padding: 0.5rem 0.9rem; min-height: 2.5rem; background: transparent;
          color: var(--color-fg-muted, #a8a49c); border: 1px solid var(--color-border, #2a2a2a); cursor: pointer;
        }
        .lib-zoom[aria-pressed='true'] { color: var(--color-bg, #0a0a0a); background: var(--color-fg, #f5f5f3); border-color: var(--color-fg, #f5f5f3); }
        .lib-looks { display: flex; flex-direction: column; gap: 0.9rem; }
        .lib-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .lib-tier { font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-fg-muted, #a8a49c); }
        .lib-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .lib-chip {
          font-family: var(--font-body, inherit); font-size: 0.875rem; font-weight: 600;
          padding: 0.55rem 0.95rem; min-height: 2.5rem; background: transparent;
          color: var(--color-fg-muted, #a8a49c); border: 1px solid var(--color-border, #2a2a2a);
          cursor: pointer; touch-action: manipulation; transition: color 0.2s ease, border-color 0.2s ease;
        }
        .lib-chip:hover { color: var(--color-fg, #f5f5f3); border-color: var(--color-fg-muted, #a8a49c); }
        .lib-chip.on { color: var(--color-bg, #0a0a0a); background: var(--color-fg, #f5f5f3); border-color: var(--color-fg, #f5f5f3); }
        @media (max-width: 640px) {
          .lib-shots { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
}
