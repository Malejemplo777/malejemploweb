import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Lang } from '../i18n';

interface Props {
  lang?: Lang;
  /** Where the "get it" buttons go. */
  downloadHref: string;
  /** Ignore the reduced-motion setting (used by the standalone preview file). */
  forceMotion?: boolean;
}

// Scroll-driven intro for the GATE.24 page. One sticky stage; the scroll position
// (0..1) drives every layer. Windows below are written in "vh of scrolling" and
// converted to progress units, so a chapter can be lengthened by editing one pair.
const TOTAL = 890;
const w = (a: number, b: number) => [a / TOTAL, b / TOTAL] as const;

const W = {
  presetsIn: w(40, 64),
  presets: w(64, 240),
  presetsOut: w(240, 264),
  grainIn: w(250, 276),
  zoom: w(292, 340),
  stocks: w(340, 436),
  grainOut: w(436, 462),
  vigIn: w(448, 474),
  vig: w(474, 530),
  vigOut: w(530, 556),
  barsIn: w(544, 570),
  bars: w(570, 666),
  barsOut: w(666, 692),
  moveIn: w(680, 706),
  fx: w(706, 826),
  cta: w(832, 866),
};

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const ramp = (p: number, win: readonly [number, number]) => clamp((p - win[0]) / (win[1] - win[0]));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Smootherstep: flatter at both ends than smoothstep, so every slide, zoom and
// title eases in and out more gently.
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** 1 at i, falling to 0 one step away: a cross-fade between neighbours. */
const tri = (x: number, i: number) => clamp(1 - Math.abs(x - i));

// Plugin names (presets, controls) stay in English in every language.
// `es` is the Spanish title shown in the intro; the plugin's own name is shown under it.
const looks = [
  { id: 'original', label: 'Original', es: 'Original', src: '/intro-proto/m07_original.webp' },
  { id: 'cinema35', label: 'Cinema 35', es: 'Cine 35', src: '/intro-proto/m07_cinema35.webp' },
  { id: 'dustywestern', label: 'Dusty Western', es: 'Western polvoriento', src: '/intro-proto/m07_dustywestern.webp' },
  { id: 'romance', label: 'Romance / Reverie', es: 'Romance / Ensueño', src: '/intro-proto/m07_romance.webp' },
  { id: 'classichorror', label: 'Classic Horror', es: 'Terror clásico', src: '/intro-proto/m07_classichorror.webp' },
  { id: 'urban', label: 'Urban Editorial', es: 'Editorial urbano', src: '/intro-proto/m07_urban_pro.webp' },
  // Last step: the other presets, shown without naming one.
  { id: 'more', label: '… and more', es: '… y más', src: '/library/m07_homegrownvhs.webp' },
];

// Coarsest grain last.
const grains = [
  { label: '65 mm', freq: 0.95, alpha: 0.55 },
  { label: '35 mm', freq: 0.78, alpha: 0.65 },
  { label: '16 mm', freq: 0.55, alpha: 0.78 },
  { label: '8 mm', freq: 0.36, alpha: 0.9 },
];

