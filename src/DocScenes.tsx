// "Documentary" look — scene grammar inspired by the Motion Array "Cinematic Documentary" opener:
// monochrome plates in paper/ink split frames, giant cropped type drifting behind, vertical slice reveals,
// triple hairlines, small spaced labels in solid pills, film grain + flicker, end card with a block image
// and a wide wordmark. Same props, script, VO timing and brand colours as the classic look.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, random, Easing} from 'remotion';
import {C, rgba, HEAD, BODY, clamp, fade} from './LensParts';

type Pain = {signal: string; title: string; detail: string};
type Solution = {module: string; title: string; detail: string};
export type DocProps = {
  audience: string; segment: string; hook_eyebrow: string; hook_title: string; hook_sub: string;
  pains: Pain[]; solutions: Solution[];
  value?: {inputs?: string[]; outputs?: string[]; outcomes?: {k: string; t: string}[]};
  model_line?: [string, string]; benefits?: string[];
  vo?: {hook?: string; pains?: string; solutions?: string; value?: string};
};

/** Frame at which each sentence of a scene's voiceover starts (proportional to characters spoken).
 * Falls back to `fallback` fractions when the sentence count doesn't match. */
export const sentenceStarts = (text: string | undefined, dur: number, count: number, fallback: number[]) => {
  const parts = String(text || '').split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  const voFrames = Math.max(1, dur - 8);
  if (parts.length !== count) return fallback.map((x) => Math.round(dur * x));
  const total = parts.reduce((a, b) => a + b.length, 0);
  let acc = 0;
  return parts.map((x) => { const at = Math.round((acc / total) * voFrames); acc += x.length + 1; return at; });
};

