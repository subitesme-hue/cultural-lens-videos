import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, random, Easing} from 'remotion';
import {C, grad, rgba, applyTheme, HEAD, BODY, clamp, fade, rise, GradText, Constellation, Grid, Scene, NewModel} from './LensParts';

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
  lead_id?: string;
  variant?: number; // layout variant; derived from lead_id when absent so consecutive videos differ
  value?: {inputs?: string[]; outputs?: string[]; outcomes?: {k: string; t: string}[]};
  model_line?: [string, string];
  benefits?: string[];
};

// ---------- per-segment colour themes (bg, fonts and RiyadaX9 gold stay constant) ----------
export const THEMES: Record<string, {a: string; b: string; pain?: string; horizon: string}> = {
  'OTT streaming': {a: '#8B5CF6', b: '#F0ABFC', horizon: '#6D28D9'},
  'broadcasting': {a: '#4F8CFF', b: '#67E8F9', horizon: '#3A5BFF'},
  'film & TV production': {a: '#10B981', b: '#A7F3D0', horizon: '#047857'},
  'kids content': {a: '#EC4899', b: '#FDBA74', pain: '#67E8F9', horizon: '#BE185D'},
  'animation': {a: '#EC4899', b: '#FDBA74', pain: '#67E8F9', horizon: '#BE185D'},
  'audience measurement': {a: '#6366F1', b: '#A5B4FC', horizon: '#4338CA'},
  'digital media': {a: '#F43F5E', b: '#FB923C', pain: '#67E8F9', horizon: '#BE123C'},
  'entertainment distribution': {a: '#0EA5E9', b: '#A3E635', horizon: '#0369A1'},
};
const themeFor = (seg: string) => THEMES[seg] || THEMES['broadcasting'];
const hashStr = (x: string) => { let h = 7; for (let i = 0; i < x.length; i++) h = (h * 31 + x.charCodeAt(i)) % 100003; return h; };
const variantOf = (p: LeadProps) => (typeof p.variant === 'number' ? p.variant : hashStr(p.lead_id || p.hook_title || 'x'));

