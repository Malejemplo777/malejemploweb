import { useRef, useState } from 'react';
import type { SizeDemo } from '../data/aureole-sizes';

const ZOOM_LEVEL = 2.4;

function SizeTrack({ demo }: { demo: SizeDemo }) {
  const [active, setActive] = useState(demo.sizes[0]?.label);
  const [zoomed, setZoomed] = useState(true);
  // Single <video>, but switching a live-playing video's src always risks a
  // black gap while the new source loads. So: freeze the current frame onto
  // a <canvas> covering the video first, swap src underneath, and only pull
  // the canvas away once the new frame is confirmed decoded -- worst case is
  // a still frame holding for a beat, never black.
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const switching = useRef(false);
  const size = demo.sizes.find((s) => s.label === active) ?? demo.sizes[0];

  if (!size) return null;

  const handleSelect = (label: string) => {
    if (switching.current || label === active) return;
    const nextSize = demo.sizes.find((s) => s.label === label);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!nextSize || !video || !canvas) return;

    switching.current = true;

    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.style.opacity = '1';
    }

    const resumeAt = video.currentTime;
    let settled = false;

    const reveal = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      video.removeEventListener('seeked', onSeeked);
      canvas.style.opacity = '0';
      switching.current = false;
    };

    // Two rAFs: one for the seek to actually composite, one more as a
    // buffer -- cheap insurance against revealing a half-painted frame.
    const onSeeked = () => requestAnimationFrame(() => requestAnimationFrame(reveal));
    video.addEventListener('seeked', onSeeked);
    const safety = setTimeout(reveal, 1200);

    const onLoaded = () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.currentTime = resumeAt;
      video.play();
    };
    video.addEventListener('loadedmetadata', onLoaded);
    video.src = nextSize.src;
    video.load();
    setActive(label);
  };

  const videoStyle = {
    transform: `scale(${zoomed ? ZOOM_LEVEL : 1})`,
    transformOrigin: demo.zoomOrigin ?? 'center',
  };

  return (
    <div className="size-track">
      <div className="size-head">
        <h3>{demo.title}</h3>
        <span className="size-sub">{demo.paramLabel}</span>
      </div>
      <div className="chips" role="tablist" aria-label={`Choose a ${demo.title} value`}>
        {demo.sizes.map((s) => (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={s.label === size.label}
            className={s.label === size.label ? 'chip active' : 'chip'}
            onClick={() => handleSelect(s.label)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="video-frame">
        <video ref={videoRef} src={demo.sizes[0]?.src} autoPlay loop muted playsInline style={videoStyle} />
        <canvas ref={canvasRef} style={videoStyle} />
      </div>

      <div className="toolbar">
        <p className="caption">{demo.blurb}</p>
        <button type="button" className="zoom-toggle" aria-pressed={zoomed} onClick={() => setZoomed((z) => !z)}>
          {zoomed ? '– Zoom out' : '+ Zoom in on the detail'}
        </button>
      </div>

      <style>{`
        .size-track { display: flex; flex-direction: column; gap: 0.75rem; }
        .size-head { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
        .size-head h3 { margin: 0; font-family: var(--font-display, inherit); font-size: 1.15rem; color: var(--color-fg, #f5f3ef); }
        .size-sub { font-size: 0.8rem; color: var(--color-fg-muted, #a8a49c); }
        .chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .chip {
          font-family: var(--font-body, inherit);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
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
        .video-frame {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid var(--color-border, #2a2a2a);
          background: #000;
        }
        .video-frame video,
        .video-frame canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.25s ease;
        }
        .video-frame canvas {
          opacity: 0;
          pointer-events: none;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .caption { margin: 0; font-size: 0.85rem; color: var(--color-fg-muted, #a8a49c); max-width: none; }
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

export default function AureoleSizeDemo({ demos }: { demos: SizeDemo[] }) {
  return (
    <div className="size-demo-grid">
      {demos.map((demo) => (
        <SizeTrack key={demo.title} demo={demo} />
      ))}
      <style>{`
        .size-demo-grid {
          display: grid;
          gap: 3rem;
        }
      `}</style>
    </div>
  );
}