export const PLEX = '"IBM Plex Mono", "JetBrains Mono", monospace';
export const INK = '#0A0A0B', PAPER = '#E8EBE9', INK60 = 'rgba(10,10,11,0.62)', INK40 = 'rgba(10,10,11,0.42)', INKLINE = 'rgba(10,10,11,0.16)';
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const ein = (f: number, s: number, d = 20) => interpolate(f, [s, s + d], [0, 1], {...clamp, easing: easeOut});
export const fit = (text: string, big: number, small: number, maxLen: number) =>
  Math.round(interpolate((text || '').length, [maxLen * 0.4, maxLen], [big, small], clamp));
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ---------------- texture: film grain, dust, flicker, vignette ----------------
export const FilmTexture: React.FC<{dark?: boolean}> = ({dark = true}) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 97;
  const flick = 0.03 * Math.sin(f * 1.7) + 0.02 * (random(`fl${Math.floor(f / 3)}`) - 0.5);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: dark ? 0.32 : 0.42}}>
        <filter id={`gr${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={1920} height={1080} filter={`url(#gr${seed})`} />
      </svg>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 7}, (_, i) => {
          const k = `${i}-${Math.floor(f / 4)}`;
          if (random(`d${k}`) < 0.45) return null;
          return <circle key={i} cx={random(`dx${k}`) * 1920} cy={random(`dy${k}`) * 1080} r={0.8 + random(`dr${k}`) * 1.8} fill={dark ? '#fff' : '#000'} opacity={0.35} />;
        })}
        {random(`sc${Math.floor(f / 5)}`) > 0.7 && <line x1={random(`sx${Math.floor(f / 5)}`) * 1920} y1={0} x2={random(`sx${Math.floor(f / 5)}`) * 1920 + 6} y2={1080} stroke={dark ? '#fff' : '#000'} strokeOpacity={0.08} strokeWidth={1} />}
      </svg>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) ${dark ? 55 : 70}%, rgba(0,0,0,${dark ? 0.38 : 0.12}) 100%)`}} />
      <AbsoluteFill style={{background: flick > 0 ? `rgba(255,255,255,${flick * 0.5})` : `rgba(0,0,0,${-flick})`}} />
    </AbsoluteFill>
  );
};

// ---------------- monochrome "plates" (graphics stand in for the template's media placeholders) ----------------
export type PlateKind = 'trails' | 'constellation' | 'waves' | 'globe' | 'bars';
export const PLATES: PlateKind[] = ['trails', 'globe', 'waves', 'constellation', 'bars'];
const PlateArt: React.FC<{kind: PlateKind; f: number; id: string}> = ({kind, f, id}) => {
  if (kind === 'trails') {
    return (
      <>
        <defs><radialGradient id={`h${id}`} cx="0.5" cy="0.62" r="0.55"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
        <rect width={1920} height={1080} fill={`url(#h${id})`} />
        {Array.from({length: 26}, (_, i) => {
          const side = i % 2 === 0 ? -1 : 1, VX = 960, VY = 620;
          const xEnd = VX + side * (120 + random(`ts${i}`) * 1250), bend = (random(`tb${i}`) - 0.5) * 300, len = 1500;
          const off = (f * (8 + random(`tv${i}`) * 14) + random(`to${i}`) * len * 2) % (len * 2);
          return <path key={i} d={`M ${VX + side * random(`ta${i}`) * 60} ${VY} Q ${VX + side * 200 + bend} ${VY + 220} ${xEnd} 1120`} fill="none" stroke="#fff"
            strokeOpacity={0.35 + 0.5 * random(`tw${i}`)} strokeWidth={2 + random(`tw${i}`) * 6} strokeLinecap="round" strokeDasharray={`${len * 0.45} ${len * 0.4}`} strokeDashoffset={-off} />;
        })}
      </>
    );
  }
  if (kind === 'waves') {
    return (
      <>
        {Array.from({length: 18}, (_, k) => {
          const amp = 30 + k * 10, ph = f / (24 + k * 3) + k * 0.6, y0 = 160 + k * 46;
          const d = Array.from({length: 49}, (_, i) => `${i === 0 ? 'M' : 'L'} ${i * 40} ${(y0 + Math.sin(i / 5 + ph) * amp * Math.sin((i / 48) * Math.PI)).toFixed(1)}`).join(' ');
          return <path key={k} d={d} fill="none" stroke="#fff" strokeWidth={k % 4 === 0 ? 3 : 1.4} opacity={0.3 + 0.14 * (k % 4)} />;
        })}
      </>
    );
  }
  if (kind === 'globe') {
    // halftone globe: dots on a slowly rotating sphere
    const rot = f / 160, R = 430, cx = 960, cy = 560, dots: React.ReactNode[] = [];
    for (let la = -80; la <= 80; la += 7) {
      const r = Math.cos((la * Math.PI) / 180), n = Math.max(6, Math.round(52 * r));
      for (let j = 0; j < n; j++) {
        const lo = (j / n) * Math.PI * 2 + rot, z = r * Math.cos(lo);
        if (z < -0.05) continue;
        const land = random(`g${la}_${j}`) > 0.45;
        dots.push(<circle key={`${la}_${j}`} cx={cx + R * r * Math.sin(lo)} cy={cy - R * Math.sin((la * Math.PI) / 180)} r={(land ? 4.6 : 2) * (0.5 + 0.5 * z)} fill="#fff" opacity={(land ? 0.85 : 0.3) * (0.35 + 0.65 * z)} />);
      }
    }
    return (
      <>
        <circle cx={cx} cy={cy} r={R + 30} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={1.5} />
        <ellipse cx={cx} cy={cy} rx={R + 160} ry={90} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={1.5} transform={`rotate(-14 ${cx} ${cy})`} />
        {dots}
      </>
    );
  }
  if (kind === 'bars') {
    return (
      <>
        {Array.from({length: 48}, (_, k) => {
          const h = 60 + 620 * Math.abs(Math.sin(k * 0.42 + f / 16)) * (0.35 + 0.65 * random(`b${k}`));
          return <rect key={k} x={40 + k * 39} y={900 - h} width={22} height={h} fill="#fff" opacity={0.25 + 0.6 * random(`bo${k}`)} />;
        })}
        <line x1={0} y1={904} x2={1920} y2={904} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
      </>
    );
  }
  // constellation
  const pts = Array.from({length: 38}, (_, i) => ({
    X: (((random(`cx${i}`) * 1920 + (random(`cvx${i}`) - 0.5) * 0.9 * f) % 1920) + 1920) % 1920,
    Y: (((random(`cy${i}`) * 1080 + (random(`cvy${i}`) - 0.5) * 0.7 * f) % 1080) + 1080) % 1080,
    r: 3 + random(`cr${i}`) * 5,
  }));
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].X - pts[j].X, pts[i].Y - pts[j].Y);
      if (d < 320) lines.push(<line key={`${i}-${j}`} x1={pts[i].X} y1={pts[i].Y} x2={pts[j].X} y2={pts[j].Y} stroke="#fff" strokeOpacity={(1 - d / 320) * 0.6} strokeWidth={1.5} />);
    }
  return <>{lines}{pts.map((p, i) => <circle key={i} cx={p.X} cy={p.Y} r={p.r} fill="#fff" opacity={0.85} />)}</>;
};

