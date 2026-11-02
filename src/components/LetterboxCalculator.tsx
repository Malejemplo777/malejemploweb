import { useEffect, useMemo, useRef, useState } from 'react';
import { pagePath, type Lang } from '../i18n';
import { calcBars, ratios, sources } from '../lib/letterbox';

interface Props {
  lang?: Lang;
}

const copy = {
  en: {
    sourceLabel: 'Size',
    targetLabel: 'Ratio',
    custom: 'Custom',
    width: 'Width (px)',
    height: 'Height (px)',
    ratioInput: 'Ratio (e.g. 2.76 or 21:9)',
    badSource: 'Enter a width and height between 16 and 16384 px.',
    badRatio: 'Enter a ratio like 2.39, 2.39:1 or 21:9.',
    gateTitle: 'Film gate preview',
    barTB: 'Bar, top and bottom',
    barLR: 'Bar, left and right',
    noBars: 'No bars needed',
    visibleShort: 'Visible',
    copy: 'Copy',
    copied: 'Copied',
    px: 'px',
    alt: 'Sample film frame with the letterbox bars applied',
    altOwn: 'Your photo with the letterbox bars applied',
    upload: 'Use your own photo',
    uploadHint: 'It stays in your browser.',
    yourPhoto: 'Your photo',
    useSample: 'Back to the sample',
    download: 'Download PNG with bars',
    gate: 'Do it in one click with GATE.24',
    badImage: "Couldn't read that image. Try a JPG, PNG or WebP.",
  },
  es: {
    sourceLabel: 'Tamaño',
    targetLabel: 'Relación',
    custom: 'Otra',
    width: 'Ancho (px)',
    height: 'Alto (px)',
    ratioInput: 'Relación (p. ej. 2.76 o 21:9)',
    badSource: 'Escribe un ancho y un alto entre 16 y 16384 px.',
    badRatio: 'Escribe una relación como 2.39, 2.39:1 o 21:9.',
    gateTitle: 'Vista previa del film gate',
    barTB: 'Barra arriba y abajo',
    barLR: 'Barra a los lados',
    noBars: 'No hacen falta barras',
    visibleShort: 'Visible',
    copy: 'Copiar',
    copied: 'Copiado',
    px: 'px',
    alt: 'Fotograma de ejemplo con las barras negras aplicadas',
    altOwn: 'Tu foto con las barras negras aplicadas',
    upload: 'Usar tu propia foto',
    uploadHint: 'Se queda en tu navegador.',
    yourPhoto: 'Tu foto',
    useSample: 'Volver al ejemplo',
    download: 'Descargar PNG con barras',
    gate: 'Hazlo en un clic con GATE.24',
    badImage: 'No he podido leer esa imagen. Prueba con un JPG, PNG o WebP.',
  },
} as const;

// Accepts "2.39", "2,39", "2.39:1", "21:9" or "21/9"; returns width / height.
function parseRatio(input: string): number | null {
  const s = input.trim().replace(',', '.');
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(?:[:/]\s*(\d+(?:\.\d+)?))?$/);
  if (!m) return null;
  const a = parseFloat(m[1]);
  const b = m[2] === undefined ? 1 : parseFloat(m[2]);
  const v = a / b;
  return Number.isFinite(v) && v >= 0.2 && v <= 10 ? v : null;
}

function parseDim(input: string): number | null {
  if (!/^\d{1,5}$/.test(input.trim())) return null;
  const n = parseInt(input, 10);
  return n >= 16 && n <= 16384 ? n : null;
}

