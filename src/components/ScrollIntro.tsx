import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Lang } from '../i18n';

interface Props {
  lang?: Lang;
  /** Where the "Get GATE.24" buttons go: the section where the visitor picks Lite or GATE.24. */
  downloadHref: string;
  /** Gumroad links of the two products (empty = not available yet). */
  liteHref?: string;
  fullHref?: string;
  /** Ignore the reduced-motion setting (used by the standalone preview file). */
  forceMotion?: boolean;
}

// Scroll-driven intro for the GATE.24 page: one sticky stage, and everything on it is a plain
// function of the scroll position. There are no queues, timers or waits: the scroll decides
// which chapter and which step is current, and each change is a short CSS transition that
// simply retargets if the reader keeps scrolling. A fast scroll therefore never builds up delay;
// it just lands on the right state.
// Paced for a mouse wheel: one notch is about 10vh, and every step of the intro gets about 33vh
// (3 to 4 notches), the presets 50vh (5 notches), so a single notch never changes anything big.
const TOTAL = 1232;
const w = (a: number, b: number) => [a / TOTAL, b / TOTAL] as const;

// Where each chapter starts, in vh of scrolling: opening title, presets, grain, vignette,
// crop, weave + flicker, download.
const TH = [0, 40, 389, 611, 755, 922, 1142];
const CH = { open: 0, presets: 1, grain: 2, vig: 3, bars: 4, fx: 5, cta: 6 };

// Scroll windows of the steps inside a chapter.
const W = {
  presets: w(64, 364), // 6 changes x 50vh: the presets get about 5 clicks each
  zoom: w(414, 484),
  stocks: w(494, 593),
  vig: w(635, 725),
  bars: w(777, 909),
  fx: w(947, 1112),
};

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const ramp = (p: number, win: readonly [number, number]) => clamp((p - win[0]) / (win[1] - win[0]));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// Plugin names (presets, controls) stay in English in every language.
// `es` is the Spanish title shown in the intro; the plugin's own name is shown under it.
const looks = [
  { id: 'original', label: 'Original', es: 'Original', src: '/intro-proto/m07_original.webp' },
  { id: 'cinema35', label: 'Cinema 35', es: 'Cine 35', src: '/intro-proto/m07_cinema35.webp' },
  { id: 'dustywestern', label: 'Dusty Western', es: 'Western polvoriento', src: '/intro-proto/m07_dustywestern.webp' },
  { id: 'romance', label: 'Romance / Reverie', es: 'Romance / Ensueño', src: '/intro-proto/m07_romance.webp' },
  // 4:3 shows the side bars, the other formats show top and bottom.
  { id: 'editorial', label: 'Editorial 4:3', es: 'Editorial 4:3', src: '/library/m07_editorial_pro.webp' },
  { id: 'classichorror', label: 'Classic Horror', es: 'Terror clásico', src: '/intro-proto/m07_classichorror.webp' },
  // Last step: the other presets, shown without naming one.
  { id: 'more', label: '… and more', es: '… y más', src: '/library/m07_homegrownvhs.webp' },
];

// Coarsest grain last.
const grains = [
  { label: '65 mm', freq: 0.95, alpha: 0.55 },
  { label: '35 mm', freq: 0.78, alpha: 0.65 },
  { label: '16 mm', freq: 0.55, alpha: 0.78 },
  { label: '8 mm', freq: 0.36, alpha: 0.9 },
];