/** A framed monochrome plate with a slow push-in; `tint` washes it with the segment accent (duotone). */
export const Plate: React.FC<{kind: PlateKind; w: number; h: number; id: string; push?: number; tint?: number; bright?: number}> = ({kind, w, h, id, push = 0, tint = 0, bright = 1}) => {
  const f = useCurrentFrame();
  const s = 1.06 + 0.1 * push;
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#050505'}}>
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" width={w} height={h}
        style={{position: 'absolute', inset: 0, transform: `scale(${s}) translateX(${(push - 0.5) * -24}px)`, filter: `contrast(1.25) brightness(${bright})`}}>
        <rect width={1920} height={1080} fill="#060606" />
        <PlateArt kind={kind} f={f} id={id} />
      </svg>
      {tint > 0 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`, mixBlendMode: 'multiply', opacity: tint}} />}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)'}} />
    </div>
  );
};

/** Template-style reveal: the frame arrives as N vertical strips that slide in from alternating directions. */
export const SliceReveal: React.FC<{at: number; w: number; h: number; n?: number; children: React.ReactNode; out?: number}> = ({at, w, h, n = 4, children, out}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden'}}>
      {Array.from({length: n}, (_, i) => {
        const e = ein(f, at + i * 3, 22);
        const o = out !== undefined ? ein(f, out + (n - 1 - i) * 2, 14) : 0;
        const l = (i / n) * 100, r = 100 - ((i + 1) / n) * 100;
        const dir = i % 2 === 0 ? -1 : 1;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${r - 0.05}% 0 ${l - 0.05}%)`, transform: `translateY(${(1 - e) * dir * h + o * -dir * h}px)`}}>
            {children}
          </div>
        );
      })}
    </div>
  );
};

/** Giant cropped word drifting horizontally behind the content. */
export const BigWord: React.FC<{text: string; top: number; size?: number; outline?: boolean; color?: string; opacity?: number; speed?: number; x0?: number; spacing?: number}> =
  ({text, top, size = 400, outline = true, color = '#fff', opacity = 0.14, speed = 1.1, x0 = 80, spacing = 0.12}) => {
    const f = useCurrentFrame();
    return (
      <div style={{position: 'absolute', top, left: x0 - f * speed, whiteSpace: 'nowrap', fontFamily: HEAD, fontWeight: 700, fontSize: size, lineHeight: 0.8,
        letterSpacing: `${spacing}em`, textTransform: 'uppercase', color: outline ? 'transparent' : color, WebkitTextStroke: outline ? `2px ${color}` : undefined, opacity}}>
        {text}
      </div>
    );
  };

/** Triple hairlines (the template's recurring divider), growing from the centre. */
export const Hairlines: React.FC<{x: number; y: number; h: number; at?: number; color?: string; n?: number; gap?: number}> = ({x, y, h, at = 0, color = '#fff', n = 3, gap = 9}) => {
  const f = useCurrentFrame();
  const g = ein(f, at, 26);
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const hh = h * g * (1 - i * 0.12);
        return <div key={i} style={{position: 'absolute', left: x + i * gap, top: y + (h - hh) / 2, width: 1.5, height: hh, background: color, opacity: 0.75 - i * 0.15}} />;
      })}
    </>
  );
};

