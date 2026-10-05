import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, random, Easing} from 'remotion';
import {C, GRAD, HEAD, BODY, clamp, fade, rise, GradText, Constellation, Grid, Scene, Benchmark, NewModel} from './LensParts';

export type Pain = {signal: string; title: string; detail: string};
export type Solution = {module: string; title: string; detail: string};
export type LeadProps = {
  audience: string; // e.g. "OTT platforms" — never a brand name
  segment: string;
  style: 'command' | 'constellation';
  hook_eyebrow: string;
  hook_title: string;
  hook_sub: string;
  pains: Pain[];
  solutions: Solution[];
  timing: Record<string, number>; // seconds of VO per scene (filled in by render.py)
};

export const FPS = 30;
export const SCENES = ['hook', 'pains', 'solutions', 'proof', 'model', 'close'] as const;
const LEAD = 0.4, GAP = 0.25, HOLD = 1.8;
export const timelineFor = (timing: Record<string, number>) => {
  let t = 0;
  return SCENES.map((k, i) => {
    const d = (i === 0 ? LEAD : 0) + (timing[k] ?? 6) + (i === SCENES.length - 1 ? HOLD : GAP);
    const from = Math.round(t * FPS), dur = Math.round(d * FPS);
    t += d;
    return {key: k, from, dur};
  });
};
export const totalFrames = (timing: Record<string, number>) => {
  const tl = timelineFor(timing);
  return tl[tl.length - 1].from + tl[tl.length - 1].dur;
};

const PLEX = '"IBM Plex Mono", "JetBrains Mono", monospace';
const fit = (text: string, big: number, small: number, maxLen: number) =>
  Math.round(interpolate(text.length, [maxLen * 0.4, maxLen], [big, small], clamp));

// ---------- Pixonal-inspired long-exposure light trails ----------
const LightTrails: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const f = useCurrentFrame();
  const VX = 960, VY = 600;
  const trails = Array.from({length: 30}, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const xEnd = VX + side * (100 + random(`s${i}`) * 1300);
    const warm = random(`c${i}`) > 0.5;
    const len = 1500, speed = 8 + random(`v${i}`) * 14;
    const bend = (random(`b${i}`) - 0.5) * 300;
    return {d: `M ${VX + side * random(`a${i}`) * 60} ${VY} Q ${VX + side * 200 + bend} ${VY + 220} ${xEnd} 1120`, warm,
      off: (f * speed + random(`o${i}`) * len * 2) % (len * 2), len, w: 2 + random(`w${i}`) * 5};
  });
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.95 * intensity}}>
      <defs>
        <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF4D4D" stopOpacity="0.1" /><stop offset="1" stopColor="#FF8A3D" /></linearGradient>
        <linearGradient id="cool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.cyan} stopOpacity="0.1" /><stop offset="1" stopColor={C.blue} /></linearGradient>
        <radialGradient id="horizon" cx="0.5" cy="0.55" r="0.5"><stop offset="0" stopColor="#3A5BFF" stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width={1920} height={1080} fill="url(#horizon)" />
      {trails.map((t, i) => (
        <path key={i} d={t.d} fill="none" stroke={`url(#${t.warm ? 'warm' : 'cool'})`} strokeWidth={t.w} strokeLinecap="round"
          strokeDasharray={`${t.len * 0.45} ${t.len * 0.4}`} strokeDashoffset={-t.off} filter="url(#glow)" opacity={0.85} />
      ))}
    </svg>
  );
};
const Backdrop: React.FC<{style: LeadProps['style']; intensity?: number}> = ({style, intensity = 1}) =>
  style === 'command' ? <LightTrails intensity={intensity} /> : <Constellation intensity={0.35 * intensity} labels />;

const Eyebrow: React.FC<{text: string; f: number; at?: number}> = ({text, f, at = 0}) => (
  <div style={{fontFamily: PLEX, fontSize: 20, letterSpacing: 4, color: C.w60, textTransform: 'uppercase', opacity: fade(f, at)}}>{text}</div>
);