export const FPS = 30;
export const SCENES = ['hook', 'pains', 'solutions', 'value', 'model', 'close'] as const;
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
const HORIZON = {c: '#3A5BFF'};
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
        <radialGradient id="horizon" cx="0.5" cy="0.55" r="0.5"><stop offset="0" stopColor={HORIZON.c} stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
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
// ---------- signal waves (third backdrop, keeps consecutive videos visually distinct) ----------
const SignalWaves: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: intensity}}>
      <defs><linearGradient id="wv" x1="0" x2="1"><stop offset="0" stopColor={C.blue} stopOpacity="0" /><stop offset="0.5" stopColor={C.cyan} /><stop offset="1" stopColor={C.blue} stopOpacity="0" /></linearGradient></defs>
      {Array.from({length: 14}, (_, k) => {
        const amp = 30 + k * 9, ph = f / (26 + k * 3) + k * 0.6, y0 = 300 + k * 38;
        const d = Array.from({length: 49}, (_, i) => `${i === 0 ? 'M' : 'L'} ${i * 40} ${(y0 + Math.sin(i / 5 + ph) * amp * Math.sin(i / 48 * Math.PI)).toFixed(1)}`).join(' ');
        return <path key={k} d={d} fill="none" stroke="url(#wv)" strokeWidth={k % 4 === 0 ? 2.4 : 1.1} opacity={0.34 + 0.12 * (k % 4)} />;
      })}
    </svg>
  );
};
const BG = {kind: 'command' as 'command' | 'constellation' | 'waves'};
const Backdrop: React.FC<{style: LeadProps['style']; intensity?: number}> = ({intensity = 1}) =>
  BG.kind === 'command' ? <LightTrails intensity={intensity} /> : BG.kind === 'waves' ? <SignalWaves intensity={intensity} /> : <Constellation intensity={0.35 * intensity} labels={intensity >= 0.8} />;

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
        <div style={{marginTop: 46, fontFamily: PLEX, fontSize: 26, letterSpacing: 5, padding: '12px 28px', border: `1.5px solid ${rgba(C.cyan, 0.5)}`, borderRadius: 40}}>
          <span style={{color: C.w60}}>FOR </span><GradText>{p.audience.toUpperCase()}</GradText>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 70, display: 'flex', gap: 24}}>
        {['STORY', 'AUDIENCE', 'CHARACTER', 'INFLUENCE'].map((lbl, i) => {
          const v = 0.45 + 0.4 * Math.abs(Math.sin(f / 25 + i * 1.3));
          return (
            <div key={lbl} style={{flex: 1, background: 'rgba(16,18,21,0.85)', border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 18px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: PLEX, fontSize: 15, letterSpacing: 2, color: C.w60}}><span>{lbl}</span><span style={{color: C.cyan}}>{Math.round(v * 100)}</span></div>
              <div style={{height: 6, background: C.line, borderRadius: 3, marginTop: 10}}><div style={{width: `${v * 100}%`, height: '100%', background: grad(), borderRadius: 3}} /></div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ================= PAINS =================
const PainsRows: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur} tag={`THE PAIN POINTS · ${p.segment.toUpperCase()}`}>
      <Backdrop style={p.style} intensity={0.3} />
      <div style={{position: 'absolute', top: 160, left: 120, right: 120, fontFamily: HEAD, fontSize: 60, fontWeight: 500, color: C.white, opacity: fade(f, 2)}}>
        Three pressures on <GradText>{p.segment}</GradText>
      </div>
      <div style={{position: 'absolute', top: 300, left: 120, right: 120}}>
        {p.pains.slice(0, 3).map((x, i) => {
          const s = Math.round(dur * (0.12 + i * 0.27));
          const m = interpolate(f, [s + 6, s + 40], [0, 0.62 + 0.3 * random(`m${i}`)], clamp);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 40, padding: '26px 0', borderTop: `1px solid ${C.line}`, opacity: fade(f, s), transform: `translateX(${(1 - fade(f, s)) * 50}px)`}}>
              <div style={{fontFamily: HEAD, fontSize: 96, fontWeight: 700, color: rgba(C.amber, 0.9), width: 130, lineHeight: 1}}>0{i + 1}</div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: PLEX, fontSize: 17, letterSpacing: 3, color: C.amber}}>{x.signal.toUpperCase()}</div>
                <div style={{fontFamily: HEAD, fontSize: fit(x.title, 44, 32, 60), fontWeight: 700, color: C.white, marginTop: 6}}>{x.title}</div>
                <div style={{fontFamily: BODY, fontSize: fit(x.detail, 26, 22, 160), color: C.w60, marginTop: 8, lineHeight: 1.4}}>{x.detail}</div>
              </div>
              <div style={{width: 420}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: PLEX, fontSize: 15, letterSpacing: 2, color: C.w40}}><span>EXPOSURE</span><span style={{color: C.amber}}>{m > 0.75 ? 'HIGH' : 'RISING'}</span></div>
                <div style={{height: 12, background: C.line, borderRadius: 6, marginTop: 10, overflow: 'hidden'}}>
                  <div style={{width: `${m * 100}%`, height: '100%', background: `linear-gradient(90deg, ${rgba(C.amber, 0.4)}, ${C.amber})`, borderRadius: 6}} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};
const PainsCards: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
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