/** Small spaced label in a solid pill (the template's "AWESOME" chip). */
export const Pill: React.FC<{text: string; bg?: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({text, bg = INK, fg = '#fff', size = 20, style}) => (
  <span style={{display: 'inline-block', background: bg, color: fg, fontFamily: HEAD, fontWeight: 600, fontSize: size, letterSpacing: '0.32em', padding: `${size * 0.45}px ${size * 0.9}px ${size * 0.45}px ${size * 1.1}px`, textTransform: 'uppercase', ...style}}>{text}</span>
);

/** Brand chrome + scene label + dip-to-black transitions. */
export const DocScene: React.FC<{dur: number; children: React.ReactNode; tag?: string; paper?: boolean; noFadeIn?: boolean; noBrand?: boolean}> = ({dur, children, tag, paper, noFadeIn, noBrand}) => {
  const f = useCurrentFrame();
  const o = Math.min(noFadeIn ? 1 : fade(f, 0, 8), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  const ink = paper ? INK : '#fff', sub = paper ? INK40 : 'rgba(255,255,255,0.45)';
  return (
    <AbsoluteFill style={{opacity: o, background: paper ? PAPER : C.bg}}>
      {children}
      {tag && <div style={{position: 'absolute', top: 66, left: 120, fontFamily: PLEX, fontSize: 18, letterSpacing: 5, color: sub, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 26, height: 1.5, background: paper ? C.blue : C.cyan}} />{tag}</div>}
      {!noBrand && <div style={{position: 'absolute', top: 60, right: 120, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{fontFamily: HEAD, fontSize: 20, color: ink, fontWeight: 600, letterSpacing: 1}}>Cultural Lens</div>
        <div style={{width: 1.5, height: 18, background: sub}} />
        <div style={{fontFamily: PLEX, fontSize: 15, letterSpacing: 4, color: C.gold}}>RIYADAX9</div>
      </div>}
      <FilmTexture dark={!paper} />
    </AbsoluteFill>
  );
};

// ======================= 1 · HOOK (frame 0 is a finished cover) =======================
export const DocHook: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const kind: PlateKind = (['trails', 'globe', 'bars', 'waves'] as PlateKind[])[v % 4];
  const word = (p.hook_eyebrow || p.segment).split('+')[0].trim() || 'LENS';
  const mirror = v % 2 === 1;
  const plateX = mirror ? 1920 - 760 : 0;
  const textL = mirror ? 120 : 880;
  return (
    <DocScene dur={dur} paper noFadeIn noBrand>
      <BigWord text={`${word} · ${word} · ${word}`} top={300} size={440} color={INK} opacity={0.07} speed={1.3} x0={-40} />
      {/* block plate, half the frame, slowly drifting slices */}
      <div style={{position: 'absolute', left: plateX, top: 0, width: 760, height: 1080, display: 'flex'}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 760 / 3, height: 1080, overflow: 'hidden', borderRight: i < 2 ? '3px solid ' + PAPER : 'none'}}>
            <div style={{marginLeft: -(760 / 3) * i, marginTop: -30, transform: `translateY(${Math.sin(f / 40 + i) * 14 * (i === 1 ? -1 : 1)}px)`}}><Plate kind={kind} w={760} h={1140} id={`hk${i}`} push={f / Math.max(1, dur)} tint={0.32} /></div>
          </div>
        ))}
      </div>
      <Hairlines x={mirror ? 1920 - 820 : 790} y={180} h={720} color={INK} at={-30} />
      {/* top/bottom letterbox rules */}
      <div style={{position: 'absolute', left: textL, top: 64, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{fontFamily: HEAD, fontSize: 24, color: INK, fontWeight: 700, letterSpacing: 1}}>Cultural Lens</div>
        <div style={{width: 1.5, height: 20, background: INK40}} />
        <div style={{fontFamily: PLEX, fontSize: 17, letterSpacing: 4, color: '#9C7A2E'}}>BY RIYADAX9</div>
      </div>
      <div style={{position: 'absolute', left: textL, width: 920, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: PLEX, fontSize: 20, letterSpacing: 6, color: INK60, textTransform: 'uppercase'}}>{p.hook_eyebrow}</div>
        <div style={{width: interpolate(f, [0, 40], [140, 260], clamp), height: 3, background: C.blue, margin: '26px 0 30px'}} />
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: fit(p.hook_title, 84, 60, 80), lineHeight: 1.04, letterSpacing: -1, color: INK}}>{p.hook_title}</div>
        <div style={{fontFamily: BODY, fontSize: 30, lineHeight: 1.35, color: INK60, marginTop: 30, opacity: fade(f, Math.round(dur * 0.45))}}>{p.hook_sub}</div>
        <div style={{marginTop: 44}}><Pill text={`For ${p.audience}`} size={22} /></div>
      </div>
      <div style={{position: 'absolute', left: textL, bottom: 60, fontFamily: PLEX, fontSize: 15, letterSpacing: 5, color: INK40}}>A CULTURAL INTELLIGENCE BRIEF · {p.segment.toUpperCase()}</div>
    </DocScene>
  );
};

