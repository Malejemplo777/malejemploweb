import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Lang } from '../i18n';

interface Props {
  lang?: Lang;
  /** Where the "get it" buttons go. */
  downloadHref: string;
  /** Ignore the reduced-motion setting (used by the standalone preview file). */
  forceMotion?: boolean;
}

// Scroll-driven intro for the GATE.24 page: one sticky stage. The scroll only decides
// WHICH chapter is current and drives the amounts inside it (grain, vignette, the
// bars, weave...). Changing chapter, look or step is never tied to the scroll
// position: crossing a threshold starts a timed, eased move (CSS), so the stage can
// never be left half-way between two states, however fast the wheel or trackpad is.
const TOTAL = 920;
const w = (a: number, b: number) => [a / TOTAL, b / TOTAL] as const;

// Where each chapter starts, in vh of scrolling: opening title, presets, grain,
// vignette, crop, weave + flicker, download.
const TH = [0, 40, 287, 485, 580, 716, 862];
const CH = { open: 0, presets: 1, grain: 2, vig: 3, bars: 4, fx: 5, cta: 6 };

// Amounts inside a chapter.
const W = {
  presets: w(64, 270),
  zoom: w(322, 370),
  stocks: w(370, 466),
  vig: w(504, 560),
  bars: w(600, 696),
  fx: w(736, 856),
};

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const ramp = (p: number, win: readonly [number, number]) => clamp((p - win[0]) / (win[1] - win[0]));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Smootherstep: flatter at both ends than smoothstep.
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
  { id: 'urban', label: 'Urban Editorial', es: 'Editorial urbano', src: '/intro-proto/m07_urban_pro.webp' },
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
    skip: 'Skip the intro',
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
    skip: 'Saltar la intro',
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

/**
 * Follows `target` ONE STEP AT A TIME, in order, never skipping a step. If the scroll
 * runs far ahead (a big wheel spin), the stage plays the steps one after another at a
 * comfortable pace and catches up (a little faster while it is behind, and quicker still
 * on the way back up). `canAdvance` lets a chapter finish its own steps before the next
 * chapter starts. `instant` (intro off screen) jumps straight there.
 */
function useStepper(target: number, ms: number, instant: boolean, canAdvance?: () => boolean) {
  const [v, setV] = useState(target);
  const last = useRef(0);
  const can = useRef(canAdvance);
  can.current = canAdvance;
  useEffect(() => {
    if (instant) {
      if (v !== target) setV(target);
      return;
    }
    if (v === target) return;
    let dead = false;
    let id = 0;
    const forward = target > v;
    const behind = Math.abs(target - v) > 1;
    const attempt = () => {
      if (dead) return;
      if (forward && can.current && !can.current()) {
        id = window.setTimeout(attempt, 90);
        return;
      }
      last.current = performance.now();
      setV((x) => x + Math.sign(target - x));
    };
    const iv = forward ? ms * (behind ? 0.75 : 1) : ms * 0.5;
    id = window.setTimeout(attempt, Math.max(0, iv - (performance.now() - last.current)));
    return () => {
      dead = true;
      window.clearTimeout(id);
    };
  }, [v, target, ms, instant]);
  return instant ? target : v;
}

/** Moves a continuous amount (the vignette) towards its target at a limited speed. */
function useSlew(target: number, perSec: number, instant: boolean) {
  const [v, setV] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    if (instant) {
      ref.current = target;
      setV(target);
      return;
    }
    let raf = 0;
    let t0 = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      const d = target - ref.current;
      const step = perSec * dt;
      ref.current = Math.abs(d) <= step ? target : ref.current + Math.sign(d) * step;
      setV(ref.current);
      if (ref.current !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, perSec, instant]);
  return instant ? target : v;
}

type ChapterState = 'before' | 'on' | 'after';

interface CenterProps {
  state: ChapterState;
  calm: boolean;
  tag: string;
  title: string;
  value?: string;
  sub?: string;
  steps?: number;
  active?: number;
  /** Slide the text when the title / value changes. */
  swapTitle?: boolean;
  swapValue?: boolean;
}

