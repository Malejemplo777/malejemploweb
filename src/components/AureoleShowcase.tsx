import { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { aureoleShowcase } from '../data/aureole-showcase';

const ZOOM_LEVEL = 2.4;

export default function AureoleShowcase() {
  const [active, setActive] = useState(aureoleShowcase[0]?.name);
  const [zoomed, setZoomed] = useState(true);
  const shot = aureoleShowcase.find((s) => s.name === active) ?? aureoleShowcase[0];

  if (!shot) return null;

  return (
    <div className="preset-showcase">
      <div className="chips" role="tablist" aria-label="Choose a shot to preview">
        {aureoleShowcase.map((s) => (
          <button
            key={s.name}
            type="button"
            role="tab"
            aria-selected={s.name === shot.name}
            className={s.name === shot.name ? 'chip active' : 'chip'}
            onClick={() => setActive(s.name)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <BeforeAfterSlider
        key={shot.name}
        beforeSrc={shot.offSrc}
        afterSrc={shot.onSrc}
        beforeLabel="Off"
        afterLabel="On"
        zoom={zoomed ? ZOOM_LEVEL : 1}
        zoomOrigin={shot.zoomOrigin}
      />

      <div className="toolbar">
        <p className="caption">{shot.blurb}</p>
        <button type="button" className="zoom-toggle" aria-pressed={zoomed} onClick={() => setZoomed((z) => !z)}>
          {zoomed ? '– Zoom out' : '+ Zoom in on the detail'}
        </button>
      </div>

      <style>{`
        .preset-showcase { display: flex; flex-direction: column; gap: 1rem; }
        .chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .chip {
          font-family: var(--font-body, inherit);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.5rem 0.9rem;
          background: transparent;
          color: var(--color-fg-muted, #a8a49c);
          border: 1px solid var(--color-border, #2a2a2a);
          cursor: pointer;
        }
        .chip.active {
          color: var(--color-bg, #0a0a0a);
          background: var(--color-accent, #ff6a3d);
          border-color: var(--color-accent, #ff6a3d);
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .caption {
          margin: 0;
          font-size: 0.85rem;
          color: var(--color-fg-muted, #a8a49c);
          max-width: none;
        }
        .zoom-toggle {
          flex-shrink: 0;
          font-family: var(--font-body, inherit);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          background: transparent;
          color: var(--color-fg-muted, #a8a49c);
          border: 1px solid var(--color-border, #2a2a2a);
          cursor: pointer;
        }
        .zoom-toggle[aria-pressed='true'] {
          color: var(--color-bg, #0a0a0a);
          background: var(--color-accent, #ff6a3d);
          border-color: var(--color-accent, #ff6a3d);
        }
      `}</style>
    </div>
  );
}