// Same fractal-noise grain the rest of the site uses, as an inline SVG.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function LetterboxCalculator({ lang = 'en' }: Props) {
  const c = copy[lang];
  const loc = lang === 'es' ? 'es-ES' : 'en-US';
  const fmt = (n: number) => n.toLocaleString(loc);
  const dec = (n: number, d: number) => n.toLocaleString(loc, { minimumFractionDigits: d, maximumFractionDigits: d });

  const [sourceId, setSourceId] = useState('hd');
  const [customW, setCustomW] = useState('2048');
  const [customH, setCustomH] = useState('858');
  const [ratioId, setRatioId] = useState('2.39');
  const [customRatio, setCustomRatio] = useState('2.76');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ url: string; w: number; h: number } | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Release the blob URL when it is replaced or the component goes away.
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  function loadFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError(true);
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      setPhotoError(false);
      setPhoto({ url, w: probe.naturalWidth, h: probe.naturalHeight });
      setSourceId('photo');
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setPhotoError(true);
    };
    probe.src = url;
  }

  function clearPhoto() {
    setPhoto(null);
    setPhotoError(false);
    if (fileRef.current) fileRef.current.value = '';
    if (sourceId === 'photo') setSourceId('hd');
  }

  const src = sources.find((s) => s.id === sourceId);
  const usePhotoSize = sourceId === 'photo' && photo;
  const w = usePhotoSize ? photo.w : src ? src.w : parseDim(customW);
  const h = usePhotoSize ? photo.h : src ? src.h : parseDim(customH);
  const ratio = ratios.find((r) => r.id === ratioId);
  const target = ratio ? ratio.value : parseRatio(customRatio);
  const targetLabel = ratio ? ratio.label : `${customRatio.trim()}`;

  const bars = useMemo(
    () => (w && h && target ? calcBars(w, h, target) : null),
    [w, h, target],
  );

  // Keep the last valid geometry on screen while a custom field is mid-edit
  // so the preview doesn't collapse.
  const [last, setLast] = useState({ w: 1920, h: 1080, bars: calcBars(1920, 1080, 2.39) });
  if (bars && w && h && (last.bars !== bars || last.w !== w || last.h !== h)) {
    setLast({ w, h, bars });
  }
  const shown = bars ?? last.bars;
  const sw = bars && w ? w : last.w;
  const sh = bars && h ? h : last.h;

  const letter = shown.mode === 'letterbox';
  const pillar = shown.mode === 'pillarbox';

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1400);
    } catch {
      /* clipboard can be blocked; the number is on screen anyway */
    }
  }

  function downloadPng() {
    const img = imgRef.current;
    if (!img || !bars || !w || !h) return;
    try {
      // Cap the longest side so a huge photo can't exhaust memory.
      const k = Math.min(1, 4096 / Math.max(w, h));
      const cw = Math.round(w * k);
      const ch = Math.round(h * k);
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Same "cover" fit the preview uses.
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      const dw = ir > cr ? ch * ir : cw;
      const dh = ir > cr ? ch : cw / ir;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx.fillStyle = '#000';
      const b = Math.round(bars.bar * k);
      if (bars.mode === 'letterbox') {
        ctx.fillRect(0, 0, cw, b);
        ctx.fillRect(0, ch - b, cw, b);
      } else if (bars.mode === 'pillarbox') {
        ctx.fillRect(0, 0, b, ch);
        ctx.fillRect(cw - b, 0, b, ch);
      }
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `letterbox-${targetLabel.replace(/[^0-9a-z.]+/gi, '-')}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, 'image/png');
    } catch {
      /* canvas can fail on very large images; nothing else to do */
    }
  }


  return (
    <div className="lbx">
      <div className="lbx-controls">
        <fieldset className="lbx-group">
          <legend className="lbx-label">{c.sourceLabel}</legend>
          <div className="lbx-chips">
            {photo && (
              <button
                type="button"
                className="lbx-chip"
                aria-pressed={sourceId === 'photo'}
                onClick={() => setSourceId('photo')}
              >
                {c.yourPhoto} {fmt(photo.w)}×{fmt(photo.h)}
              </button>
            )}
            {sources.map((s) => (
              <button
                key={s.id}
                type="button"
                className="lbx-chip"
                aria-pressed={sourceId === s.id}
                onClick={() => setSourceId(s.id)}
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              className="lbx-chip"
              aria-pressed={sourceId === 'custom'}
              onClick={() => setSourceId('custom')}
            >
              {c.custom}
            </button>
          </div>
          {sourceId === 'custom' && (
            <div className="lbx-inputs">
              <label>
                <span>{c.width}</span>
                <input
                  inputMode="numeric"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                  aria-invalid={!w}
                />
              </label>
              <span className="lbx-times" aria-hidden="true">×</span>
              <label>
                <span>{c.height}</span>
                <input
                  inputMode="numeric"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                  aria-invalid={!h}
                />
              </label>
            </div>
          )}
          {sourceId === 'custom' && (!w || !h) && <p className="lbx-error" role="alert">{c.badSource}</p>}
        </fieldset>

        <fieldset className="lbx-group">
          <legend className="lbx-label">{c.targetLabel}</legend>
          <div className="lbx-chips">
            {ratios.map((r) => (
              <button
                key={r.id}
                type="button"
                className="lbx-chip lbx-chip-ratio"
                aria-pressed={ratioId === r.id}
                onClick={() => setRatioId(r.id)}
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              className="lbx-chip lbx-chip-ratio"
              aria-pressed={ratioId === 'custom'}
              onClick={() => setRatioId('custom')}
            >
              {c.custom}
            </button>
          </div>
          {ratioId === 'custom' && (
            <div className="lbx-inputs">
              <label>
                <span>{c.ratioInput}</span>
                <input
                  value={customRatio}
                  onChange={(e) => setCustomRatio(e.target.value)}
                  aria-invalid={!target}
                />
              </label>
            </div>
          )}
          {ratioId === 'custom' && !target && <p className="lbx-error" role="alert">{c.badRatio}</p>}
        </fieldset>

        <div className="lbx-group lbx-upload">
          <input
            ref={fileRef}
            id="lbx-file"
            className="lbx-file"
            type="file"
            accept="image/*"
            onChange={(e) => loadFile(e.target.files?.[0])}
          />
          <label htmlFor="lbx-file" className="lbx-chip lbx-upload-btn">{c.upload}</label>
          {photo && (
            <button type="button" className="lbx-chip" onClick={clearPhoto}>{c.useSample}</button>
          )}
          <p className="lbx-hint">{c.uploadHint}</p>
          {photoError && <p className="lbx-error" role="alert">{c.badImage}</p>}
        </div>
      </div>

      <div className="lbx-body">
        <figure
          className={`lbx-strip${dragging ? ' lbx-drop' : ''}`}
          aria-label={c.gateTitle}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files?.[0]); }}
        >
          <div className="lbx-perfs lbx-perfs-l" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
          <div className="lbx-perfs lbx-perfs-r" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>

          <div className="lbx-stage">
            <div className="lbx-gate" style={{ ['--ar' as string]: sw / sh }}>
              <img
                ref={imgRef}
                className="lbx-photo"
                src={photo ? photo.url : '/showcase/sample-beach.webp'}
                alt={photo ? c.altOwn : c.alt}
                draggable={false}
              />
              <div className="lbx-grain" style={{ backgroundImage: GRAIN }} aria-hidden="true" />

              <div className="lbx-bar lbx-top" style={{ height: `${letter ? shown.barPct : 0}%` }}>
                {letter && shown.barPct > 7 && <span>{fmt(shown.bar)} {c.px}</span>}
              </div>
              <div className="lbx-bar lbx-bottom" style={{ height: `${letter ? shown.barPct : 0}%` }}>
                {letter && shown.barPct > 7 && <span>{fmt(shown.bar)} {c.px}</span>}
              </div>
              <div className="lbx-bar lbx-left" style={{ width: `${pillar ? shown.barPct : 0}%` }}>
                {pillar && shown.barPct > 14 && <span>{fmt(shown.bar)} {c.px}</span>}
              </div>
              <div className="lbx-bar lbx-right" style={{ width: `${pillar ? shown.barPct : 0}%` }}>
                {pillar && shown.barPct > 14 && <span>{fmt(shown.bar)} {c.px}</span>}
              </div>

              {/* Framing guide on the visible area */}
              <div
                className="lbx-frame"
                aria-hidden="true"
                style={{
                  top: `${letter ? shown.barPct : 0}%`,
                  bottom: `${letter ? shown.barPct : 0}%`,
                  left: `${pillar ? shown.barPct : 0}%`,
                  right: `${pillar ? shown.barPct : 0}%`,
                }}
              >
                <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
              </div>
            </div>
          </div>

        </figure>

        <div className="lbx-readout" aria-live="polite">
          {bars && (
            <>
              <div className="lbx-cell lbx-cell-main">
                <span className="lbx-k">{letter ? c.barTB : pillar ? c.barLR : c.noBars}</span>
                {shown.mode !== 'none' && (
                  <>
                    <span className="lbx-v">
                      {fmt(shown.bar)}<small>{c.px}</small>
                    </span>
                    <button type="button" className="lbx-copy" onClick={() => copyValue('bar', String(shown.bar))}>
                      {copiedKey === 'bar' ? c.copied : c.copy}
                    </button>
                  </>
                )}
              </div>

              <div className="lbx-cell">
                <span className="lbx-k">{c.visibleShort}</span>
                <span className="lbx-v lbx-v-sm">
                  {fmt(shown.visibleW)} × {fmt(shown.visibleH)}
                </span>
              </div>

              <div className="lbx-actions">
                {shown.mode !== 'none' && (
                  <button type="button" className="lbx-download" onClick={downloadPng}>{c.download}</button>
                )}
                <a className="lbx-gate-link" href={pagePath('gate24', lang)}>{c.gate} &rarr;</a>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .lbx {
          --lbx-mono: ui-monospace, 'SF Mono', 'Cascadia Mono', Consolas, 'Liberation Mono', monospace;
          --lbx-stage-h: 24rem;
          display: grid;
          gap: var(--space-4);
        }

        .lbx-controls { display: grid; gap: var(--space-3); }
        .lbx-group { border: 0; margin: 0; padding: 0; min-width: 0; }
        .lbx-label {
          padding: 0;
          margin-bottom: 0.6rem;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-fg-muted);
        }
        .lbx-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }

        .lbx-chip {
          font: 500 0.8125rem var(--lbx-mono);
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
          color: var(--color-fg-muted);
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 2px;
          padding: 0.45rem 0.8rem;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .lbx-chip:hover { color: var(--color-fg); border-color: var(--color-fg-muted); }
        .lbx-chip[aria-pressed='true'] {
          color: var(--color-bg);
          background: var(--color-fg);
          border-color: var(--color-fg);
        }
        .lbx-chip:focus-visible, .lbx-copy:focus-visible, .lbx-inputs input:focus-visible {
          outline: 2px solid var(--color-fg);
          outline-offset: 2px;
        }

        .lbx-inputs { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.9rem; }
        .lbx-inputs label { display: grid; gap: 0.3rem; font-size: 0.8125rem; color: var(--color-fg-muted); letter-spacing: 0.08em; text-transform: uppercase; }
        .lbx-inputs input {
          width: 10rem;
          font: 500 1rem var(--lbx-mono);
          font-variant-numeric: tabular-nums;
          color: var(--color-fg);
          background: var(--color-bg-raised);
          border: 1px solid var(--color-border);
          border-radius: 2px;
          padding: 0.5rem 0.7rem;
        }
        .lbx-inputs input[aria-invalid='true'] { border-color: #c9694f; }
        .lbx-times { color: var(--color-fg-muted); padding-bottom: 0.55rem; }
        .lbx-error { margin: 0.6rem 0 0; font-size: 0.8125rem; color: #d8836b; }

        .lbx-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
        .lbx-file:focus-visible + .lbx-upload-btn { outline: 2px solid var(--color-fg); outline-offset: 2px; }
        .lbx-upload { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; position: relative; }
        .lbx-upload-btn { display: inline-block; color: var(--color-fg); border-color: var(--color-fg-muted); }
        .lbx-hint { flex: 1 1 100%; margin: 0.2rem 0 0; font-size: 0.8125rem; color: var(--color-fg-muted); max-width: none; }
        .lbx-drop { outline: 2px dashed var(--color-fg); outline-offset: -6px; }
        .lbx-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.4rem; }
        .lbx-actions > * { flex: 1 1 11rem; text-align: center; }
        .lbx-gate-link {
          font: 600 0.8125rem var(--lbx-mono);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--color-fg);
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 2px;
          padding: 0.65rem 0.9rem;
          transition: border-color 0.2s;
        }
        .lbx-gate-link:hover { border-color: var(--color-fg); }
        .lbx-gate-link:focus-visible { outline: 2px solid var(--color-fg); outline-offset: 2px; }
        .lbx-download {
          margin-top: 0;
          font: 600 0.8125rem var(--lbx-mono);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-bg);
          background: var(--color-fg);
          border: 1px solid var(--color-fg);
          border-radius: 2px;
          padding: 0.65rem 0.9rem;
          cursor: pointer;
        }
        .lbx-download:hover { background: transparent; color: var(--color-fg); }
        .lbx-download:focus-visible { outline: 2px solid var(--color-fg); outline-offset: 2px; }

        .lbx-body {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
          gap: var(--space-4);
          align-items: start;
        }

        /* ---- film strip ---- */
        .lbx-strip {
          position: relative;
          margin: 0;
          padding: 1.4rem 2.6rem;
          background: #050505;
          border: 1px solid var(--color-border);
          border-radius: 2px;
        }
        .lbx-perfs {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2.6rem;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          align-items: center;
          pointer-events: none;
        }
        .lbx-perfs-l { left: 0; }
        .lbx-perfs-r { right: 0; }
        .lbx-perfs i {
          display: block;
          width: 0.7rem;
          height: 0.46rem;
          background: var(--color-bg);
          border: 1px solid #1d1d1d;
          border-radius: 1px;
        }


        .lbx-stage {
          height: var(--lbx-stage-h);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lbx-gate {
          position: relative;
          aspect-ratio: var(--ar);
          width: min(100%, calc(var(--lbx-stage-h) * var(--ar)));
          overflow: hidden;
          background: #000;
          box-shadow: 0 0 0 1px #262626, 0 18px 50px rgba(0, 0, 0, 0.6);
          transition: width 0.4s ease;
        }
        .lbx-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(1.06) saturate(0.92);
          user-select: none;
        }
        .lbx-grain {
          position: absolute;
          inset: 0;
          background-size: 160px 160px;
          mix-blend-mode: overlay;
          opacity: 0.2;
          pointer-events: none;
          animation: lbx-grain 0.9s steps(5) infinite;
        }
        @keyframes lbx-grain {
          0% { background-position: 0 0; }
          20% { background-position: -40px 25px; }
          40% { background-position: 30px -55px; }
          60% { background-position: -70px -20px; }
          80% { background-position: 55px 45px; }
          100% { background-position: 0 0; }
        }

        .lbx-bar {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 7px),
            #000;
          transition: height 0.55s cubic-bezier(0.65, 0, 0.2, 1), width 0.55s cubic-bezier(0.65, 0, 0.2, 1);
        }
        .lbx-bar span {
          font: 0.8125rem var(--lbx-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(245, 243, 239, 0.55);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .lbx-top { top: 0; left: 0; right: 0; }
        .lbx-bottom { bottom: 0; left: 0; right: 0; }
        .lbx-left { top: 0; bottom: 0; left: 0; }
        .lbx-right { top: 0; bottom: 0; right: 0; }
        .lbx-left span, .lbx-right span { writing-mode: vertical-rl; }

        .lbx-frame {
          position: absolute;
          pointer-events: none;
          border: 1px solid rgba(245, 243, 239, 0.28);
          transition: top 0.55s cubic-bezier(0.65, 0, 0.2, 1), bottom 0.55s cubic-bezier(0.65, 0, 0.2, 1),
            left 0.55s cubic-bezier(0.65, 0, 0.2, 1), right 0.55s cubic-bezier(0.65, 0, 0.2, 1);
        }
        .lbx-frame i { position: absolute; width: 0.9rem; height: 0.9rem; border: 0 solid rgba(245, 243, 239, 0.9); }
        .lbx-frame .tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; }
        .lbx-frame .tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; }
        .lbx-frame .bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; }
        .lbx-frame .br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; }

        /* ---- counter readout ---- */
        .lbx-readout {
          display: grid;
          gap: 0.75rem;
          background: var(--color-bg-raised);
          border: 1px solid var(--color-border);
          border-radius: 2px;
          padding: 1.2rem 1.3rem 1.3rem;
        }
        .lbx-cell {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: baseline;
          gap: 0.15rem 1rem;
          padding-top: 0.75rem;
          border-top: 1px dashed var(--color-border);
        }
        .lbx-k {
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-fg-muted);
        }
        .lbx-v {
          font: 500 clamp(2.4rem, 4vw, 3.3rem) var(--lbx-mono);
          font-variant-numeric: tabular-nums;
          line-height: 1;
          color: var(--color-fg);
          grid-column: 1;
        }
        .lbx-v small { font-size: 0.9rem; letter-spacing: 0.08em; margin-left: 0.4rem; color: var(--color-fg-muted); }
        .lbx-v-sm { font-size: 1.15rem; text-align: right; grid-column: 2; }
        .lbx-cell-main { grid-template-columns: 1fr auto; }
        .lbx-cell-main .lbx-k { grid-column: 1 / -1; }
        .lbx-copy {
          align-self: end;
          font: 600 0.8125rem var(--lbx-mono);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-fg-muted);
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 2px;
          padding: 0.35rem 0.6rem;
          cursor: pointer;
        }
        .lbx-copy:hover { color: var(--color-fg); border-color: var(--color-fg-muted); }

        @media (max-width: 900px) {
          .lbx-body { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .lbx { --lbx-stage-h: 15rem; }
          .lbx-strip { padding: 1rem 0.9rem; }
          .lbx-perfs { display: none; }
          .lbx-inputs input { width: 100%; }
          .lbx-inputs label { flex: 1 1 8rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lbx-grain { animation: none; }
        }
      `}</style>
    </div>
  );
}