// ================= HOOK (frame 0 = finished cover / thumbnail) =================
const Hook: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, dur], [1.0, 1.04]);
  return (
    <Scene dur={dur} noFadeIn noBrand>
      <AbsoluteFill style={{transform: `scale(${scale})`}}><Backdrop style={p.style} /></AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(8,8,8,0.55) 20%, rgba(8,8,8,0.9) 80%)'}} />
      <div style={{position: 'absolute', top: 64, left: 120, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 40, height: 40, borderRadius: 9, border: `1.5px solid ${C.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PLEX, fontSize: 16, color: C.cyan, fontWeight: 500}}>CI</div>
        <div style={{fontFamily: HEAD, fontSize: 24, color: C.white, fontWeight: 600}}>Cultural Lens <span style={{color: C.gold, fontFamily: PLEX, fontSize: 17, letterSpacing: 3, marginLeft: 8}}>BY RIYADAX9</span></div>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 180px'}}>
        <div style={{fontFamily: PLEX, fontSize: 20, letterSpacing: 4, color: C.w60, textTransform: 'uppercase'}}>{p.hook_eyebrow}</div>
        <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: fit(p.hook_title, 92, 64, 90), lineHeight: 1.08, color: C.white, marginTop: 28}}>
          {p.hook_title}
        </div>
        <div style={{fontFamily: BODY, fontSize: 32, color: C.w60, marginTop: 30, maxWidth: 1300, opacity: fade(f, Math.round(dur * 0.45))}}>{p.hook_sub}</div>
        <div style={{marginTop: 46, fontFamily: PLEX, fontSize: 26, letterSpacing: 5, padding: '12px 28px', border: '1.5px solid rgba(103,232,249,0.5)', borderRadius: 40}}>
          <span style={{color: C.w60}}>FOR </span><GradText>{p.audience.toUpperCase()}</GradText>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 70, display: 'flex', gap: 24}}>
        {['STORY', 'AUDIENCE', 'CHARACTER', 'INFLUENCE'].map((lbl, i) => {
          const v = 0.45 + 0.4 * Math.abs(Math.sin(f / 25 + i * 1.3));
          return (
            <div key={lbl} style={{flex: 1, background: 'rgba(16,18,21,0.85)', border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 18px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: PLEX, fontSize: 15, letterSpacing: 2, color: C.w60}}><span>{lbl}</span><span style={{color: C.cyan}}>{Math.round(v * 100)}</span></div>
              <div style={{height: 6, background: C.line, borderRadius: 3, marginTop: 10}}><div style={{width: `${v * 100}%`, height: '100%', background: GRAD, borderRadius: 3}} /></div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ================= PAINS =================
const Pains: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur} tag={`THE PAIN POINTS · ${p.segment.toUpperCase()}`}>
      <Backdrop style={p.style} intensity={0.35} />
      <div style={{position: 'absolute', top: 160, left: 120, right: 120, fontFamily: HEAD, fontSize: 60, fontWeight: 500, color: C.white, opacity: fade(f, 2)}}>
        What’s costing <GradText>{p.segment}</GradText> today
      </div>
      <div style={{position: 'absolute', top: 300, left: 120, right: 120, display: 'flex', gap: 28}}>
        {p.pains.slice(0, 3).map((x, i) => {
          const s = Math.round(dur * (0.12 + i * 0.27));
          const spark = Array.from({length: 12}, (_, k) => 60 - k * 3.5 - random(`p${i}${k}`) * 14);
          const drawn = interpolate(f, [s, s + 30], [0, 1], clamp);
          return (
            <div key={i} style={{flex: 1, background: '#111316', border: `1px solid ${C.line}`, borderRadius: 22, padding: '30px 34px', opacity: fade(f, s), transform: `translateY(${rise(f, s, 40)}px)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{width: 10, height: 10, borderRadius: 5, background: C.amber, boxShadow: `0 0 12px ${C.amber}`}} />
                <div style={{fontFamily: PLEX, fontSize: 17, letterSpacing: 3, color: C.amber}}>{x.signal.toUpperCase()}</div>
              </div>
              <svg width={360} height={80} style={{marginTop: 22}}>
                <polyline fill="none" stroke={C.amber} strokeWidth={3} strokeOpacity={0.8}
                  points={spark.slice(0, Math.max(2, Math.round(drawn * spark.length))).map((v, k) => `${k * 32},${v}`).join(' ')} />
              </svg>
              <div style={{fontFamily: HEAD, fontSize: fit(x.title, 40, 30, 60), fontWeight: 700, color: C.white, marginTop: 18, lineHeight: 1.15}}>{x.title}</div>
              <div style={{fontFamily: BODY, fontSize: fit(x.detail, 25, 21, 160), color: C.w60, marginTop: 16, lineHeight: 1.45}}>{x.detail}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ================= SOLUTIONS (command-room operating picture) =================
const Solutions: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
  const f = useCurrentFrame();
  const at = [0.1, 0.38, 0.66].map((x) => Math.round(dur * x));
  const active = at.filter((a) => f >= a).length;
  return (
    <Scene dur={dur} tag="WHAT CULTURAL LENS DOES">
      <Grid />
      <div style={{position: 'absolute', top: 150, left: 120, fontFamily: HEAD, fontSize: 58, fontWeight: 500, color: C.white, opacity: fade(f, 2)}}>
        One operating picture for <GradText>every story decision</GradText>
      </div>
      {/* left: module list */}
      <div style={{position: 'absolute', top: 270, left: 120, width: 900}}>
        {p.solutions.slice(0, 3).map((s, i) => (
          <div key={i} style={{padding: '22px 0', borderTop: `1px solid ${C.line}`, opacity: 0.25 + 0.75 * fade(f, at[i])}}>
            <div style={{fontFamily: PLEX, fontSize: 17, letterSpacing: 3, color: i < active ? C.cyan : C.w40}}>{s.module.toUpperCase()}</div>
            <div style={{fontFamily: HEAD, fontSize: fit(s.title, 40, 30, 60), fontWeight: 700, color: C.white, marginTop: 6}}>{s.title}</div>
            <div style={{fontFamily: BODY, fontSize: fit(s.detail, 25, 21, 160), color: C.w60, marginTop: 8, lineHeight: 1.4}}>{s.detail}</div>
          </div>
        ))}
      </div>
      {/* right: animated dashboard panel */}
      <div style={{position: 'absolute', top: 280, left: 1080, right: 120, height: 600, background: '#0E1013', border: `1px solid ${C.line}`, borderRadius: 22, padding: 28, opacity: fade(f, 6)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: PLEX, fontSize: 15, color: C.w40, letterSpacing: 2}}>
          <span>LENS · LIVE READ</span><span style={{color: C.cyan}}>● {String(Math.floor(f / 30) % 60).padStart(2, '0')}:{String(f % 30).padStart(2, '0')}</span>
        </div>
        {['STORY', 'AUDIENCE', 'INFLUENCE'].map((lbl, i) => {
          const v = interpolate(f, [at[i], at[i] + 40], [0.15, 0.55 + 0.4 * random(`g${i}`)], clamp);
          return (
            <div key={lbl} style={{marginTop: 34}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: PLEX, fontSize: 16, color: C.w60}}><span>{lbl} SIGNAL</span><span style={{color: C.white}}>{Math.round(v * 100)}</span></div>
              <div style={{height: 10, background: C.line, borderRadius: 5, marginTop: 10}}><div style={{width: `${v * 100}%`, height: '100%', background: GRAD, borderRadius: 5}} /></div>
            </div>
          );
        })}
        <svg width={560} height={170} style={{marginTop: 40}}>
          {Array.from({length: 28}, (_, k) => {
            const h = 20 + 130 * Math.abs(Math.sin(k * 0.5 + f / 18)) * (0.4 + 0.6 * random(`h${k}`));
            return <rect key={k} x={k * 20} y={170 - h} width={12} height={h} rx={3} fill={k % 7 === active * 2 ? C.cyan : 'rgba(103,232,249,0.35)'} />;
          })}
        </svg>
      </div>
    </Scene>
  );
};

