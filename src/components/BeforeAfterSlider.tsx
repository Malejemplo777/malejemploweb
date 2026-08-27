import { useCallback, useRef, useState } from 'react';

interface Props {
  beforeSrc?: string;
  afterSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Two CSS colors for the "after" placeholder gradient, themed per preset. */
  afterTint?: [string, string];
  /** 1 = normal, >1 = zoomed in on the center (e.g. to inspect film grain). */
  zoom?: number;
}

// Interactive before/after comparison, driven by pointer events on the track
// (not a native range input -- that approach looked clean at first but broke
// the browser's own click-to-value math when styled, and visible native
// track/thumb/accent-color artifacts proved impossible to fully suppress
// across browsers; reverted 2026-08-26, see GATE24_Web_Brief_v2.md).
// This version is the confirmed-good desktop experience. Mobile Safari drag
// is still unreliable despite the -webkit-user-drag/touch-callout fixes
// below -- flagged as a known open issue, not solved by this revert.
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'With GATE.24',
  afterTint,
  zoom = 1,
}: Props) {
  const [position, setPosition] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
    e.preventDefault();
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 2));
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
  };

  return (
    <div
      className="ba-track"
      ref={trackRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="ba-pane ba-after">
        {afterSrc ? (
          <img src={afterSrc} alt={afterLabel} draggable={false} style={{ transform: `scale(${zoom})` }} />
        ) : (
          <div
            className="ba-fallback ba-fallback-after"
            style={
              afterTint
                ? { background: `radial-gradient(120% 120% at 30% 20%, ${afterTint[0]} 0%, ${afterTint[1]} 70%)` }
                : undefined
            }
          />
        )}
        <span className="ba-tag ba-tag-right">{afterLabel}</span>
      </div>

      <div className="ba-pane ba-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {beforeSrc ? (
          <img src={beforeSrc} alt={beforeLabel} draggable={false} style={{ transform: `scale(${zoom})` }} />
        ) : (
          <div className="ba-fallback ba-fallback-before" />
        )}
        <span className="ba-tag ba-tag-left">{beforeLabel}</span>
      </div>

      <div
        className="ba-handle"
        style={{ left: `${position}%` }}
        role="slider"
        tabIndex={0}
        aria-label="Comparison position"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={onKeyDown}
      >
        <span className="ba-grip">⇔</span>
      </div>

      <style>{`
        .ba-track {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid var(--color-border, #2a2a2a);
          cursor: ew-resize;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        .ba-pane {
          position: absolute;
          inset: 0;
        }
        .ba-pane img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform-origin: center;
          transition: transform 0.25s ease;
          -webkit-user-drag: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
          pointer-events: none;
        }
        .ba-fallback {
          width: 100%;
          height: 100%;
        }
        .ba-fallback-after {
          background: radial-gradient(120% 120% at 30% 20%, #2a2a2a 0%, #0a0a0a 70%);
        }
        .ba-fallback-before {
          background: radial-gradient(120% 120% at 30% 20%, #1a1a1a 0%, #050505 70%);
          filter: grayscale(0.4) brightness(0.8);
        }
        .ba-tag {
          position: absolute;
          bottom: 0.75rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(10, 10, 10, 0.7);
          color: #f5f3ef;
          padding: 0.35rem 0.6rem;
          border: 1px solid rgba(245, 243, 239, 0.2);
        }
        .ba-tag-left { left: 0.75rem; }
        .ba-tag-right { right: 0.75rem; }
        .ba-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #f5f3ef;
          transform: translateX(-1px);
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: none;
          pointer-events: none;
        }
        .ba-grip {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: #f5f3ef;
          color: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .ba-handle:focus-visible {
          outline: 2px solid #f5f3ef;
          outline-offset: 4px;
        }
      `}</style>
    </div>
  );
}