// ================= SOLUTIONS =================
const SolutionsHub: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
  const f = useCurrentFrame();
  const at = [0.1, 0.38, 0.66].map((x) => Math.round(dur * x));
  const HX = 960, HY = 560;
  const pos = [{x: 430, y: 440}, {x: 960, y: 850}, {x: 1490, y: 440}];
  return (
    <Scene dur={dur} tag="WHAT CULTURAL LENS DOES">
      <Grid />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: HEAD, fontSize: 58, fontWeight: 500, color: C.white, opacity: fade(f, 2)}}>
        One engine. <GradText>Three answers.</GradText>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {pos.map((q, i) => {
          const g = interpolate(f, [at[i], at[i] + 24], [0, 1], clamp);
          const x2 = HX + (q.x - HX) * g, y2 = HY + (q.y - HY) * g;
          const t = ((f - at[i]) % 40) / 40;
          return (
            <g key={i}>
              <line x1={HX} y1={HY} x2={x2} y2={y2} stroke={C.cyan} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="8 10" strokeDashoffset={-f * 2} />
              {g >= 1 && <circle cx={HX + (q.x - HX) * t} cy={HY + (q.y - HY) * t} r={6} fill={C.cyan} />}
            </g>
          );
        })}
        <circle cx={HX} cy={HY} r={92 + 6 * Math.sin(f / 8)} fill={rgba(C.blue, 0.12)} stroke={C.cyan} strokeWidth={2} />
        <circle cx={HX} cy={HY} r={140 + 10 * Math.sin(f / 11)} fill="none" stroke={rgba(C.cyan, 0.25)} strokeWidth={1} />
        <text x={HX} y={HY - 6} textAnchor="middle" fill={C.white} fontFamily={HEAD} fontSize={30} fontWeight={700}>Cultural</text>
        <text x={HX} y={HY + 30} textAnchor="middle" fill={C.white} fontFamily={HEAD} fontSize={30} fontWeight={700}>Lens</text>
      </svg>
      {p.solutions.slice(0, 3).map((s, i) => {
        const q = pos[i];
        return (
          <div key={i} style={{position: 'absolute', left: q.x - 270, top: q.y - (i === 1 ? 10 : 150), width: 540, background: 'rgba(14,16,19,0.94)', border: `1px solid ${rgba(C.cyan, 0.35)}`, borderRadius: 18, padding: '20px 26px', opacity: fade(f, at[i] + 18), transform: `scale(${0.92 + 0.08 * fade(f, at[i] + 18)})`}}>
            <div style={{fontFamily: PLEX, fontSize: 16, letterSpacing: 3, color: C.cyan}}>{s.module.toUpperCase()}</div>
            <div style={{fontFamily: HEAD, fontSize: fit(s.title, 34, 27, 60), fontWeight: 700, color: C.white, marginTop: 6}}>{s.title}</div>
            <div style={{fontFamily: BODY, fontSize: fit(s.detail, 22, 19, 160), color: C.w60, marginTop: 6, lineHeight: 1.35}}>{s.detail}</div>
          </div>
        );
      })}
    </Scene>
  );
};
const SolutionsPanel: React.FC<{dur: number; p: LeadProps}> = ({dur, p}) => {
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
              <div style={{height: 10, background: C.line, borderRadius: 5, marginTop: 10}}><div style={{width: `${v * 100}%`, height: '100%', background: grad(), borderRadius: 5}} /></div>
            </div>
          );
        })}
        <svg width={560} height={170} style={{marginTop: 40}}>
          {Array.from({length: 28}, (_, k) => {
            const h = 20 + 130 * Math.abs(Math.sin(k * 0.5 + f / 18)) * (0.4 + 0.6 * random(`h${k}`));
            return <rect key={k} x={k * 20} y={170 - h} width={12} height={h} rx={3} fill={k % 7 === active * 2 ? C.cyan : rgba(C.cyan, 0.35)} />;
          })}
        </svg>
      </div>
    </Scene>
  );
};


