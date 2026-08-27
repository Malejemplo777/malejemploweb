import { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { flagshipPresets } from '../data/presets';

const ZOOM_LEVEL = 2.4;

export default function PresetShowcase() {
  const [active, setActive] = useState(flagshipPresets[0]?.name);
  const [zoomed, setZoomed] = useState(false);
  const preset = flagshipPresets.find((p) => p.name === active) ?? flagshipPresets[0];

  if (!preset) return null;

  return (
    <div className="preset-showcase">
      <div className="chips" role="tablist" aria-label="Choose a preset to preview">
        {flagshipPresets.map((p) => (
          <button
            key={p.name}
            type="button"
            role="tab"
            aria-selected={p.name === preset.name}
            className={p.name === preset.name ? 'chip active' : 'chip'}
            onClick={() => setActive(p.name)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <BeforeAfterSlider
        key={preset.name}
        beforeSrc={preset.sampleBefore}
        afterSrc={preset.sampleAfter}
        afterLabel={preset.name}
        afterTint={preset.tint}
        zoom={zoomed ? ZOOM_LEVEL : 1}
      />

      <div className="toolbar">
        <p className="caption">{preset.blurb}</p>
        <button type="button" className="zoom-toggle" aria-pressed={zoomed} onClick={() => setZoomed((z) => !z)}>
          {zoomed ? '– Zoom out' : '+ Zoom in on the grain'}
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
          background: var(--color-fg, #f5f3ef);
          border-color: var(--color-fg, #f5f3ef);
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
          background: var(--color-fg, #f5f3ef);
          border-color: var(--color-fg, #f5f3ef);
        }
      `}</style>
    </div>
  );
}