// ================= CLOSE =================
const Close: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur + 8}>
      <Backdrop style={p.style} intensity={0.8} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(8,8,8,0.92) 30%, rgba(8,8,8,0.5) 85%)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: PLEX, fontSize: 24, letterSpacing: 6, color: C.w60, opacity: fade(f, 0)}}>BUILT FOR</div>
        <div style={{fontFamily: HEAD, fontSize: fit(p.audience, 110, 70, 34), fontWeight: 700, color: C.white, marginTop: 10, opacity: fade(f, 6), transform: `translateY(${rise(f, 6)}px)`}}>{p.audience.charAt(0).toUpperCase() + p.audience.slice(1)}</div>
        <div style={{width: interpolate(f, [20, 50], [0, 420], clamp), height: 2, background: GRAD, margin: '40px 0'}} />
        <div style={{fontFamily: HEAD, fontSize: 84, fontWeight: 700, letterSpacing: -2}}><GradText>Cultural Lens</GradText></div>
        <div style={{fontFamily: PLEX, fontSize: 24, letterSpacing: 6, color: C.gold, marginTop: 16, opacity: fade(f, 40)}}>POWERED BY RIYADAX9</div>
        <div style={{fontFamily: HEAD, fontSize: 34, color: C.white, marginTop: 36, opacity: fade(f, 55)}}>lens.communities.company</div>
        <div style={{fontFamily: BODY, fontSize: 22, color: C.w40, marginTop: 14, opacity: fade(f, 65)}}>AI analysis partners across the Middle East</div>
      </AbsoluteFill>
    </Scene>
  );
};

export const LeadVideo: React.FC<LeadProps> = (p) => {
  const f = useCurrentFrame();
  const tl = timelineFor(p.timing);
  const total = totalFrames(p.timing);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {tl.map((s) => (
        <Sequence key={s.key} from={s.from} durationInFrames={s.dur}>
          {s.key === 'hook' && <Hook dur={s.dur} p={p} />}
          {s.key === 'pains' && <Pains dur={s.dur} p={p} />}
          {s.key === 'solutions' && <Solutions dur={s.dur} p={p} />}
          {s.key === 'proof' && <Benchmark dur={s.dur} />}
          {s.key === 'model' && <NewModel dur={s.dur} />}
          {s.key === 'close' && <Close dur={s.dur} p={p} />}
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 3, width: `${(f / total) * 100}%`, background: GRAD}} />
    </AbsoluteFill>
  );
};