// ================= VALUE: what Lens delivers (from the Lens site framework) =================
const DEF_IN = ['Video content', 'Scripts', 'Audience conversations', 'Industry signals'];
const DEF_OUT = ['Executive reports', 'Audience mapping', 'Forecasting', 'Decision support'];
const LAYER = ['Story', 'Audience', 'Character', 'Narrative', 'Cultural', 'Predictive'];
const DEF_OUTCOMES = [{k: 'Capacity', t: 'Read entire catalogues, not samples'}, {k: 'Deliverability', t: 'Decision-ready reports for every greenlight'}, {k: 'Profitability', t: 'Fewer misfires, stronger returns'}, {k: 'Scalability', t: 'From one market to many'}];
const Value: React.FC<{dur: number; p: LeadProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const ins = (p.value?.inputs?.length ? p.value.inputs : DEF_IN).slice(0, 4);
  const outs = (p.value?.outputs?.length ? p.value.outputs : DEF_OUT).slice(0, 4);
  const oc = (p.value?.outcomes?.length === 4 ? p.value.outcomes : DEF_OUTCOMES);
  const s1 = 4, s2 = Math.round(dur * 0.18), s3 = Math.round(dur * 0.34), s4 = Math.round(dur * 0.55);
  const col = (title: string, items: string[], at: number, x: number, hi?: boolean) => (
    <div style={{position: 'absolute', left: x, top: 270, width: 480, opacity: fade(f, at), transform: `translateY(${rise(f, at)}px)`}}>
      <div style={{fontFamily: PLEX, fontSize: 16, letterSpacing: 3, color: hi ? C.cyan : C.w40}}>{title}</div>
      <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
        {items.map((t, i) => (
          <div key={t} style={{fontFamily: BODY, fontSize: 25, color: C.white, background: hi ? rgba(C.blue, 0.1) : 'rgba(16,18,21,0.9)', border: `1px solid ${hi ? rgba(C.cyan, 0.35) : C.line}`, borderRadius: 12, padding: '12px 18px', opacity: fade(f, at + 4 + i * 5)}}>{t}</div>
        ))}
      </div>
    </div>
  );
  return (
    <Scene dur={dur} tag={`WHAT YOU GET · ${p.segment.toUpperCase()}`}>
      {v % 2 === 0 ? <Grid /> : <SignalWaves intensity={0.35} />}
      <div style={{position: 'absolute', top: 150, left: 120, right: 120, fontFamily: HEAD, fontSize: 56, fontWeight: 500, color: C.white, opacity: fade(f, 0)}}>
        From raw signal to <GradText>decision support</GradText>
      </div>
      {col('STAGE 01 · INPUTS', ins, s1, 120)}
      {/* AI analysis layer: six intelligence layers lighting up */}
      <div style={{position: 'absolute', left: 720, top: 270, width: 480, opacity: fade(f, s2)}}>
        <div style={{fontFamily: PLEX, fontSize: 16, letterSpacing: 3, color: C.cyan}}>STAGE 02 · AI ANALYSIS LAYER</div>
        <div style={{marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
          {LAYER.map((l, i) => {
            const on = f >= s2 + 6 + i * 6;
            return <div key={l} style={{fontFamily: HEAD, fontSize: 24, fontWeight: 600, textAlign: 'center', padding: '16px 0', borderRadius: 12, border: `1.5px solid ${on ? C.cyan : C.line}`, color: on ? C.white : C.w40, background: on ? rgba(C.blue, 0.16) : 'transparent', boxShadow: on ? `0 0 22px ${rgba(C.cyan, 0.25)}` : 'none'}}>{l}</div>;
          })}
        </div>
      </div>
      {col('STAGE 03 · OUTPUTS', outs, s3, 1320, true)}
      {/* flowing particles between stages */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {[[600, 720, s2], [1200, 1320, s3]].map(([x1, x2, at], k) => f > at ? Array.from({length: 4}, (_, i) => {
          const t = ((f + i * 9) % 36) / 36;
          return <circle key={`${k}${i}`} cx={x1 + (x2 - x1) * t} cy={420 + i * 40} r={4} fill={C.cyan} opacity={1 - t * 0.6} />;
        }) : null)}
      </svg>
      {/* business value */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 760, display: 'flex', gap: 20}}>
        {oc.map((o, i) => (
          <div key={o.k} style={{flex: 1, background: '#0E1013', border: `1px solid ${C.line}`, borderTop: `3px solid ${C.cyan}`, borderRadius: 14, padding: '18px 22px', opacity: fade(f, s4 + i * 8), transform: `translateY(${rise(f, s4 + i * 8)}px)`}}>
            <div style={{fontFamily: PLEX, fontSize: 15, letterSpacing: 3, color: C.cyan}}>{o.k.toUpperCase()}</div>
            <div style={{fontFamily: HEAD, fontSize: fit(o.t, 28, 22, 60), fontWeight: 600, color: C.white, marginTop: 8, lineHeight: 1.2}}>{o.t}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 44, display: 'flex', gap: 46, fontFamily: PLEX, fontSize: 17, letterSpacing: 3, color: C.w40, opacity: fade(f, s4 + 30)}}>
        <span><span style={{color: C.white}}>10⁹+</span> STORIES ANALYZED</span><span><span style={{color: C.white}}>120+</span> SIGNAL SOURCES</span><span><span style={{color: C.white}}>48</span> CULTURAL MARKETS</span>
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
        <div style={{width: interpolate(f, [20, 50], [0, 420], clamp), height: 2, background: grad(), margin: '40px 0'}} />
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
  const th = themeFor(p.segment);
  applyTheme(th); HORIZON.c = th.horizon;
  const v = variantOf(p);
  BG.kind = (['command', 'constellation', 'waves'] as const)[(v + (p.style === 'command' ? 0 : 1)) % 3];
  const tl = timelineFor(p.timing);
  const total = totalFrames(p.timing);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {tl.map((s) => (
        <Sequence key={s.key} from={s.from} durationInFrames={s.dur}>
          {s.key === 'hook' && <Hook dur={s.dur} p={p} />}
          {s.key === 'pains' && (v % 2 === 0 ? <PainsCards dur={s.dur} p={p} /> : <PainsRows dur={s.dur} p={p} />)}
          {s.key === 'solutions' && (Math.floor(v / 2) % 2 === 0 ? <SolutionsPanel dur={s.dur} p={p} /> : <SolutionsHub dur={s.dur} p={p} />)}
          {s.key === 'value' && <Value dur={s.dur} p={p} v={v} />}
          {s.key === 'model' && <NewModel dur={s.dur} line={p.model_line} benefits={p.benefits} />}
          {s.key === 'close' && <Close dur={s.dur} p={p} />}
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 3, width: `${(f / total) * 100}%`, background: grad()}} />
    </AbsoluteFill>
  );
};