/** Text that changes with the scroll. The old text slides down and out while the new
 * one slides down in from above, at the same time, so there is never an empty moment. */
function SwapText({ text, className, tag: Tag, animate, fade = false }: { text: string; className: string; tag: 'h2' | 'p'; animate: boolean; fade?: boolean }) {
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
    const id = window.setTimeout(() => setPrev(null), 650);
    return () => window.clearTimeout(id);
  }, [n]);
  if (!animate)
    return (
      <Tag key={fade ? n : 0} className={fade && n > 0 ? `${className} si-fadein` : className} translate="no">
        {cur}
      </Tag>
    );
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
function Mask({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <span className="si-m">
      <span className="si-m-in" style={{ '--d': `${delay}s` } as CSSProperties}>
        {children}
      </span>
    </span>
  );
}

/** The big centred title of a chapter, with a row of step dots under it. */
function Center({ state, calm, tag, title, value, sub, steps, active = 0, swapTitle, swapValue }: CenterProps) {
  return (
    <div className="si-center" data-s={state} aria-hidden="true">
      <Mask delay={0}>
        <p className="si-tag">{tag}</p>
      </Mask>
      <Mask delay={0.07}>
        <SwapText text={title} className="si-big" tag="h2" animate={!!swapTitle && !calm} fade={!!swapTitle && calm} />
      </Mask>
      {value && (
        <Mask delay={0.14}>
          <SwapText text={value} className="si-value" tag="p" animate={!!swapValue && !calm} fade={!!swapValue && calm} />
        </Mask>
      )}
      {sub && (
        <Mask delay={0.18}>
          <SwapText text={sub} className="si-sub" tag="p" animate={!!swapTitle && !calm} fade={!!swapTitle && calm} />
        </Mask>
      )}
      {steps && (
        <Mask delay={0.22}>
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
  const chRef = useRef(0);
  const cdRef = useRef(0);

  useEffect(() => {
    // "Reduced motion" keeps the scroll-driven chapters (the reader controls them)
    // but drops the zoom, the weave/flicker jitter, the smoothing and every timed move.
    // `?motion=full` overrides it so the prototype can be judged on a PC that has
    // Windows animations switched off.
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
      // Ease towards the scroll position so the amounts glide.
      shown.current = Math.abs(d) < 0.00015 || reducedRef.current ? target.current : shown.current + d * 0.12;
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

  // ---- current chapter (with a little hysteresis so it never flickers) --------
  const vh = p * TOTAL;
  let c = chRef.current;
  while (c < TH.length - 1 && vh >= TH[c + 1]) c++;
  while (c > 0 && vh < TH[c] - 12) c--;
  chRef.current = c;
  // The chapter the stage is actually showing: it follows `c`, skipping any chapters
  // that were crossed faster than a move can play.
  const k = reduced ? 0.6 : 1;
  const away = !inView; // off screen: no need to play anything
  const inner = useRef({ look: 0, grain: 0, bar: 0, fx: 0, vig: 0 });
  const cd = useStepper(c, 900 * k, away, () => {
    const i = inner.current;
    if (cdRef.current === CH.presets) return i.look >= looks.length - 1;
    if (cdRef.current === CH.grain) return i.grain >= grains.length - 1;
    if (cdRef.current === CH.vig) return i.vig >= 0.97;
    if (cdRef.current === CH.bars) return i.bar >= ratios.length - 1;
    if (cdRef.current === CH.fx) return i.fx >= FX_STAGES - 1;
    return true;
  });
  cdRef.current = cd;

  const stateOf = (k: number): ChapterState => (cd < k ? 'before' : cd === k ? 'on' : 'after');

  // ---- looks: a vertical strip of frames, like film in a projector gate -------
  const lookIdx = ramp(p, W.presets) * (looks.length - 1);
  if (Math.abs(lookIdx - lookRef.current) > 0.58) lookRef.current = Math.round(lookIdx);
  const lookNow = useStepper(cd >= CH.presets ? lookRef.current : 0, 800 * k, away);

  // ---- other steps, one at a time ---------------------------------------------
  const grainTarget = Math.min(grains.length - 1, Math.floor(ramp(p, W.stocks) * (grains.length - 1) + 0.5));
  const grainNow = useStepper(grainTarget, 800 * k, away);
  const barTarget = clamp(Math.floor(ramp(p, W.bars) * ratios.length), 0, ratios.length - 1);
  const barStep = useStepper(barTarget, 480 * k, away);
  const fxTarget = clamp(Math.floor(ramp(p, W.fx) * FX_STAGES), 0, FX_STAGES - 1);
  const fxStage = useStepper(fxTarget, 700 * k, away);

  const zoom = ramp(p, W.zoom);
  const g = ramp(p, W.stocks);
  const v = useSlew(ramp(p, W.vig), 0.55 / k, away);
  inner.current = { look: lookNow, grain: grainNow, bar: barStep, fx: fxStage, vig: v };

  // A slow push-in while a shot is on screen, so there is always gentle motion.
  const drift = (a: number, b: number, amount: number): CSSProperties | undefined =>
    reduced ? undefined : { transform: `scale(${1 + clamp((vh - a) / (b - a)) * amount})` };

  // Layer i (grain, vignette, crop, weave) waits below the stage and rises over the
  // previous one when its chapter starts; the previous one drifts up a little slower.
  const layerStyle = (own: number): CSSProperties => {
    if (reduced) return { opacity: cd >= own ? 1 : 0 };
    const y = cd < own ? 100 : cd > own ? -14 : 0;
    return { transform: `translate3d(0, ${y}%, 0)` };
  };

  const weaveNow = weaveSteps[Math.min(fxStage, 3)];
  const flickerNow = flickerSteps[Math.max(0, fxStage - 3)];

  fxRef.current = { amp: weaveNow * (stage.h / 100) * 2, flick: flickerNow };
  const fxActive = cd >= CH.fx && !reduced && inView;
  useEffect(() => {
    if (!fxActive) {
      setJitter({ y: 0, b: 1 });
      return;
    }
    // Weave = the frame hops vertically every other frame (12 fps here);
    // flicker = exposure pulses. Both amounts follow the stage.
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
  // The frame around the presets opens and closes with a timed move.
  const framed = cd === CH.presets;
  const mediaInset: CSSProperties = {
    clipPath: framed ? 'inset(8% 9% 10% 9%)' : 'inset(0% 0% 0% 0%)',
  };

  const fxTitle = fxStage === 0 ? 'Weave · Flicker' : fxStage <= 3 ? 'Weave' : 'Flicker';
  const fxValue =
    fxStage === 0 ? t.off : fxStage <= 3 ? `Vertical ${weaveNow.toFixed(2)}` : `Amount ${flickerNow}%`;
  const fxSub = fxStage === 0 ? undefined : fxStage <= 3 ? t.weaveTag : `${t.flickerTag} · Weave ${weaveSteps[3].toFixed(2)}`;

  const atTop = vh < 24;

  // Straight to the information below the intro (no smooth scroll through the whole hook).
  const skipIntro = (e: React.MouseEvent) => {
    const target = document.getElementById('library');
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'instant' as ScrollBehavior });
    history.replaceState(null, '', '#library');
  };
  const ctaOn = cd >= CH.cta;

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

        <div className="si-media" style={mediaInset} aria-hidden="true">
          {/* Hero + presets: the same plane, each look laid over the previous one */}
          <div className="si-layer" style={reduced ? undefined : { transform: `translate3d(0, ${cd >= CH.grain ? -14 : 0}%, 0)` }}>
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
          <div className="si-layer si-up" style={layerStyle(CH.grain)}>
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
                style={{ backgroundImage: grainUri(gr.freq), opacity: i === grainNow ? gr.alpha * lerp(0.4, 1, Math.max(zoom * 0.7, g)) : 0 }}
              />
            ))}
          </div>

          {/* Vignette */}
          <div className="si-layer si-up" style={layerStyle(CH.vig)}>
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
          <div className="si-layer si-up" style={layerStyle(CH.bars)}>
            <img
              className="si-img"
              src="/intro-proto/m07_original.webp"
              alt=""
              draggable={false}
              style={drift(TH[CH.bars], TH[CH.fx], 0.05)}
              {...imgSize.wide}
              decoding="async"
            />
            <div className="si-bar" style={{ top: 0, left: 0, right: 0, height: `${bars.v * 100}%` }} />
            <div className="si-bar" style={{ bottom: 0, left: 0, right: 0, height: `${bars.v * 100}%` }} />
            <div className="si-bar" style={{ top: 0, bottom: 0, left: 0, width: `${bars.h * 100}%` }} />
            <div className="si-bar" style={{ top: 0, bottom: 0, right: 0, width: `${bars.h * 100}%` }} />
          </div>

          {/* Weave + flicker (and the closing backdrop) */}
          <div className="si-layer si-up si-dim" style={{ ...layerStyle(CH.fx), filter: ctaOn ? 'brightness(.45)' : undefined }}>
            <img
              className="si-img"
              src="/intro-proto/m05_original.webp"
              alt=""
              draggable={false}
              style={{
                transform: `translateY(${jitter.y}px) scale(1.04)`,
                filter: `brightness(${jitter.b})`,
              }}
              {...imgSize.wide}
              decoding="async"
            />
          </div>
        </div>

        {/* Opening title: pulled down out of the gate when the presets begin */}
        <div
          className="si-title"
          style={reduced ? { opacity: cd === CH.open ? 1 : 0, pointerEvents: cd === CH.open ? 'auto' : 'none' } : { transform: `translate3d(0, ${cd === CH.open ? 0 : 104}%, 0)`, pointerEvents: cd === CH.open ? 'auto' : 'none' }}
        >
          <p className="si-eyebrow">{t.eyebrow}</p>
          <h1 translate="no">GATE.24</h1>
          <div className="si-open-actions">
            <a className="si-btn" href={downloadHref} tabIndex={cd === CH.open ? 0 : -1}>
              {t.get}
            </a>
            <a className="si-btn si-btn-ghost" href="#library" onClick={skipIntro} tabIndex={cd === CH.open ? 0 : -1}>
              {t.skip}
            </a>
          </div>
        </div>
        <p
          className="si-hint"
          style={reduced ? { opacity: atTop && cd === CH.open ? 1 : 0 } : { transform: `translate3d(0, ${atTop && cd === CH.open ? 0 : 400}%, 0)` }}
        >
          {t.scroll} ↓
        </p>

        {/* One big, centred title per chapter */}
        <Center
          state={stateOf(CH.presets)}
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
          state={stateOf(CH.grain)}
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
          state={stateOf(CH.vig)}
          calm={reduced}
          tag={t.vignetteTag}
          title={t.vignette}
          sub={lang === 'es' ? `${t.inPlugin}: Vignette` : undefined}
          value={`${t.amount} ${Math.round(v * 100)}`}
        />
        <Center
          state={stateOf(CH.bars)}
          calm={reduced}
          tag={t.cropTag}
          title={t.crop}
          sub={lang === 'es' ? `${t.inPlugin}: Crop` : undefined}
          value={ratios[barStep].label}
          steps={ratios.length}
          active={barStep}
        />
        <Center
          state={stateOf(CH.fx)}
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
              <a className="si-btn" href={downloadHref} tabIndex={ctaOn ? 0 : -1}>
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

const EASE = 'cubic-bezier(.45,0,.2,1)';
const styles = `
.si { position: relative; background: #000; }
.si-stage {
  position: sticky; top: var(--si-top, 4rem);
  height: calc(100dvh - var(--si-top, 4rem));
  overflow: hidden; background: #000; color: #f5f5f3;
}
.si-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.si-media { position: absolute; inset: 0; overflow: hidden; background: #000; transition: clip-path 1.5s ${EASE}; }
.si-layer { position: absolute; inset: 0; transition: transform 1.5s ${EASE}, filter 1.2s ${EASE}; }
.si-up { box-shadow: 0 -40px 80px rgba(0,0,0,.55); }
.si-live .si-layer, .si-live .si-media { will-change: transform; }
.si-look { transition: transform 1.1s ${EASE}; }
.si-live .si-look { will-change: transform; }
.si-swapbox { display: grid; justify-items: center; }
.si-swapbox > * { grid-area: 1 / 1; }
.si-in { animation: si-in .62s cubic-bezier(.3,.1,.2,1) both; }
.si-out { animation: si-out .62s cubic-bezier(.3,.1,.2,1) both; }
@keyframes si-in { from { transform: translateY(-108%); } }
@keyframes si-out { to { transform: translateY(108%); } }
.si-m { display: block; overflow: hidden; padding: .06em .4em; margin: -.06em -.4em; }
.si-m-in { display: flow-root; transform: translate3d(0, -110%, 0); transition: transform .85s cubic-bezier(.3,.1,.2,1) var(--d, 0s); }
.si-center { visibility: hidden; transition: visibility 0s linear 1.1s; }
.si-center[data-s='on'] { visibility: visible; transition-delay: 0s; }
.si-center[data-s='on'] .si-m-in { transform: none; }
.si-center[data-s='after'] .si-m-in { transform: translate3d(0, 110%, 0); }
.si-live .si-m-in, .si-live .si-title, .si-live .si-cta, .si-live .si-hint { will-change: transform; }
.si-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; -webkit-user-drag: none; user-select: none; }
.si-grain { position: absolute; inset: 0; mix-blend-mode: overlay; background-size: 220px 220px; transition: opacity .9s ${EASE}; }
.si-vig { position: absolute; inset: 0; }
.si-bar { position: absolute; background: #000; transition: height .6s ${EASE}, width .6s ${EASE}; }
.si-title { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; padding: 1rem; pointer-events: none;
  background: linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,0) 40%, rgba(0,0,0,.5)); transition: transform 1.25s ${EASE}; }
.si-open-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; margin-top: 1.6rem; pointer-events: auto; }
.si-btn.si-btn-ghost { background: rgba(0,0,0,.35); color: #f5f5f3; border-color: rgba(245,245,243,.55); backdrop-filter: blur(6px); }
@media (hover: hover) and (pointer: fine) { a.si-btn.si-btn-ghost:hover { background: #f5f5f3; color: #0a0a0a; border-color: #f5f5f3; } }
.si-title h1 { font-family: var(--font-display, Georgia, serif); font-size: clamp(3rem, 12vw, 8rem); line-height: 1; margin: .4rem 0 0; letter-spacing: .01em; }
.si-eyebrow { font: 600 .8125rem/1 ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; color: rgba(245,245,243,.85); margin: 0; }
.si-hint { position: absolute; left: 0; right: 0; max-width: none; bottom: max(1.2rem, env(safe-area-inset-bottom)); text-align: center; font: 600 .8125rem ui-monospace, Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; margin: 0; color: rgba(245,245,243,.8); transition: transform .9s ${EASE}; }

.si-center { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: .5rem; padding: 1rem; text-align: center; pointer-events: none; isolation: isolate;
  text-shadow: 0 1px 2px rgba(0,0,0,.45), 0 0 28px rgba(0,0,0,.5); }
.si-tag { margin: 0; min-height: 1em; font: 600 .8125rem/1.2 ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .16em; text-transform: uppercase; color: rgba(245,245,243,.9); }
.si-big { margin: 0; font-family: var(--font-display, Georgia, serif); font-weight: 700; font-size: clamp(2.6rem, 9vw, 8rem); line-height: 1; letter-spacing: .005em; text-wrap: balance; }
.si-value { margin: .2rem 0 0; font: 600 clamp(1.5rem, 4.4vw, 3.6rem)/1.1 ui-monospace, 'Cascadia Mono', Consolas, monospace; font-variant-numeric: tabular-nums; letter-spacing: .04em; }
.si-sub { margin: 0; font: 500 clamp(.8125rem, 1.6vw, 1rem)/1.3 ui-monospace, Consolas, monospace; letter-spacing: .06em; color: rgba(245,245,243,.85); text-wrap: balance; }
.si-dots { list-style: none; display: flex; gap: .55rem; margin: 1.1rem 0 0; padding: 0; }
.si-dots li { width: .6rem; height: .6rem; border-radius: 50%; border: 1px solid rgba(245,245,243,.7); background: rgba(0,0,0,.25); transition: background-color .3s ease, transform .3s cubic-bezier(.22,1,.36,1); }
.si-dots li.done { background: rgba(245,245,243,.55); }
.si-dots li.on { background: #f5f5f3; transform: scale(1.35); }

.si-cta { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 1.2rem; padding: 1rem; text-align: center; transition: transform 1.3s ${EASE}; }
.si-cta h2 { font-family: var(--font-display, Georgia, serif); font-size: clamp(1.8rem, 5vw, 3rem); margin: 0; }
.si-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 18rem)); gap: 1rem; }
@media (max-width: 640px) { .si-cards { grid-template-columns: minmax(0, 20rem); } }
.si-card { border: 1px solid rgba(245,245,243,.3); background: rgba(10,10,10,.88); padding: 1.2rem; display: grid; gap: .5rem; justify-items: center; }
.si-card h3 { font-family: var(--font-display, Georgia, serif); margin: 0; font-size: 1.3rem; }
.si-card p { margin: 0; color: rgba(245,245,243,.78); font-size: .9rem; }
.si-btn, .si-top-btn { touch-action: manipulation; -webkit-tap-highlight-color: rgba(245,245,243,.2);
  transition: transform .14s cubic-bezier(.22,1,.36,1), background-color .18s ease, color .18s ease, border-color .18s ease; }
.si-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: .5rem 1.1rem; border: 1px solid #f5f5f3; background: #f5f5f3; color: #0a0a0a; font-weight: 600; font-size: .85rem; text-decoration: none; }
.si-btn-off { background: transparent; color: rgba(245,245,243,.6); border-color: rgba(245,245,243,.3); }
.si-top-btn { position: absolute; top: max(.8rem, env(safe-area-inset-top)); right: max(.8rem, env(safe-area-inset-right)); z-index: 3; display: inline-flex; align-items: center; min-height: 44px; padding: .4rem 1rem; border: 1px solid rgba(245,245,243,.5); background: rgba(0,0,0,.6); color: #f5f5f3; font-weight: 600; font-size: .8125rem; text-decoration: none; }
.si-btn:focus-visible, .si-top-btn:focus-visible { outline: 2px solid #f5f5f3; outline-offset: 3px; }
.si-btn:active, .si-top-btn:active { transform: scale(.97); }
@media (hover: hover) and (pointer: fine) {
  .si-top-btn:hover { background: #f5f5f3; color: #0a0a0a; }
  a.si-btn:hover { background: #fff; border-color: #fff; }
}
/* Calm mode (reduced motion): nothing slides, zooms or shakes. Chapters, looks and
   titles change with a short cross-dissolve instead. */
.si-calm .si-media, .si-calm .si-bar, .si-calm .si-dots li, .si-calm .si-btn, .si-calm .si-top-btn { transition: none; }
.si-calm .si-layer, .si-calm .si-look, .si-calm .si-title, .si-calm .si-cta, .si-calm .si-hint { transition: opacity .7s ease, filter .7s ease; }
/* Titles: the old one fades out first, then the new one fades in (never two at once). */
.si-calm .si-center { visibility: visible; opacity: 0; transition: opacity .35s ease; }
.si-calm .si-center[data-s='on'] { opacity: 1; transition: opacity .45s ease .35s; }
.si-calm .si-m-in { transform: none !important; transition: none; }
.si-calm .si-in, .si-calm .si-out { animation: none; }
.si-fadein { animation: si-fadein .6s ease both; }
@keyframes si-fadein { from { opacity: 0; } }
`;