// ======================= 2 · PAINS — three chapters, pushed in one after another =======================
export const DocPains: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const starts = sentenceStarts(p.vo?.pains, dur, 4, [0, 0.12, 0.39, 0.66]).slice(1);
  const pains = p.pains.slice(0, 3);
  const introOut = ein(f, starts[0] - 6, 18);
  return (
    <DocScene dur={dur} tag={`THREE PRESSURES · ${p.segment.toUpperCase()}`}>
      {/* intro title card during the lead-in sentence */}
      <AbsoluteFill style={{opacity: 1 - introOut, justifyContent: 'center', alignItems: 'center'}}>
        <BigWord text="PRESSURE  PRESSURE" top={330} size={420} opacity={0.12} speed={2} x0={60} />
        <Hairlines x={950} y={260} h={560} at={0} />
        <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center'}}>
          <Pill text="The pressure" bg="#fff" fg={INK} size={24} />
          <div style={{fontFamily: HEAD, fontSize: 64, fontWeight: 700, color: '#fff', marginTop: 28, letterSpacing: -1}}>on {p.segment}</div>
        </div>
      </AbsoluteFill>
      {pains.map((x, i) => {
        const s = starts[i], next = i < 2 ? starts[i + 1] : dur + 40;
        const inE = ein(f, s, 22), outE = ein(f, next, 22);
        if (f < s - 2 || f > next + 24) return null;
        const kind = PLATES[(v + i + 1) % PLATES.length];
        const left = (i + v) % 2 === 0;
        const tx = (1 - inE) * 1920 - outE * 1920;
        return (
          <AbsoluteFill key={i} style={{transform: `translateX(${tx}px)`}}>
            <BigWord text={`${x.signal}  ·  ${x.signal}`} top={760} size={300} opacity={0.1} speed={2.4} x0={200} />
            <div style={{position: 'absolute', top: 190, left: left ? 120 : 1000}}>
              <SliceReveal at={s + 4} w={800} h={620} n={4}><Plate kind={kind} w={800} h={620} id={`pn${i}`} push={(f - s) / Math.max(1, next - s)} tint={0.18} /></SliceReveal>
              <div style={{position: 'absolute', top: -46, left: -10, fontFamily: HEAD, fontWeight: 700, fontSize: 190, lineHeight: 1, color: 'transparent', WebkitTextStroke: '2px #fff', opacity: 0.9}}>0{i + 1}</div>
            </div>
            <Hairlines x={left ? 960 : 930} y={230} h={540} at={s + 10} />
            <div style={{position: 'absolute', top: 260, left: left ? 1020 : 120, width: 780, background: PAPER, padding: '44px 48px 48px', opacity: ein(f, s + 12, 18), transform: `translateY(${(1 - ein(f, s + 12, 18)) * 30}px)`}}>
              <Pill text={x.signal} bg={C.blue} size={18} />
              <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: fit(x.title, 56, 42, 42), lineHeight: 1.06, color: INK, marginTop: 26, letterSpacing: -0.5}}>{x.title}</div>
              <div style={{width: 80, height: 2, background: INK, margin: '26px 0'}} />
              <div style={{fontFamily: BODY, fontSize: fit(x.detail, 29, 24, 140), lineHeight: 1.42, color: INK60}}>{x.detail}</div>
            </div>
          </AbsoluteFill>
        );
      })}
      {/* chapter index */}
      <div style={{position: 'absolute', bottom: 56, left: 120, display: 'flex', gap: 28, fontFamily: PLEX, fontSize: 16, letterSpacing: 4}}>
        {[0, 1, 2].map((i) => {
          const on = f >= starts[i];
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, color: on ? '#fff' : 'rgba(255,255,255,0.3)'}}>
            <div style={{width: on ? 46 : 18, height: 2, background: on ? C.cyan : 'rgba(255,255,255,0.3)'}} />0{i + 1}</div>;
        })}
      </div>
    </DocScene>
  );
};

// ======================= 3 · SOLUTIONS — three photo-strip columns on paper =======================
export const DocSolutions: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const at = sentenceStarts(p.vo?.solutions, dur, 4, [0, 0.1, 0.38, 0.66]).slice(1);
  const W = 520, G = 60, X0 = 120;
  return (
    <DocScene dur={dur} paper tag="WHAT CULTURAL LENS DOES">
      <BigWord text="ANSWERS · ANSWERS · ANSWERS" top={880} size={300} color={INK} opacity={0.06} speed={1.6} x0={-100} />
      <div style={{position: 'absolute', top: 128, left: 120, fontFamily: HEAD, fontSize: 56, fontWeight: 700, color: INK, letterSpacing: -1, opacity: fade(f, 2)}}>
        One lens. <span style={{color: C.blue}}>Three answers.</span>
      </div>
      {p.solutions.slice(0, 3).map((s, i) => {
        const x = X0 + i * (W + G);
        const on = f >= at[i];
        const kind = PLATES[(v + i + 2) % PLATES.length];
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 240, width: W}}>
            <div style={{position: 'relative', width: W, height: 330, outline: on ? 'none' : `1.5px solid ${INKLINE}`}}>
              {!on && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 120, color: 'transparent', WebkitTextStroke: `1.5px ${INKLINE}`}}>0{i + 1}</div>}
              <SliceReveal at={at[i]} w={W} h={330} n={3}><Plate kind={kind} w={W} h={330} id={`sl${i}`} push={(f - at[i]) / Math.max(1, dur)} tint={0.38} /></SliceReveal>
            </div>
            <div style={{marginTop: 26, opacity: ein(f, at[i] + 10, 16), transform: `translateY(${(1 - ein(f, at[i] + 10, 16)) * 24}px)`}}>
              <Pill text={s.module} size={16} />
              <div style={{fontFamily: HEAD, fontSize: fit(s.title, 38, 30, 42), fontWeight: 700, color: INK, marginTop: 20, lineHeight: 1.1, letterSpacing: -0.5}}>{s.title}</div>
              <div style={{fontFamily: BODY, fontSize: fit(s.detail, 24, 21, 140), color: INK60, marginTop: 14, lineHeight: 1.42}}>{s.detail}</div>
            </div>
            {i < 2 && <Hairlines x={W + 18} y={0} h={720} at={at[i + 1] - 10} color={INK} n={2} gap={8} />}
          </div>
        );
      })}
    </DocScene>
  );
};