// The Format list of the plugin today (4:5 and 9:16 were removed 2026-10-12).
// Four highlights of the Format list (the plugin also has 2.20:1 and 2:1).
const ratios = [
  { label: '2.39:1', value: 2.39 },
  { label: '1.85:1', value: 1.85 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
];

// Weave "Vertical" (0-0.30) and Flicker "Amount" (2-5 %), as in the plugin.
// Stage 0 = both off, 1-2 = weave rising, 3-4 = weave at max + flicker rising.
const weaveSteps = [0, 0.15, 0.3, 0.3, 0.3];
const flickerSteps = [0, 0, 0, 3, 5];
const FX_STAGES = 5;

// Real pixel sizes of the shipped WebP files, so the browser reserves the space.
const imgSize = {
  wide: { width: 1800, height: 949 },
  grain: { width: 3200, height: 1688 },
};

const grainUri = (freq: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    // Neutral mid-grey noise (sRGB, opaque, mean 0.5) so the overlay blend changes
    // texture only, never the exposure of the picture underneath.
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/><feComponentTransfer><feFuncR type='linear' slope='2.4' intercept='-0.7'/><feFuncG type='linear' slope='2.4' intercept='-0.7'/><feFuncB type='linear' slope='2.4' intercept='-0.7'/></feComponentTransfer></filter><rect width='220' height='220' filter='url(#n)'/></svg>`,
  )}")`;
const grainUris = grains.map((g) => grainUri(g.freq));

const copy = {
  en: {
    aria: 'GATE.24 intro',
    eyebrow: 'A DaVinci Resolve plugin',
    scroll: 'Scroll',
    get: 'Get GATE.24',
    skip: 'Skip the intro',
    presetsTag: 'One click, a whole look',
    grainTag: 'Grain by film stock',
    vignetteTag: 'Darkens the edges like a real lens',
    cropTag: 'Bars for cinema formats',
    weaveTag: 'The frame hops like a film projector',
    flickerTag: 'Exposure pulses from frame to frame',
    off: 'Off',
    inPlugin: 'In the plugin',
    moreSub: '10 presets in GATE.24, 5 in Lite',
    grain: 'Grain',
    vignette: 'Vignette',
    crop: 'Crop',
    amount: 'Amount',
    ctaTitle: 'Pick your version',
    lite: 'GATE.24 Lite',
    liteText: '5 presets. Free.',
    full: 'GATE.24',
    fullText: '10 presets, Weave, Flicker and Advanced.',
    getLite: 'Get Lite',
    soon: 'Link coming soon',
    summary:
      'GATE.24 gives DaVinci Resolve film presets, grain by film stock, vignette, crop bars in cinema formats, weave and flicker.',
  },
  es: {
    aria: 'Introducción de GATE.24',
    eyebrow: 'Un plugin de DaVinci Resolve',
    scroll: 'Baja',
    get: 'Conseguir GATE.24',
    skip: 'Saltar la intro',
    presetsTag: 'Un clic, un look entero',
    grainTag: 'Grano según la película',
    vignetteTag: 'Oscurece los bordes como una óptica real',
    cropTag: 'Barras para formatos de cine',
    weaveTag: 'El fotograma salta como en un proyector',
    flickerTag: 'La exposición pulsa de un fotograma a otro',
    off: 'Off',
    inPlugin: 'En el plugin',
    moreSub: '10 presets en GATE.24, 5 en Lite',
    grain: 'Grano',
    vignette: 'Viñeta',
    crop: 'Recorte',
    amount: 'Cantidad',
    ctaTitle: 'Elige tu versión',
    lite: 'GATE.24 Lite',
    liteText: '5 presets. Gratis.',
    full: 'GATE.24',
    fullText: '10 presets, Weave, Flicker y Advanced.',
    getLite: 'Conseguir Lite',
    soon: 'Enlace próximamente',
    summary:
      'GATE.24 añade a DaVinci Resolve presets de película, grano según la película, viñeta, barras en formatos de cine, weave y flicker.',
  },
};

type ChapterState = 'before' | 'on' | 'after';

/** Content that slides down through a mask: in from above, out below. No fading. */
function Mask({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <span className="si-m">
      <span className="si-m-in" style={{ '--d': `${delay}s` } as CSSProperties}>
        {children}
      </span>
    </span>
  );
}

interface CenterProps {
  state: ChapterState;
  tag: string;
  title: string;
  value?: string;
  sub?: string;
  steps?: number;
  active?: number;
}

/** The big centred title of a chapter, with a row of step dots under it. */
function Center({ state, tag, title, value, sub, steps, active = 0 }: CenterProps) {
  return (
    <div className="si-center" data-s={state} aria-hidden="true">
      <Mask delay={0}>
        <p className="si-tag">{tag}</p>
      </Mask>
      <Mask delay={0.05}>
        <h2 className="si-big" translate="no">{title}</h2>
      </Mask>
      {value && (
        <Mask delay={0.1}>
          <p className="si-value" translate="no">{value}</p>
        </Mask>
      )}
      {sub && (
        <Mask delay={0.13}>
          <p className="si-sub">{sub}</p>
        </Mask>
      )}
      {steps && (
        <Mask delay={0.16}>
          <ul className="si-dots">
            {Array.from({ length: steps }, (_, i) => (
              <li key={i} className={i === active ? 'on' : i < active ? 'done' : undefined} />
            ))}
          </ul>
        </Mask>
      )}
    </div>
  );
}

export default function ScrollIntro({ lang = 'en', downloadHref, liteHref = '', fullHref = '', forceMotion = false }: Props) {
  const t = copy[lang];
  const rootRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [stage, setStage] = useState({ w: 16, h: 9 });
  const [reduced, setReduced] = useState(false);
  const [jitter, setJitter] = useState({ y: 0, b: 1 });
  const [inView, setInView] = useState(false);

  const fxRef = useRef({ amp: 0, flick: 0 });
  const lookRef = useRef(0);
  const chRef = useRef(0);

  useEffect(() => {
    // "Reduced motion" keeps the scroll-driven chapters (the reader controls them) but
    // swaps every slide and zoom for a short dissolve and drops the weave/flicker shake.
    // `?motion=full` overrides it so the intro can be judged on a PC that has Windows
    // animations switched off.
    const force = forceMotion || new URLSearchParams(window.location.search).get('motion') === 'full';
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches && !force);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // The shake only runs while the intro is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Decode every picture ahead of time, so a layer that slides in is already ready to paint.
  useEffect(() => {
    rootRef.current?.querySelectorAll('img').forEach((img) => {
      if (typeof img.decode === 'function') img.decode().catch(() => {});
    });
  }, []);

  // Scroll position -> progress, once per frame.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(span > 0 ? clamp(-r.top / span) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      setStage({ w: window.innerWidth, h: window.innerHeight });
      onScroll();
    };
    update();
    setStage({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // ---- everything below is a plain function of the scroll position -------------------------
  const vh = p * TOTAL;

  // Current chapter, with a little hysteresis so it never flickers at a threshold.
  let c = chRef.current;
  while (c < TH.length - 1 && vh >= TH[c + 1]) c++;
  while (c > 0 && vh < TH[c] - 8) c--;
  chRef.current = c;
  const stateOf = (k: number): ChapterState => (c < k ? 'before' : c === k ? 'on' : 'after');

  // Steps inside the chapters.
  const lookIdx = ramp(p, W.presets) * (looks.length - 1);
  if (Math.abs(lookIdx - lookRef.current) > 0.58) lookRef.current = Math.round(lookIdx);
  const lookNow = lookRef.current;
  const grainNow = clamp(Math.round(ramp(p, W.stocks) * (grains.length - 1)), 0, grains.length - 1);
  const barStep = clamp(Math.floor(ramp(p, W.bars) * ratios.length), 0, ratios.length - 1);
  const fxStage = clamp(Math.floor(ramp(p, W.fx) * FX_STAGES), 0, FX_STAGES - 1);
  const zoom = ramp(p, W.zoom);
  const g = ramp(p, W.stocks);
  const v = ramp(p, W.vig);

  const weaveNow = weaveSteps[fxStage];
  const flickerNow = flickerSteps[fxStage];

  // Weave = the frame hops vertically every other frame; flicker = exposure pulses.
  fxRef.current = { amp: weaveNow * (stage.h / 100) * 2, flick: flickerNow };
  const fxActive = c === CH.fx && !reduced && inView;
  useEffect(() => {
    if (!fxActive) {
      setJitter({ y: 0, b: 1 });
      return;
    }
    const id = window.setInterval(() => {
      const { amp, flick } = fxRef.current;
      const hop = amp > 0 && Math.random() < 0.4 ? (Math.random() * 2 - 1) * amp : 0;
      setJitter({ y: hop, b: 1 + (Math.random() * 2 - 1) * (flick / 100) * 0.9 });
    }, 83);
    return () => window.clearInterval(id);
  }, [fxActive]);

  const bars = useMemo(() => {
    const ar = stage.w / stage.h;
    const r = ratios[barStep].value;
    if (r > ar) return { v: (1 - ar / r) / 2, h: 0 };
    if (r < ar) return { v: 0, h: (1 - r / ar) / 2 };
    return { v: 0, h: 0 };
  }, [stage, barStep]);

  // Layer i (grain, vignette, crop, weave) waits below the stage and rises over the previous
  // one when its chapter starts; the previous one drifts up a little slower. Transform only.
  const layerStyle = (own: number): CSSProperties =>
    reduced ? { opacity: c >= own ? 1 : 0 } : { transform: `translate3d(0, ${c < own ? 100 : c > own ? -12 : 0}%, 0)` };

  // The presets sit inside a frame: the picture shrinks a little, leaving black margins.
  const presetsLayer: CSSProperties | undefined = reduced
    ? undefined
    : { transform: `translate3d(0, ${c >= CH.grain ? -12 : 0}%, 0) scale(${c === CH.presets ? 0.88 : 1})` };

  // A slow push-in while a shot is on screen, so there is always gentle motion.
  const drift = (a: number, b: number, amount: number): CSSProperties | undefined =>
    reduced ? undefined : { transform: `scale(${1 + clamp((vh - a) / (b - a)) * amount})` };

  const fxTitle = fxStage === 0 ? 'Weave · Flicker' : fxStage <= 2 ? 'Weave' : 'Flicker';
  const fxValue = fxStage === 0 ? t.off : fxStage <= 2 ? `Vertical ${weaveNow.toFixed(2)}` : `Amount ${flickerNow}%`;
  const fxSub = fxStage === 0 ? undefined : fxStage <= 2 ? t.weaveTag : `${t.flickerTag} · Weave ${weaveSteps[2].toFixed(2)}`;

  const atTop = vh < 24;
  const barsOn = c >= CH.bars;
  const ctaOn = c >= CH.cta;

  // Straight to the information below the intro (no smooth scroll through the whole hook).
  const jumpTo = (id: string) => (e: React.MouseEvent) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'instant' as ScrollBehavior });
    history.replaceState(null, '', '#' + id);
  };
  const skipIntro = jumpTo('library');
  // "Get GATE.24" leads to the choice (Lite or GATE.24) without scrolling through the hook.
  const getIt = downloadHref.startsWith('#') ? jumpTo(downloadHref.slice(1)) : undefined;

  return (
    <section
      ref={rootRef}
      className={`si${reduced ? ' si-calm' : ''}${inView ? ' si-live' : ''}`}
      style={{ height: `calc(100dvh + ${TOTAL}vh)` }}
      aria-label={t.aria}
    >
      <div className="si-stage">
        <p className="si-sr" translate="no">
          {`${t.summary} Presets: ${looks
            .filter((l) => l.id !== 'more')
            .map((l) => l.label)
            .join(', ')}. Grain: ${grains.map((x) => x.label).join(', ')}. Crop: ${ratios.map((r) => r.label).join(', ')}.`}
        </p>

        <div className="si-media" aria-hidden="true">
          {/* Hero + presets: the same plane; each preset is applied in place */}
          <div className="si-layer" style={presetsLayer} data-covered={c >= CH.grain}>
            {looks.map((l, i) => (
              <img
                key={l.id}
                className="si-img si-look"
                src={l.src}
                alt=""
                draggable={false}
                style={{ opacity: i === lookNow ? 1 : 0 }}
                {...imgSize.wide}
                fetchPriority={i === 0 ? 'high' : undefined}
                decoding="async"
              />
            ))}
          </div>

          {/* Grain: the whole frame, then a zoom, then the stock changes */}
          <div className="si-layer si-up" style={layerStyle(CH.grain)} data-covered={c > CH.grain}>
            <img
              className="si-img"
              src="/intro-proto/m08_original.webp"
              alt=""
              draggable={false}
              style={{ transform: `scale(${reduced ? 2.2 : lerp(1, 3.2, smooth(zoom))})`, transformOrigin: '18% 88%' }}
              {...imgSize.grain}
              decoding="async"
            />
            {grains.map((gr, i) => (
              <div
                key={gr.label}
                className="si-grain"
                style={{ backgroundImage: grainUris[i], opacity: i === grainNow ? gr.alpha * lerp(0.4, 1, Math.max(zoom * 0.7, g)) : 0 }}
              />
            ))}
          </div>

          {/* Vignette */}
          <div className="si-layer si-up" style={layerStyle(CH.vig)} data-covered={c > CH.vig}>
            <img
              className="si-img"
              src="/intro-proto/m04_original.webp"
              alt=""
              draggable={false}
              style={drift(TH[CH.vig], TH[CH.bars], 0.07)}
              {...imgSize.wide}
              decoding="async"
            />
            <div
              className="si-vig"
              style={{
                background: `radial-gradient(ellipse at center, transparent ${lerp(78, 24, v)}%, rgba(0,0,0,${lerp(0, 0.97, v)}) 100%)`,
              }}
            />
          </div>

          {/* Crop bars */}
          <div className="si-layer si-up" style={layerStyle(CH.bars)} data-covered={c > CH.bars}>
            <img
              className="si-img"
              src="/intro-proto/m07_original.webp"
              alt=""
              draggable={false}
              style={drift(TH[CH.bars], TH[CH.fx], 0.05)}
              {...imgSize.wide}
              decoding="async"
            />
            <div className="si-bar" style={{ top: 0, left: 0, right: 0, height: `${barsOn ? bars.v * 100 : 0}%` }} />
            <div className="si-bar" style={{ bottom: 0, left: 0, right: 0, height: `${barsOn ? bars.v * 100 : 0}%` }} />
            <div className="si-bar" style={{ top: 0, bottom: 0, left: 0, width: `${barsOn ? bars.h * 100 : 0}%` }} />
            <div className="si-bar" style={{ top: 0, bottom: 0, right: 0, width: `${barsOn ? bars.h * 100 : 0}%` }} />
          </div>

          {/* Weave + flicker (and the closing backdrop) */}
          <div className="si-layer si-up" style={layerStyle(CH.fx)}>
            <img
              className="si-img"
              src="/intro-proto/m05_original.webp"
              alt=""
              draggable={false}
              style={{ transform: `translateY(${jitter.y}px) scale(1.04)`, filter: `brightness(${jitter.b * (ctaOn ? 0.45 : 1)})` }}
              {...imgSize.wide}
              decoding="async"
            />
            <div className="si-shade" />
          </div>
        </div>

        {/* Opening title: pulled down out of the gate when the presets begin */}
        <div
          className="si-title"
          style={
            reduced
              ? { opacity: c === CH.open ? 1 : 0, pointerEvents: c === CH.open ? 'auto' : 'none' }
              : { transform: `translate3d(0, ${c === CH.open ? 0 : 104}%, 0)`, pointerEvents: c === CH.open ? 'auto' : 'none' }
          }
        >
          <p className="si-eyebrow">{t.eyebrow}</p>
          <h1 translate="no">GATE.24</h1>
          <div className="si-open-actions">
            <a className="si-btn" href={downloadHref} onClick={getIt} tabIndex={c === CH.open ? 0 : -1}>
              {t.get}
            </a>
            <a className="si-btn si-btn-ghost" href="#library" onClick={skipIntro} tabIndex={c === CH.open ? 0 : -1}>
              {t.skip}
            </a>
          </div>
        </div>
        <p
          className="si-hint"
          style={reduced ? { opacity: atTop ? 1 : 0 } : { transform: `translate3d(0, ${atTop && c === CH.open ? 0 : 400}%, 0)` }}
        >
          {t.scroll} ↓
        </p>

        {/* One big, centred title per chapter */}
        <Center
          state={stateOf(CH.presets)}
          tag={t.presetsTag}
          title={lang === 'es' ? looks[lookNow].es : looks[lookNow].label}
          sub={
            looks[lookNow].id === 'more'
              ? t.moreSub
              : lang === 'es' && looks[lookNow].es !== looks[lookNow].label
                ? `${t.inPlugin}: ${looks[lookNow].label}`
                : undefined
          }
          steps={looks.length}
          active={lookNow}
        />
        <Center
          state={stateOf(CH.grain)}
          tag={t.grainTag}
          title={t.grain}
          sub={lang === 'es' ? `${t.inPlugin}: Grain` : undefined}
          value={grains[grainNow].label}
          steps={grains.length}
          active={grainNow}
        />
        <Center
          state={stateOf(CH.vig)}
          tag={t.vignetteTag}
          title={t.vignette}
          sub={lang === 'es' ? `${t.inPlugin}: Vignette` : undefined}
          value={`${t.amount} ${Math.round(v * 100)}`}
        />
        <Center
          state={stateOf(CH.bars)}
          tag={t.cropTag}
          title={t.crop}
          sub={lang === 'es' ? `${t.inPlugin}: Crop` : undefined}
          value={ratios[barStep].label}
          steps={ratios.length}
          active={barStep}
        />
        <Center
          state={stateOf(CH.fx)}
          tag={fxStage === 0 ? '' : ' '}
          title={fxTitle}
          value={fxValue}
          sub={fxSub}
          steps={FX_STAGES}
          active={fxStage}
        />

        {/* Closing: download. Slides down into place like the other chapters. */}
        <div
          className="si-cta"
          style={{
            ...(reduced ? { opacity: ctaOn ? 1 : 0 } : { transform: `translate3d(0, ${ctaOn ? 0 : -104}%, 0)` }),
            pointerEvents: ctaOn ? 'auto' : 'none',
          }}
        >
          <h2>{t.ctaTitle}</h2>
          <div className="si-cards">
            <div className="si-card">
              <h3>{t.lite}</h3>
              <p>{t.liteText}</p>
              {liteHref ? (
                <a className="si-btn" href={liteHref} tabIndex={ctaOn ? 0 : -1}>
                  {t.getLite}
                </a>
              ) : (
                <span className="si-btn si-btn-off">{t.soon}</span>
              )}
            </div>
            <div className="si-card">
              <h3>{t.full}</h3>
              <p>{t.fullText}</p>
              {fullHref ? (
                <a className="si-btn" href={fullHref} tabIndex={ctaOn ? 0 : -1}>
                  {t.get}
                </a>
              ) : (
                <span className="si-btn si-btn-off">{t.soon}</span>
              )}
            </div>
          </div>
        </div>

        {/* Always-there download button */}
        <a className="si-top-btn" href={downloadHref} onClick={getIt}>
          {t.get}
        </a>
      </div>
      <style>{styles}</style>
    </section>
  );
}

// Short, plain transitions: every one of them retargets instantly if the scroll moves on.
const EASE = 'cubic-bezier(.4,0,.2,1)';
const SOFT = 'cubic-bezier(.33,1,.68,1)';
const styles = `
.si { position: relative; background: #000; }
.si-stage {
  position: sticky; top: var(--si-top, 4rem);
  height: calc(100dvh - var(--si-top, 4rem));
  overflow: hidden; background: #000; color: #f5f5f3;
}
.si-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.si-media { position: absolute; inset: 0; overflow: hidden; background: #000; }
.si-layer { position: absolute; inset: 0; overflow: hidden; background: #000; transition: transform 1.05s ${SOFT}; } /* clip: the slowly zoomed picture must never poke out above the layer's edge */
.si-up { box-shadow: 0 -24px 48px rgba(0,0,0,.5); }
.si-layer::after { content: ''; position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; transition: opacity 1s ease; }
.si-layer[data-covered='true']::after { opacity: .55; }
.si-live .si-layer, .si-live .si-title, .si-live .si-cta { will-change: transform; }
.si-look { transition: opacity .5s ease; }
.si-m { display: block; overflow: hidden; padding: .17em .4em; margin: -.17em -.4em; } /* room for accents and overshoot so big titles are never clipped */
.si-m-in { display: flow-root; transform: translate3d(0, -140%, 0); transition: transform .4s ${EASE} var(--d, 0s); }
.si-center { visibility: hidden; transition: visibility 0s linear .9s; }
.si-center[data-s='on'] { visibility: visible; transition-delay: 0s; }
.si-center[data-s='on'] .si-m-in { transform: none; transition: transform .65s ${SOFT} calc(var(--d, 0s) + .18s); }
.si-center[data-s='after'] .si-m-in { transform: translate3d(0, 140%, 0); }
.si-live .si-m-in { will-change: transform; }
.si-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; -webkit-user-drag: none; user-select: none; }
.si-grain { position: absolute; inset: 0; mix-blend-mode: overlay; background-size: 220px 220px; transition: opacity .3s ease; }
.si-vig { position: absolute; inset: 0; }
.si-shade { position: absolute; inset: 0; background: rgba(0,0,0,.3); } /* keeps the big text readable over the bright wall */
.si-bar { position: absolute; background: #000; transition: height .7s ${SOFT}, width .7s ${SOFT}; }
.si-title { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; padding: 1rem; pointer-events: none;
  background: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,0) 40%, rgba(0,0,0,.5)); transition: transform 1s ${SOFT}; }
.si-title h1 { font-family: var(--font-display, Georgia, serif); font-size: clamp(3rem, 12vw, 8rem); line-height: 1; margin: .4rem 0 0; letter-spacing: .01em; }
.si-open-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; margin-top: 1.6rem; pointer-events: auto; }
.si-btn.si-btn-ghost { background: rgba(0,0,0,.35); color: #f5f5f3; border-color: rgba(245,245,243,.55); }
@media (hover: hover) and (pointer: fine) { a.si-btn.si-btn-ghost:hover { background: #f5f5f3; color: #0a0a0a; border-color: #f5f5f3; } }
.si-eyebrow { font: 600 .8125rem/1 ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; color: rgba(245,245,243,.85); margin: 0; }
.si-hint { position: absolute; left: 0; right: 0; max-width: none; bottom: max(1.2rem, env(safe-area-inset-bottom)); text-align: center; font: 600 .8125rem ui-monospace, Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; margin: 0; color: rgba(245,245,243,.8); transition: transform .7s ${EASE}; }

.si-center { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: .5rem; padding: 1rem; text-align: center; pointer-events: none; isolation: isolate;
  text-shadow: 0 1px 2px rgba(0,0,0,.5), 0 0 10px rgba(0,0,0,.45), 0 0 32px rgba(0,0,0,.5); }
.si-tag { margin: 0; min-height: 1em; font: 600 .8125rem/1.2 ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; color: rgba(245,245,243,.9); }
.si-big { margin: 0; font-family: var(--font-display, Georgia, serif); font-weight: 700; font-size: clamp(2.6rem, 9vw, 8rem); line-height: 1; letter-spacing: .005em; text-wrap: balance; }
.si-value { margin: .2rem 0 0; font: 600 clamp(1.5rem, 4.4vw, 3.6rem)/1.1 ui-monospace, 'Cascadia Mono', Consolas, monospace; font-variant-numeric: tabular-nums; letter-spacing: .04em; }
.si-sub { margin: 0; font: 500 clamp(.8125rem, 1.6vw, 1rem)/1.3 ui-monospace, Consolas, monospace; letter-spacing: .06em; color: rgba(245,245,243,.85); text-wrap: balance; }
.si-dots { list-style: none; display: flex; gap: .55rem; margin: 1.1rem 0 0; padding: 0; }
.si-dots li { width: .6rem; height: .6rem; border-radius: 50%; border: 1px solid rgba(245,245,243,.7); background: rgba(0,0,0,.25); transition: background-color .2s ease, transform .2s ease; }
.si-dots li.done { background: rgba(245,245,243,.55); }
.si-dots li.on { background: #f5f5f3; transform: scale(1.35); }

.si-cta { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 1.2rem; padding: 1rem; text-align: center; transition: transform 1s ${SOFT}; }
.si-cta h2 { font-family: var(--font-display, Georgia, serif); font-size: clamp(1.8rem, 5vw, 3rem); margin: 0; }
.si-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 18rem)); gap: 1rem; }
@media (max-width: 640px) { .si-cards { grid-template-columns: minmax(0, 20rem); } }
.si-card { border: 1px solid rgba(245,245,243,.3); background: rgba(10,10,10,.88); padding: 1.2rem; display: grid; gap: .5rem; justify-items: center; }
.si-card h3 { font-family: var(--font-display, Georgia, serif); margin: 0; font-size: 1.3rem; }
.si-card p { margin: 0; color: rgba(245,245,243,.78); font-size: .9rem; }
.si-btn, .si-top-btn { touch-action: manipulation; -webkit-tap-highlight-color: rgba(245,245,243,.2);
  transition: transform .14s ${EASE}, background-color .18s ease, color .18s ease, border-color .18s ease; }
.si-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: .5rem 1.1rem; border: 1px solid #f5f5f3; background: #f5f5f3; color: #0a0a0a; font-weight: 600; font-size: .85rem; text-decoration: none; }
.si-btn-off { background: transparent; color: rgba(245,245,243,.6); border-color: rgba(245,245,243,.3); }
.si-top-btn { position: absolute; top: max(.8rem, env(safe-area-inset-top)); right: max(.8rem, env(safe-area-inset-right)); z-index: 3; display: inline-flex; align-items: center; min-height: 44px; padding: .4rem 1rem; border: 1px solid rgba(245,245,243,.5); background: rgba(0,0,0,.6); color: #f5f5f3; font-weight: 600; font-size: .8125rem; text-decoration: none; }
.si-btn:focus-visible, .si-top-btn:focus-visible { outline: 2px solid #f5f5f3; outline-offset: 3px; }
.si-btn:active, .si-top-btn:active { transform: scale(.97); }
@media (hover: hover) and (pointer: fine) {
  .si-top-btn:hover { background: #f5f5f3; color: #0a0a0a; }
  a.si-btn:hover { background: #fff; border-color: #fff; }
}
/* Calm mode (reduced motion): nothing slides, zooms or shakes. Chapters and titles change with a
   short dissolve instead: the old one fades out first, then the new one fades in. */
.si-calm .si-bar, .si-calm .si-dots li, .si-calm .si-btn, .si-calm .si-top-btn { transition: none; }
.si-calm .si-layer, .si-calm .si-title, .si-calm .si-cta, .si-calm .si-hint { transition: opacity .5s ease; }
.si-calm .si-center { visibility: visible; opacity: 0; transition: opacity .25s ease; }
.si-calm .si-center[data-s='on'] { opacity: 1; transition: opacity .35s ease .25s; }
.si-calm .si-m-in { transform: none !important; transition: none; }
`;