// The Format list of the plugin today (4:5 and 9:16 were removed 2026-10-12).
const ratios = [
  { label: '2.39:1', value: 2.39 },
  { label: '2.20:1', value: 2.2 },
  { label: '2:1', value: 2 },
  { label: '1.85:1', value: 1.85 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
];

// Weave "Vertical" (0-0.30) and Flicker "Amount" (2-5 %), as in the plugin.
const weaveSteps = [0, 0.1, 0.2, 0.3];
const flickerSteps = [0, 2, 3.5, 5];
// Stage 0 = both off, 1-3 = weave rising, 4-6 = weave at max + flicker rising.
const FX_STAGES = 7;

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

const copy = {
  en: {
    aria: 'GATE.24 intro',
    eyebrow: 'A DaVinci Resolve plugin',
    scroll: 'Scroll',
    get: 'Get GATE.24',
    presetsTag: 'One click, a whole look',
    grainTag: 'Grain by film stock',
    vignetteTag: 'Darkens the edges like a real lens',
    cropTag: 'Bars for cinema formats',
    weaveTag: 'The frame hops like a film projector',
    flickerTag: 'Exposure pulses from frame to frame',
    off: 'Off',
    inPlugin: 'In the plugin',
    moreSub: '10 presets in Pro, 5 in Lite',
    grain: 'Grain',
    vignette: 'Vignette',
    crop: 'Crop',
    amount: 'Amount',
    ctaTitle: 'Pick your version',
    lite: 'GATE.24 Lite',
    liteText: '5 presets. Free.',
    pro: 'GATE.24 Pro',
    proText: '10 presets, Weave, Flicker and Advanced.',
    soon: 'Coming soon',
    summary:
      'GATE.24 gives DaVinci Resolve film presets, grain by film stock, vignette, crop bars in cinema formats, weave and flicker.',
  },
  es: {
    aria: 'Introducción de GATE.24',
    eyebrow: 'Un plugin de DaVinci Resolve',
    scroll: 'Baja',
    get: 'Conseguir GATE.24',
    presetsTag: 'Un clic, un look entero',
    grainTag: 'Grano según la película',
    vignetteTag: 'Oscurece los bordes como una óptica real',
    cropTag: 'Barras para formatos de cine',
    weaveTag: 'El fotograma salta como en un proyector',
    flickerTag: 'La exposición pulsa de un fotograma a otro',
    off: 'Off',
    inPlugin: 'En el plugin',
    moreSub: '10 presets en Pro, 5 en Lite',
    grain: 'Grano',
    vignette: 'Viñeta',
    crop: 'Recorte',
    amount: 'Cantidad',
    ctaTitle: 'Elige tu versión',
    lite: 'GATE.24 Lite',
    liteText: '5 presets. Gratis.',
    pro: 'GATE.24 Pro',
    proText: '10 presets, Weave, Flicker y Advanced.',
    soon: 'Próximamente',
    summary:
      'GATE.24 añade a DaVinci Resolve presets de película, grano según la película, viñeta, barras en formatos de cine, weave y flicker.',
  },
};

interface CenterProps {
  /** 0 -> 1 while the title comes in, 0 -> 1 while it leaves. */
  inP: number;
  outP: number;
  calm: boolean;
  tag: string;
  title: string;
  value?: string;
  sub?: string;
  steps?: number;
  active?: number;
  /** Re-run the small arrival animation when the title / value text changes. */
  swapTitle?: boolean;
  swapValue?: boolean;
}

/** Text that changes with the scroll. The old text slides down and out while the new
 * one slides down in from above, at the same time, so there is never an empty moment. */
function SwapText({ text, className, tag: Tag, animate }: { text: string; className: string; tag: 'h2' | 'p'; animate: boolean }) {
  const [cur, setCur] = useState(text);
  const [prev, setPrev] = useState<string | null>(null);
  const [n, setN] = useState(0);
  if (text !== cur) {
    setPrev(cur);
    setCur(text);
    setN((k) => k + 1);
  }
  useEffect(() => {
    if (prev === null) return;
    const id = window.setTimeout(() => setPrev(null), 950);
    return () => window.clearTimeout(id);
  }, [n]);
  if (!animate) return <Tag className={className} translate="no">{cur}</Tag>;
  return (
    <span className="si-swapbox">
      {prev !== null && (
        <Tag key={`o${n}`} className={`${className} si-out`} translate="no">
          {prev}
        </Tag>
      )}
      <Tag key={`i${n}`} className={n > 0 ? `${className} si-in` : className} translate="no">
        {cur}
      </Tag>
    </span>
  );
}

/** Content that slides down through a mask: in from above, out below. No fading. */
function Mask({ inE, outX, delay, calm, children }: { inE: number; outX: number; delay: number; calm: boolean; children: React.ReactNode }) {
  const span = 1 - 0.36;
  const e = smooth(clamp((inE - delay) / span));
  const x = smooth(clamp((outX - delay) / span));
  return (
    <span className="si-m">
      <span className="si-m-in" style={calm ? undefined : { transform: `translate3d(0, ${(e - 1) * 110 + x * 110}%, 0)` }}>
        {children}
      </span>
    </span>
  );
}

/** The big centred title of a chapter, with a row of step dots under it. */
function Center({ inP, outP, calm, tag, title, value, sub, steps, active = 0, swapTitle, swapValue }: CenterProps) {
  const e = smooth(inP);
  const x = smooth(outP);
  const shown = e * (1 - x);
  return (
    <div
      className="si-center"
      style={calm ? { visibility: shown > 0.5 ? 'visible' : 'hidden' } : undefined}
      aria-hidden="true"
    >
      <Mask inE={inP} outX={outP} delay={0} calm={calm}>
        <p className="si-tag">{tag}</p>
      </Mask>
      <Mask inE={inP} outX={outP} delay={0.1} calm={calm}>
        <SwapText text={title} className="si-big" tag="h2" animate={!!swapTitle && !calm} />
      </Mask>
      {value && (
        <Mask inE={inP} outX={outP} delay={0.2} calm={calm}>
          <SwapText text={value} className="si-value" tag="p" animate={!!swapValue && !calm} />
        </Mask>
      )}
      {sub && (
        <Mask inE={inP} outX={outP} delay={0.26} calm={calm}>
          <SwapText text={sub} className="si-sub" tag="p" animate={!!swapTitle && !calm} />
        </Mask>
      )}
      {steps && (
        <Mask inE={inP} outX={outP} delay={0.32} calm={calm}>
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

export default function ScrollIntro({ lang = 'en', downloadHref, forceMotion = false }: Props) {
  const t = copy[lang];
  const rootRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [stage, setStage] = useState({ w: 16, h: 9 });
  const [reduced, setReduced] = useState(false);
  const [jitter, setJitter] = useState({ y: 0, b: 1 });
  const [inView, setInView] = useState(false);

  const reducedRef = useRef(false);
  const target = useRef(0);
  const shown = useRef(0);
  const raf = useRef(0);
  const fxRef = useRef({ amp: 0, flick: 0 });
  const lookRef = useRef(0);

  useEffect(() => {
    // "Reduced motion" keeps the scroll-driven chapters (the reader controls them)
    // but drops the zoom, the weave/flicker jitter, the smoothing and the bar
    // transitions. `?motion=full` overrides it so the prototype can be judged on a
    // PC that has Windows animations switched off.
    const force = forceMotion || new URLSearchParams(window.location.search).get('motion') === 'full';
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      reducedRef.current = mq.matches && !force;
      setReduced(reducedRef.current);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Loops and layer promotion only run while the intro is on screen.
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

  useEffect(() => {
    const tick = () => {
      raf.current = 0;
      const d = target.current - shown.current;
      // Ease towards the scroll position so a hard flick glides through the
      // chapters instead of jumping.
      shown.current = Math.abs(d) < 0.00015 || reducedRef.current ? target.current : shown.current + d * 0.09;
      setP(shown.current);
      if (shown.current !== target.current) raf.current = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      target.current = span > 0 ? clamp(-r.top / span) : 0;
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    const measure = () => {
      setStage({ w: window.innerWidth, h: window.innerHeight });
      onScroll();
    };
    // First read is instant (page reloaded halfway down).
    const el = rootRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      shown.current = target.current = span > 0 ? clamp(-r.top / span) : 0;
      setP(shown.current);
    }
    setStage({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // ---- derived values -------------------------------------------------------
  const lookIdx = ramp(p, W.presets) * (looks.length - 1);
  // The looks are a vertical strip of frames, like film in a projector gate. Each
  // look holds still; when the scroll passes the halfway point to the next one the
  // strip advances with a timed, eased move (CSS), so it is equally smooth however
  // the wheel or trackpad delivers the scroll. A little hysteresis stops it from
  // flipping back and forth right at the threshold.
  if (Math.abs(lookIdx - lookRef.current) > 0.58) lookRef.current = Math.round(lookIdx);
  const lookNow = lookRef.current;

  const inset = ramp(p, W.presetsIn) * (1 - ramp(p, W.presetsOut));
  // The opening title leaves like a slide being pulled down out of the gate.
  const titleOut = smooth(ramp(p, w(24, 60)));

  // Chapter changes are camera moves, not fades through black: the next shot
  // rises over the previous one, which drifts up a little slower.
  const inGrain = smooth(ramp(p, W.grainIn));
  const inVig = smooth(ramp(p, W.vigIn));
  const inBars = smooth(ramp(p, W.barsIn));
  const inMove = smooth(ramp(p, W.moveIn));
  const slide = (self: number, next: number): CSSProperties =>
    reduced
      ? { opacity: self }
      : {
          transform: `translate3d(0, ${(1 - self) * 100 - next * 14}%, 0)`,
          boxShadow: self > 0 && self < 1 ? '0 -40px 80px rgba(0,0,0,.55)' : 'none',
        };
  // A slow push-in while a shot is on screen, so there is always gentle motion.
  const drift = (a: readonly [number, number], b: readonly [number, number], amount: number) =>
    reduced ? undefined : { transform: `scale(${1 + ramp(p, [a[0], b[1]] as const) * amount})` };

  const zoom = ramp(p, W.zoom);
  const g = ramp(p, W.stocks);
  const grainIdx = g * (grains.length - 1);
  const grainNow = Math.min(grains.length - 1, Math.floor(grainIdx + 0.5));

  const v = ramp(p, W.vig);

  const barStep = clamp(Math.floor(ramp(p, W.bars) * ratios.length), 0, ratios.length - 1);

  const ctaOpacity = ramp(p, W.cta);
  const fxStage = clamp(Math.floor(ramp(p, W.fx) * FX_STAGES), 0, FX_STAGES - 1);
  const weaveNow = weaveSteps[Math.min(fxStage, 3)];
  const flickerNow = flickerSteps[Math.max(0, fxStage - 3)];

  fxRef.current = { amp: weaveNow * (stage.h / 100) * 2, flick: flickerNow };
  const fxActive = p >= W.moveIn[0] && !reduced && inView;
  useEffect(() => {
    if (!fxActive) {
      setJitter({ y: 0, b: 1 });
      return;
    }
    // Weave = the frame hops vertically every other frame (12 fps here);
    // flicker = exposure pulses. Both amounts follow the stage, exaggerated a
    // little so they read on a web page.
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

  // Clip, don't resize: animating top/left/right/bottom would re-layout every frame.
  const mediaInset: CSSProperties = {
    clipPath: `inset(${inset * 8}% ${inset * 9}% ${inset * 10}% ${inset * 9}%)`,
  };

  const fxTitle = fxStage === 0 ? 'Weave · Flicker' : fxStage <= 3 ? 'Weave' : 'Flicker';
  const fxValue =
    fxStage === 0 ? t.off : fxStage <= 3 ? `Vertical ${weaveNow.toFixed(2)}` : `Amount ${flickerNow}%`;
  const fxSub = fxStage === 0 ? undefined : fxStage <= 3 ? t.weaveTag : `${t.flickerTag} · Weave ${weaveSteps[3].toFixed(2)}`;

  return (
    <section
      ref={rootRef}
      className={`si${reduced ? ' si-calm' : ''}${inView ? ' si-live' : ''}`}
      style={{ height: `calc(100dvh + ${TOTAL}vh)` }}
      aria-label={t.aria}
    >
      <div className="si-stage">
        <p className="si-sr" translate="no">
          {`${t.summary} Presets: ${looks.map((l) => l.label).join(', ')}. Grain: ${grains.map((x) => x.label).join(', ')}. Crop: ${ratios
            .map((r) => r.label)
            .join(', ')}.`}
        </p>

        <div className="si-media" style={mediaInset} aria-hidden="true">
          {/* Hero + presets: the same plane, each look laid over the previous one */}
          <div className="si-layer" style={reduced ? undefined : { transform: `translate3d(0, ${-inGrain * 14}%, 0)` }}>
            {looks.map((l, i) => (
              <img
                key={l.id}
                className="si-img si-look"
                src={l.src}
                alt=""
                draggable={false}
                style={
                  reduced
                    ? { opacity: i === lookNow ? 1 : 0 }
                    : {
                        // The incoming frame settles from a touch larger, like film seating in the gate.
                        transform: `translate3d(0, ${(i - lookNow) * 104}%, 0) scale(${1 + 0.02 * Math.min(1, Math.abs(i - lookNow))})`,
                      }
                }
                {...imgSize.wide}
                fetchPriority={i === 0 ? 'high' : undefined}
                decoding="async"
              />
            ))}
          </div>

          {/* Grain: the whole frame, then a zoom, then the stock changes */}
          <div className="si-layer" style={slide(inGrain, inVig)}>
            <img
              className="si-img"
              src="/intro-proto/m08_original.webp"
              alt=""
              draggable={false}
              style={{ transform: `scale(${reduced ? 2.2 : lerp(1, 4.2, smooth(zoom))})`, transformOrigin: '18% 88%' }}
              {...imgSize.grain}
              decoding="async"
            />
            {grains.map((gr, i) => (
              <div
                key={gr.label}
                className="si-grain"
                style={{ backgroundImage: grainUri(gr.freq), opacity: tri(grainIdx, i) * gr.alpha * lerp(0.4, 1, Math.max(zoom * 0.7, g)) }}
              />
            ))}
          </div>

          {/* Vignette */}
          <div className="si-layer" style={slide(inVig, inBars)}>
            <img
              className="si-img"
              src="/intro-proto/m04_original.webp"
              alt=""
              draggable={false}
              style={drift(W.vigIn, W.vigOut, 0.07)}
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
          <div className="si-layer" style={slide(inBars, inMove)}>
            <img
              className="si-img"
              src="/intro-proto/m07_original.webp"
              alt=""
              draggable={false}
              style={drift(W.barsIn, W.barsOut, 0.05)}
              {...imgSize.wide}
              decoding="async"
            />
            <div className="si-bar" style={{ top: 0, left: 0, right: 0, height: `${bars.v * 100}%` }} />
            <div className="si-bar" style={{ bottom: 0, left: 0, right: 0, height: `${bars.v * 100}%` }} />
            <div className="si-bar" style={{ top: 0, bottom: 0, left: 0, width: `${bars.h * 100}%` }} />
            <div className="si-bar" style={{ top: 0, bottom: 0, right: 0, width: `${bars.h * 100}%` }} />
          </div>

          {/* Weave + flicker (and the closing backdrop) */}
          <div className="si-layer" style={slide(inMove, 0)}>
            <img
              className="si-img"
              src="/intro-proto/m05_original.webp"
              alt=""
              draggable={false}
              style={{
                transform: `translateY(${jitter.y}px) scale(1.04)`,
                filter: `brightness(${jitter.b * (1 - ctaOpacity * 0.55)})`,
              }}
              {...imgSize.wide}
              decoding="async"
            />
          </div>
        </div>

        {/* Opening title */}
        <div
          className="si-title"
          style={reduced ? { visibility: titleOut < 0.5 ? 'visible' : 'hidden' } : { transform: `translate3d(0, ${titleOut * 104}%, 0)` }}
        >
          <p className="si-eyebrow">{t.eyebrow}</p>
          <h1 translate="no">GATE.24</h1>
        </div>
        <p className="si-hint" style={reduced ? { visibility: p < 0.02 ? 'visible' : 'hidden' } : { transform: `translate3d(0, ${ramp(p, w(0, 24)) * 400}%, 0)` }}>
          {t.scroll} ↓
        </p>

        {/* One big, centred title per chapter */}
        <Center
          inP={ramp(p, w(52, 68))}
          outP={ramp(p, w(250, 263))}
          calm={reduced}
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
          swapTitle
        />
        <Center
          inP={ramp(p, w(263, 276))}
          outP={ramp(p, w(448, 461))}
          calm={reduced}
          tag={t.grainTag}
          title={t.grain}
          sub={lang === 'es' ? `${t.inPlugin}: Grain` : undefined}
          value={grains[grainNow].label}
          steps={grains.length}
          active={grainNow}
          swapValue
        />
        <Center
          inP={ramp(p, w(461, 474))}
          outP={ramp(p, w(544, 557))}
          calm={reduced}
          tag={t.vignetteTag}
          title={t.vignette}
          sub={lang === 'es' ? `${t.inPlugin}: Vignette` : undefined}
          value={`${t.amount} ${Math.round(v * 100)}`}
        />
        <Center
          inP={ramp(p, w(557, 570))}
          outP={ramp(p, w(680, 693))}
          calm={reduced}
          tag={t.cropTag}
          title={t.crop}
          sub={lang === 'es' ? `${t.inPlugin}: Crop` : undefined}
          value={ratios[barStep].label}
          steps={ratios.length}
          active={barStep}
        />
        <Center
          inP={ramp(p, w(693, 706))}
          outP={ramp(p, w(812, 840))}
          calm={reduced}
          tag={fxStage === 0 ? '' : ' '}
          title={fxTitle}
          value={fxValue}
          sub={fxSub}
          steps={FX_STAGES}
          active={fxStage}
          swapTitle
          swapValue
        />

        {/* Closing: download */}
        <div
          className="si-cta"
          style={{
            ...(reduced ? { visibility: ctaOpacity > 0.5 ? 'visible' : 'hidden' } : { transform: `translate3d(0, ${(smooth(ctaOpacity) - 1) * 104}%, 0)` }),
            pointerEvents: ctaOpacity > 0.6 ? 'auto' : 'none',
          }}
        >
          <h2>{t.ctaTitle}</h2>
          <div className="si-cards">
            <div className="si-card">
              <h3>{t.lite}</h3>
              <p>{t.liteText}</p>
              <a className="si-btn" href={downloadHref} tabIndex={ctaOpacity > 0.6 ? 0 : -1}>
                {t.get}
              </a>
            </div>
            <div className="si-card">
              <h3>{t.pro}</h3>
              <p>{t.proText}</p>
              <span className="si-btn si-btn-off">{t.soon}</span>
            </div>
          </div>
        </div>

        {/* Always-there download button */}
        <a className="si-top-btn" href={downloadHref}>
          {t.get}
        </a>
      </div>
      <style>{styles}</style>
    </section>
  );
}

const styles = `
.si { position: relative; background: #000; }
.si-stage {
  position: sticky; top: var(--si-top, 4rem);
  height: calc(100dvh - var(--si-top, 4rem));
  overflow: hidden; background: #000; color: #f5f3ef;
}
.si-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.si-media { position: absolute; inset: 0; overflow: hidden; background: #000; }
.si-layer { position: absolute; inset: 0; }
.si-live .si-layer { will-change: transform; }
.si-look { transition: transform 1.5s cubic-bezier(.45,0,.2,1); }
.si-live .si-look { will-change: transform; }
.si-swapbox { display: grid; justify-items: center; }
.si-swapbox > * { grid-area: 1 / 1; }
.si-in { animation: si-in .95s cubic-bezier(.3,.1,.2,1) both; }
.si-out { animation: si-out .95s cubic-bezier(.3,.1,.2,1) both; }
@keyframes si-in { from { transform: translateY(-108%); } }
@keyframes si-out { to { transform: translateY(108%); } }
.si-m { display: block; overflow: hidden; padding: .06em .4em; margin: -.06em -.4em; }
.si-m-in { display: flow-root; }
.si-live .si-m-in, .si-live .si-title, .si-live .si-cta, .si-live .si-hint { will-change: transform; }
.si-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; -webkit-user-drag: none; user-select: none; }
.si-grain { position: absolute; inset: 0; mix-blend-mode: overlay; background-size: 220px 220px; }
.si-vig { position: absolute; inset: 0; }
.si-bar { position: absolute; background: #000; transition: height .55s cubic-bezier(.2,.7,.2,1), width .55s cubic-bezier(.2,.7,.2,1); }
.si-title { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; padding: 1rem; pointer-events: none;
  background: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,0) 40%, rgba(0,0,0,.5)); }
.si-title h1 { font-family: var(--font-display, Georgia, serif); font-size: clamp(3rem, 12vw, 8rem); line-height: 1; margin: .4rem 0 0; letter-spacing: .01em; }
.si-eyebrow { font: 600 .8125rem/1 ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; color: rgba(245,243,239,.85); margin: 0; }
.si-hint { position: absolute; left: 0; right: 0; bottom: max(1.2rem, env(safe-area-inset-bottom)); text-align: center; font: 600 .8125rem ui-monospace, Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; margin: 0; color: rgba(245,243,239,.8); }

.si-center { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: .5rem; padding: 1rem; text-align: center; pointer-events: none; isolation: isolate;
}
/* A soft neutral scrim keeps the title legible over bright skies and highlights. */
.si-center { text-shadow: 0 1px 2px rgba(0,0,0,.45), 0 0 28px rgba(0,0,0,.5); }
.si-tag { margin: 0; min-height: 1em; font: 600 .8125rem/1.2 ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; color: rgba(245,243,239,.9); }
.si-big { margin: 0; font-family: var(--font-display, Georgia, serif); font-weight: 700; font-size: clamp(2.6rem, 9vw, 8rem); line-height: 1; letter-spacing: .005em; text-wrap: balance; }
.si-value { margin: .2rem 0 0; font: 600 clamp(1.5rem, 4.4vw, 3.6rem)/1.1 ui-monospace, 'Cascadia Mono', Consolas, monospace; font-variant-numeric: tabular-nums; letter-spacing: .04em; }
.si-sub { margin: 0; font: 500 clamp(.8125rem, 1.6vw, 1rem)/1.3 ui-monospace, Consolas, monospace; letter-spacing: .06em; color: rgba(245,243,239,.85); text-wrap: balance; }
.si-dots { list-style: none; display: flex; gap: .55rem; margin: 1.1rem 0 0; padding: 0; }
.si-dots li { width: .6rem; height: .6rem; border-radius: 50%; border: 1px solid rgba(245,243,239,.7); background: rgba(0,0,0,.25); transition: background-color .3s ease, transform .3s cubic-bezier(.22,1,.36,1); }
.si-dots li.done { background: rgba(245,243,239,.55); }
.si-dots li.on { background: #f5f3ef; transform: scale(1.35); }

.si-cta { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 1.2rem; padding: 1rem; text-align: center; }
.si-cta h2 { font-family: var(--font-display, Georgia, serif); font-size: clamp(1.8rem, 5vw, 3rem); margin: 0; }
.si-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 18rem)); gap: 1rem; }
@media (max-width: 640px) { .si-cards { grid-template-columns: minmax(0, 20rem); } }
.si-card { border: 1px solid rgba(245,243,239,.3); background: rgba(10,10,10,.88); padding: 1.2rem; display: grid; gap: .5rem; justify-items: center; }
.si-card h3 { font-family: var(--font-display, Georgia, serif); margin: 0; font-size: 1.3rem; }
.si-card p { margin: 0; color: rgba(245,243,239,.78); font-size: .9rem; }
.si-btn, .si-top-btn { touch-action: manipulation; -webkit-tap-highlight-color: rgba(245,243,239,.2);
  transition: transform .14s cubic-bezier(.22,1,.36,1), background-color .18s ease, color .18s ease, border-color .18s ease; }
.si-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: .5rem 1.1rem; border: 1px solid #f5f3ef; background: #f5f3ef; color: #0a0a0a; font-weight: 600; font-size: .85rem; text-decoration: none; }
.si-btn-off { background: transparent; color: rgba(245,243,239,.6); border-color: rgba(245,243,239,.3); }
.si-top-btn { position: absolute; top: max(.8rem, env(safe-area-inset-top)); right: max(.8rem, env(safe-area-inset-right)); z-index: 3; display: inline-flex; align-items: center; min-height: 44px; padding: .4rem 1rem; border: 1px solid rgba(245,243,239,.5); background: rgba(0,0,0,.6); color: #f5f3ef; font-weight: 600; font-size: .8125rem; text-decoration: none; }
.si-btn:focus-visible, .si-top-btn:focus-visible { outline: 2px solid #f5f3ef; outline-offset: 3px; }
.si-btn:active, .si-top-btn:active { transform: scale(.97); }
@media (hover: hover) and (pointer: fine) {
  .si-top-btn:hover { background: #f5f3ef; color: #0a0a0a; }
  a.si-btn:hover { background: #fff; border-color: #fff; }
}
.si-calm .si-look { transition: none; }
.si-calm .si-in, .si-calm .si-out { animation: none; }
.si-calm .si-bar, .si-calm .si-dots li, .si-calm .si-btn, .si-calm .si-top-btn { transition: none; }
`;