// ======================= 4 · VALUE — signal → decision, as a contact sheet =======================
const DEF_IN = ['Video content', 'Scripts', 'Audience conversations', 'Industry signals'];
const DEF_OUT = ['Executive reports', 'Audience mapping', 'Forecasting', 'Decision support'];
const LAYER = ['Story', 'Audience', 'Character', 'Narrative', 'Cultural', 'Predictive'];
const DEF_OUTCOMES = [{k: 'Capacity', t: 'Read entire catalogues, not samples'}, {k: 'Deliverability', t: 'Decision-ready reports for every greenlight'}, {k: 'Profitability', t: 'Fewer misfires, stronger returns'}, {k: 'Scalability', t: 'From one market to many'}];
export const DocValue: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const ins = (p.value?.inputs?.length ? p.value.inputs : DEF_IN).slice(0, 4);
  const outs = (p.value?.outputs?.length ? p.value.outputs : DEF_OUT).slice(0, 4);
  const oc = p.value?.outcomes?.length === 4 ? p.value.outcomes : DEF_OUTCOMES;
  const s1 = 4, s2 = Math.round(dur * 0.18), s3 = Math.round(dur * 0.34), s4 = Math.round(dur * 0.55);
  const list = (title: string, items: string[], at: number, x: number, hi?: boolean) => (
    <div style={{position: 'absolute', left: x, top: 270, width: 470}}>
      <div style={{fontFamily: PLEX, fontSize: 15, letterSpacing: 4, color: hi ? C.cyan : 'rgba(255,255,255,0.45)', opacity: fade(f, at)}}>{title}</div>
      {items.map((t, i) => (
        <div key={t} style={{fontFamily: HEAD, fontSize: 30, fontWeight: 600, color: '#fff', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.14)', display: 'flex', gap: 18, alignItems: 'baseline',
          opacity: fade(f, at + 4 + i * 5), transform: `translateX(${(1 - ein(f, at + 4 + i * 5, 16)) * (hi ? 40 : -40)}px)`}}>
          <span style={{fontFamily: PLEX, fontSize: 14, color: hi ? C.cyan : 'rgba(255,255,255,0.4)'}}>0{i + 1}</span>{t}
        </div>
      ))}
    </div>
  );
  return (
    <DocScene dur={dur} tag={`WHAT YOU GET · ${p.segment.toUpperCase()}`}>
      <BigWord text="SIGNAL → DECISION → SIGNAL → DECISION" top={150} size={210} opacity={0.08} speed={2.2} x0={0} />
      <div style={{position: 'absolute', top: 140, left: 120, fontFamily: HEAD, fontSize: 54, fontWeight: 700, color: '#fff', letterSpacing: -1, opacity: fade(f, 0)}}>
        From raw signal to <span style={{color: C.cyan}}>decision support</span>
      </div>
      {list('STAGE 01 · INPUTS', ins, s1, 120)}
      {/* six intelligence layers as a 3×2 contact sheet of plates */}
      <div style={{position: 'absolute', left: 660, top: 270, width: 600}}>
        <div style={{fontFamily: PLEX, fontSize: 15, letterSpacing: 4, color: C.cyan, opacity: fade(f, s2)}}>STAGE 02 · AI ANALYSIS LAYER</div>
        <div style={{marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10}}>
          {LAYER.map((l, i) => {
            const at = s2 + 6 + i * 6, on = f >= at;
            return (
              <div key={l} style={{position: 'relative', height: 150, background: on ? PAPER : 'transparent', border: on ? 'none' : '1px solid rgba(255,255,255,0.16)', overflow: 'hidden',
                transform: `scale(${0.9 + 0.1 * ein(f, at, 12)})`}}>
                {on && <div style={{position: 'absolute', inset: 0}}><Plate kind={PLATES[(i + v) % PLATES.length]} w={193} h={150} id={`ly${i}`} tint={0.25} bright={1.5} /></div>}
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 12px', background: on ? INK : 'transparent', fontFamily: HEAD, fontWeight: 600, fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', color: on ? '#fff' : 'rgba(255,255,255,0.35)'}}>{l}</div>
              </div>
            );
          })}
        </div>
      </div>
      {list('STAGE 03 · OUTPUTS', outs, s3, 1330, true)}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {([[600, 655, s2], [1265, 1320, s3]] as const).map(([x1, x2, a], k) => f > a ? Array.from({length: 4}, (_, i) => {
          const t = ((f + i * 9) % 30) / 30;
          return <rect key={`${k}${i}`} x={x1 + (x2 - x1) * t} y={360 + i * 56} width={10} height={2} fill={C.cyan} opacity={1 - t * 0.5} />;
        }) : null)}
      </svg>
      {/* outcomes: paper index cards */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 770, display: 'flex', gap: 18}}>
        {oc.map((o, i) => {
          const a = s4 + i * 8;
          return (
            <div key={o.k} style={{flex: 1, background: PAPER, padding: '20px 24px 22px', opacity: fade(f, a), transform: `translateY(${(1 - ein(f, a, 16)) * 30}px) rotate(${(1 - ein(f, a, 16)) * (i % 2 ? 2 : -2)}deg)`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: PLEX, fontSize: 14, letterSpacing: 4, color: C.blue}}><span>{o.k.toUpperCase()}</span><span style={{color: INK40}}>0{i + 1}</span></div>
              <div style={{fontFamily: HEAD, fontSize: fit(o.t, 27, 22, 56), fontWeight: 700, color: INK, marginTop: 10, lineHeight: 1.18}}>{o.t}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 48, display: 'flex', gap: 46, fontFamily: PLEX, fontSize: 16, letterSpacing: 4, color: 'rgba(255,255,255,0.42)', opacity: fade(f, s4 + 30)}}>
        <span><span style={{color: '#fff'}}>10⁹+</span> STORIES ANALYZED</span><span><span style={{color: '#fff'}}>120+</span> SIGNAL SOURCES</span><span><span style={{color: '#fff'}}>48</span> CULTURAL MARKETS</span>
      </div>
    </DocScene>
  );
};

// ======================= 5 · MODEL — kinetic step titles, then benefits =======================
const STEPS = ['Analyze', 'Predict', 'Optimize', 'Produce', 'Measure'];
const BENEFITS = ['Reduced production risk', 'Higher audience retention', 'Stronger export potential', 'More effective marketing', 'Greater return on investment', 'Improved storytelling quality'];
export const DocModel: React.FC<{dur: number; line?: [string, string]; benefits?: string[]; v: number}> = ({dur, line, benefits, v}) => {
  const f = useCurrentFrame();
  const BEN = benefits && benefits.length >= 3 ? benefits.slice(0, 6) : BENEFITS;
  const phaseB = Math.round(dur * 0.4);
  const stepLen = phaseB / 5;
  const cur = Math.min(4, Math.floor(f / stepLen));
  const local = f - cur * stepLen;
  const aOut = ein(f, phaseB - 4, 16);
  return (
    <DocScene dur={dur} paper noBrand tag="THE NEW INTELLIGENCE MODEL">
      {/* phase A: one huge step word at a time, wiped in by slices */}
      <AbsoluteFill style={{opacity: 1 - aOut}}>
        <div style={{position: 'absolute', right: 0, top: 0, width: 620, height: 1080}}>
          <Plate kind={PLATES[(v + cur) % PLATES.length]} w={620} h={1080} id={`md${cur}`} push={local / stepLen} tint={0.3} />
        </div>
        <Hairlines x={1260} y={200} h={680} color={INK} at={0} />
        <div style={{position: 'absolute', left: 120, top: 330, width: 1160, overflow: 'hidden', height: 320}}>
          <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 250, lineHeight: 1.15, letterSpacing: '0.02em', textTransform: 'uppercase', color: INK, whiteSpace: 'nowrap',
            transform: `translateY(${(1 - ein(f, cur * stepLen, 12)) * 300}px) translateX(${-local * 0.8}px)`}}>{STEPS[cur]}</div>
        </div>
        <div style={{position: 'absolute', left: 124, top: 270, fontFamily: PLEX, fontSize: 20, letterSpacing: 6, color: INK60}}>STEP 0{cur + 1} / 05</div>
        <div style={{position: 'absolute', left: 124, top: 680, display: 'flex', gap: 12}}>
          {STEPS.map((s, i) => <div key={s} style={{width: i === cur ? 90 : 36, height: 4, background: i <= cur ? C.blue : INKLINE}} />)}
        </div>
      </AbsoluteFill>
      {/* phase B: the full loop, benefits and the from → to line */}
      <AbsoluteFill style={{opacity: aOut}}>
        <div style={{position: 'absolute', top: 150, left: 120, right: 120, display: 'flex', alignItems: 'center', gap: 22}}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{fontFamily: HEAD, fontSize: 40, fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: 2, opacity: fade(f, phaseB + i * 4)}}>{s}</div>
              {i < 4 && <div style={{flex: 1, height: 1.5, background: INK, opacity: 0.4 * fade(f, phaseB + i * 4)}} />}
            </React.Fragment>
          ))}
        </div>
        <div style={{position: 'absolute', top: 270, left: 120, right: 120, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 60}}>
          {BEN.map((b, i) => {
            const s = phaseB + 10 + i * 8;
            return (
              <div key={b} style={{display: 'flex', alignItems: 'baseline', gap: 18, padding: '22px 0', borderBottom: `1px solid ${INKLINE}`, opacity: fade(f, s), transform: `translateY(${(1 - ein(f, s, 16)) * 20}px)`}}>
                <span style={{fontFamily: PLEX, fontSize: 16, color: C.blue}}>0{i + 1}</span>
                <span style={{fontFamily: HEAD, fontSize: 32, fontWeight: 600, color: INK}}>{b}</span>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, height: 300, background: INK, overflow: 'hidden', clipPath: `inset(0 ${(1 - ein(f, dur * 0.7, 24)) * 100}% 0 0)`}}>
          <div style={{position: 'absolute', left: 0, top: 0, opacity: 0.55}}><Plate kind={PLATES[(v + 3) % PLATES.length]} w={1920} h={300} id="mdl" push={f / dur} tint={0.25} /></div>
          <div style={{position: 'absolute', left: 120, right: 120, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: HEAD, fontSize: 70, fontWeight: 700, color: '#fff', letterSpacing: -1}}>
            {line ? <>{line[0]}&nbsp;<span style={{color: C.cyan}}>→ {line[1]}</span></> : <>Regional stories&nbsp;<span style={{color: C.cyan}}>→ global trends.</span></>}
          </div>
        </div>
      </AbsoluteFill>
    </DocScene>
  );
};

// ======================= 6 · CLOSE — end card: block plate, hairlines, wide wordmark =======================
export const DocClose: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const wide = interpolate(f, [0, dur], [0.1, 0.22]);
  return (
    <DocScene dur={dur + 8} paper noBrand>
      <div style={{position: 'absolute', left: 0, top: 300, width: 600, height: 420}}>
        <SliceReveal at={0} w={600} h={420} n={4}><Plate kind={PLATES[(v + 1) % PLATES.length]} w={600} h={420} id="cl" push={f / dur} tint={0.35} /></SliceReveal>
      </div>
      <Hairlines x={650} y={240} h={600} color={INK} at={6} />
      <div style={{position: 'absolute', left: 740, right: 100, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: PLEX, fontSize: 22, letterSpacing: 8, color: INK60, opacity: fade(f, 2)}}>BUILT FOR {p.audience.toUpperCase()}</div>
        <div style={{fontFamily: HEAD, fontSize: 150, fontWeight: 700, lineHeight: 1, color: INK, letterSpacing: `${wide}em`, textTransform: 'uppercase', marginTop: 18, whiteSpace: 'nowrap', opacity: fade(f, 6)}}>Cultural</div>
        <div style={{fontFamily: HEAD, fontSize: 150, fontWeight: 700, lineHeight: 1, color: C.blue, letterSpacing: `${wide}em`, textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: fade(f, 12)}}>Lens</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 34, opacity: fade(f, 36)}}>
          <Pill text="Powered by RiyadaX9" bg={INK} fg={C.gold} size={18} />
          <div style={{fontFamily: HEAD, fontSize: 32, fontWeight: 600, color: INK}}>lens.communities.company</div>
        </div>
        <div style={{fontFamily: BODY, fontSize: 21, color: INK40, marginTop: 22, opacity: fade(f, 60)}}>AI analysis partners across the Middle East</div>
      </div>
      <div style={{position: 'absolute', left: 740, bottom: 56, fontFamily: PLEX, fontSize: 14, letterSpacing: 5, color: INK40, opacity: fade(f, 70)}}>{cap(p.segment).toUpperCase()} · CULTURAL INTELLIGENCE</div>
    </DocScene>
  );
};
