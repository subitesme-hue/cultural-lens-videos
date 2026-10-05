import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, Easing, random} from 'remotion';


// ---------- brand (from lens.communities.company) ----------
export const C = {
  bg: '#080808', panel: '#101215', line: 'rgba(255,255,255,0.10)',
  blue: '#4F8CFF', cyan: '#67E8F9', white: '#FFFFFF',
  w85: 'rgba(255,255,255,0.85)', w60: 'rgba(255,255,255,0.6)', w40: 'rgba(255,255,255,0.4)', w20: 'rgba(255,255,255,0.2)',
  amber: '#F2B84B', gold: '#D4AF5A', red: '#FF6B6B',
};
// accent colours are themed per market segment at render time (applyTheme); everything reads them live.
export const grad = () => `linear-gradient(90deg, ${C.blue}, ${C.cyan})`;
export const GRAD = grad(); // legacy default (brand blue → cyan)
export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};
export const applyTheme = (t: {a: string; b: string; pain?: string}) => {
  C.blue = t.a; C.cyan = t.b; if (t.pain) C.amber = t.pain;
};
export const HEAD = '"Space Grotesk", Inter, sans-serif';
export const BODY = 'Inter, sans-serif';
export const MONO = '"JetBrains Mono", monospace';

export const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const fade = (f: number, s: number, d = 12) => interpolate(f, [s, s + d], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
export const rise = (f: number, s: number, dist = 26) => (1 - fade(f, s, 16)) * dist;
export const GradText: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{background: grad(), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{children}</span>
);

// ---------- constellation (site header motif) ----------
const LABELS = ['STORY', 'EMOTIONS', 'CULTURE', 'NARRATIVES', 'BEHAVIOR', 'CHARACTER', 'AUDIENCE', 'INFLUENCE', 'SENTIMENT', 'CONVERSATION'];
const NODES = Array.from({length: 34}, (_, i) => ({
  x: random(`x${i}`) * 1920, y: random(`y${i}`) * 1080,
  vx: (random(`vx${i}`) - 0.5) * 0.5, vy: (random(`vy${i}`) - 0.5) * 0.4,
  r: 2 + random(`r${i}`) * 3, label: i < LABELS.length ? LABELS[i] : null,
}));
export const Constellation: React.FC<{intensity?: number; labels?: boolean; glow?: number}> = ({intensity = 0.5, labels = false, glow = 0}) => {
  const f = useCurrentFrame();
  const pts = NODES.map((n) => ({...n, X: ((n.x + n.vx * f) % 1920 + 1920) % 1920, Y: ((n.y + n.vy * f) % 1080 + 1080) % 1080}));
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].X - pts[j].X, pts[i].Y - pts[j].Y);
      if (d < 300) lines.push(<line key={`${i}-${j}`} x1={pts[i].X} y1={pts[i].Y} x2={pts[j].X} y2={pts[j].Y} stroke={glow > 0 ? C.cyan : '#9FB6D6'} strokeOpacity={(1 - d / 300) * intensity * (0.5 + glow)} strokeWidth={1} />);
    }
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {lines}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.X} cy={p.Y} r={p.r * (1 + glow * 0.6)} fill={C.white} opacity={0.55 * intensity + 0.3 + glow * 0.2} />
          {labels && p.label && <text x={p.X + 12} y={p.Y - 10} fill={glow > 0 ? C.cyan : C.w40} fontFamily={MONO} fontSize={17} letterSpacing={2}>{p.label}</text>}
        </g>
      ))}
    </svg>
  );
};

export const Grid: React.FC = () => (
  <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: '96px 96px', opacity: 0.35}} />
);

export const Scene: React.FC<{dur: number; children: React.ReactNode; tag?: string; noFadeIn?: boolean; noBrand?: boolean}> = ({dur, children, tag, noFadeIn, noBrand}) => {
  const f = useCurrentFrame();
  const o = Math.min(noFadeIn ? 1 : fade(f, 0, 8), interpolate(f, [dur - 8, dur], [1, 0], clamp));
  return (
    <AbsoluteFill style={{opacity: o}}>
      {tag && <div style={{position: 'absolute', top: 70, left: 120, fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: C.cyan, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 8, height: 8, borderRadius: 4, background: C.blue}} />{tag}</div>}
      {!noBrand && <div style={{position: 'absolute', top: 64, right: 120, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${C.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 14, color: C.cyan, fontWeight: 700}}>CI</div>
        <div style={{fontFamily: HEAD, fontSize: 20, color: C.white, fontWeight: 600}}>Cultural Lens <span style={{color: C.w40, fontWeight: 400, fontSize: 16, letterSpacing: 3, marginLeft: 6}}>· RIYADAX9</span></div>
      </div>}
      {children}
    </AbsoluteFill>
  );
};

// ================= 1 HOOK =================
const Hook: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [10, 75], [0, 982], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <Scene dur={dur}>
      <Constellation intensity={0.25} />
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 120, paddingRight: 120}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: C.w60, lineHeight: 1.6, opacity: fade(f, 0)}}>
          SHER · ARY DIGITAL, 2025 · SUM OF 40 EPISODES’ YOUTUBE VIEWS<br />
          <span style={{color: C.w40}}>EPISODE 1 ALONE: 63.4M VIEWS (5 OCT 2026)</span>
        </div>
        <div style={{fontFamily: HEAD, fontSize: 260, fontWeight: 700, lineHeight: 1, marginTop: 18, letterSpacing: -6}}><GradText>{n}M</GradText></div>
        <div style={{fontFamily: HEAD, fontSize: 70, color: C.white, marginTop: 40, fontWeight: 500, opacity: fade(f, 120), transform: `translateY(${rise(f, 120)}px)`}}>
          Millions of views. <span style={{color: C.w60}}>But what was</span> <GradText>the story?</GradText>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ================= 2 LENS (views -> influence) =================
const LensConvert: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [70, 130], [0, 1], clamp);
  return (
    <Scene dur={dur} tag="WHAT CULTURAL LENS DOES">
      <Constellation intensity={0.35 + g * 0.5} labels glow={g} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(8,8,8,0.92) 30%, rgba(8,8,8,0.35) 75%)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: HEAD, fontSize: 64, fontWeight: 700, color: C.white, marginBottom: 60, opacity: fade(f, 0), transform: `translateY(${rise(f, 0)}px)`}}>Cultural Lens converts</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 60}}>
          <div style={{opacity: fade(f, 4), transform: `translateY(${rise(f, 4)}px)`}}>
            <div style={{fontFamily: MONO, fontSize: 20, color: C.w40, letterSpacing: 3}}>CONVENTIONAL ANALYTICS</div>
            <div style={{fontFamily: HEAD, fontSize: 64, color: C.w60, marginTop: 10, textDecoration: g > 0.5 ? 'line-through' : 'none', textDecorationColor: C.w40}}>measure views</div>
          </div>
          <div style={{fontFamily: HEAD, fontSize: 80, color: C.cyan, opacity: fade(f, 40)}}>→</div>
          <div style={{opacity: fade(f, 55), transform: `translateY(${rise(f, 55)}px)`}}>
            <div style={{fontFamily: MONO, fontSize: 20, color: C.cyan, letterSpacing: 3}}>CULTURAL INTELLIGENCE</div>
            <div style={{fontFamily: HEAD, fontSize: 64, fontWeight: 700, marginTop: 10}}><GradText>measures influence</GradText></div>
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ================= 3 METHOD =================
const TRAD = ['Television ratings', 'Reach', 'Viewership', 'Advertising exposure'];
const MODERN = ['Audience demand', 'Emotional engagement', 'Story effectiveness', 'Character popularity', 'Social conversation', 'Script optimization', 'Predictive success forecasting'];
const Method: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const split = Math.round(dur * 0.38);
  return (
    <Scene dur={dur} tag="THE METHOD">
      <Grid />
      <div style={{position: 'absolute', top: 170, left: 120, right: 120, display: 'flex', gap: 80}}>
        <div style={{flex: 0.8, opacity: f > split ? 0.45 : 1, transition: 'none'}}>
          <div style={{fontFamily: MONO, fontSize: 20, color: C.w40, letterSpacing: 3}}>TRADITIONAL MEASUREMENT</div>
          <div style={{fontFamily: HEAD, fontSize: 46, color: C.w85, margin: '14px 0 30px'}}>Counts the audience</div>
          {TRAD.map((t, i) => (
            <div key={t} style={{fontFamily: BODY, fontSize: 34, color: C.w60, padding: '16px 0', borderTop: `1px solid ${C.line}`, opacity: fade(f, 8 + i * 9), display: 'flex', gap: 18, alignItems: 'center'}}>
              <div style={{width: 10, height: 10, background: C.w40}} />{t}
            </div>
          ))}
        </div>
        <div style={{flex: 1.2}}>
          <div style={{fontFamily: MONO, fontSize: 20, color: C.cyan, letterSpacing: 3, opacity: fade(f, split - 10)}}>MODERN ENTERTAINMENT INTELLIGENCE</div>
          <div style={{fontFamily: HEAD, fontSize: 46, color: C.white, margin: '14px 0 30px', opacity: fade(f, split - 6)}}><GradText>Reads the audience — and forecasts it</GradText></div>
          {MODERN.map((t, i) => {
            const s = split + i * 14;
            const bar = interpolate(f, [s, s + 30], [0, 0.45 + random(`m${i}`) * 0.55], clamp);
            return (
              <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '11px 0', borderTop: `1px solid ${C.line}`, opacity: fade(f, s), transform: `translateX(${(1 - fade(f, s)) * 30}px)`}}>
                <div style={{width: 10, height: 10, borderRadius: 5, background: C.cyan, boxShadow: `0 0 12px ${C.cyan}`}} />
                <div style={{fontFamily: BODY, fontSize: 31, color: C.white, width: 470}}>{t}</div>
                <div style={{flex: 1, height: 6, background: C.line, borderRadius: 3}}><div style={{width: `${bar * 100}%`, height: '100%', background: grad(), borderRadius: 3}} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

// ================= 4 TRANSFORM: SHER stats -> intelligence =================
const OLD = [['982M', 'total views'], ['24.5M', 'avg views / episode'], ['63.4M', 'Episode 1 views'], ['40', 'episodes']];
const NEW = [
  {v: '4:08', l: 'first spoken stake', note: 'Lens target for S2: < 0:15', c: C.amber},
  {v: '16%', l: 'of the opening is speech', note: 'music & image carry the story', c: C.cyan},
  {v: '1.7s', l: 'avg shot in the teaser', note: 'global-grade edit rhythm', c: C.cyan},
  {v: '~65s', l: 'single take, no cut', note: 'signature craft moment', c: C.cyan},
  {v: '18', l: 'human caption languages', note: 'export rails already exist', c: C.cyan},
  {v: '250–500', l: 'potential Shorts clips', note: 'pilot report estimate', c: C.w60},
];
const Transform: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const flip = Math.round(dur * 0.22);
  const scanX = interpolate(f, [flip - 20, flip + 10], [-10, 110], clamp);
  return (
    <Scene dur={dur} tag="SHER · FROM VIEWS TO INTELLIGENCE">
      <Grid />
      <div style={{position: 'absolute', top: 160, left: 120, right: 120}}>
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.w40, display: 'flex', gap: 30, alignItems: 'center'}}>
          <span>CONVENTIONAL REPORT</span>
          <div style={{flex: 1, height: 1, background: C.line}} />
        </div>
        <div style={{display: 'flex', gap: 24, marginTop: 20, position: 'relative'}}>
          {OLD.map(([v, l], i) => (
            <div key={l} style={{flex: 1, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: '22px 28px', opacity: fade(f, 4 + i * 6) * (f > flip ? 0.45 : 1)}}>
              <div style={{fontFamily: HEAD, fontSize: 60, color: C.w85, fontWeight: 700}}>{v}</div>
              <div style={{fontFamily: BODY, fontSize: 22, color: C.w40}}>{l}</div>
            </div>
          ))}
          <div style={{position: 'absolute', top: -10, bottom: -10, left: `${scanX}%`, width: 4, background: C.cyan, boxShadow: `0 0 30px ${C.cyan}`, opacity: scanX > 0 && scanX < 100 ? 1 : 0}} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.cyan, display: 'flex', gap: 30, alignItems: 'center', marginTop: 50, opacity: fade(f, flip)}}>
          <span>CULTURAL LENS READING · MEASURED FROM EPISODE 1</span>
          <div style={{flex: 1, height: 1, background: rgba(C.cyan, 0.3)}} />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 20}}>
          {NEW.map((n, i) => {
            const s = flip + 12 + i * 22;
            return (
              <div key={n.l} style={{background: rgba(C.blue, 0.06), border: `1px solid ${i === 0 ? 'rgba(242,184,75,0.5)' : rgba(C.cyan, 0.25)}`, borderRadius: 14, padding: '20px 26px', opacity: fade(f, s), transform: `scale(${0.94 + 0.06 * fade(f, s)})`}}>
                <div style={{fontFamily: HEAD, fontSize: 58, fontWeight: 700, color: n.c}}>{n.v}</div>
                <div style={{fontFamily: BODY, fontSize: 24, color: C.white}}>{n.l}</div>
                <div style={{fontFamily: MONO, fontSize: 16, color: C.w40, marginTop: 6, letterSpacing: 1}}>{n.note.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 40, left: 120, fontFamily: MONO, fontSize: 15, color: C.w40}}>Measured 5 Oct 2026 from ARY Digital’s official upload: frames sampled every 0.4s, official caption track. Shorts estimate from the RiyadaX9 pilot report.</div>
    </Scene>
  );
};

// ================= 4b BENCHMARK (regional + international) =================
export const BM = [
  {name: 'SHER', place: 'Pakistan', src: 'ARY Digital · Ep 1 opening', lon: 69, lat: 30, shot: 3.7, stakeSec: 248, stake: 'said 4:08', c: '#F2B84B', scope: 'HOME'},
  {name: 'Diriliş: Ertuğrul', place: 'Türkiye', src: 'TRT · Ep 1 opening', lon: 33, lat: 40, shot: 12.0, stakeSec: 240, stake: 'said ~4:00', c: '#9DB8E8', scope: 'REGIONAL'},
  {name: 'Ali Clay', place: 'Egypt · MENA', src: 'Viu MENA · official Ep 1 clip', lon: 31, lat: 27, shot: 4.6, stakeSec: 2, stake: 'first line', c: '#E8946B', scope: 'REGIONAL'},
  {name: 'Squid Game', place: 'South Korea', src: 'Netflix · official viral scene', lon: 127, lat: 37, shot: 2.9, stakeSec: 13, stake: '0:13', c: '#5FD3B0', scope: 'INTERNATIONAL'},
];
const HUB = {lon: 55, lat: 25};
export const Benchmark: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const MW = 700, MH = 430;
  const px = (lon: number) => ((lon - 20) / 118) * MW;
  const py = (lat: number) => ((50 - lat) / 34) * MH;
  // reveal order follows the narration: Sher context, Ertugrul, Ali Clay, Squid Game
  const at = [0.05, 0.2, 0.42, 0.6].map((p) => Math.round(dur * p));
  const verdict = Math.round(dur * 0.8);
  const dots = Array.from({length: 140}, (_, i) => ({x: random(`mx${i}`) * MW, y: random(`my${i}`) * MH}));
  return (
    <Scene dur={dur} tag="GLOBAL BENCHMARK · REGIONAL & INTERNATIONAL">
      <Grid />
      {/* map panel */}
      <div style={{position: 'absolute', left: 120, top: 180, width: MW, height: MH, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden'}}>
        <svg width={MW} height={MH}>
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={1.4} fill={C.w20} />)}
          {BM.map((b, i) => {
            const p = fade(f, at[i], 20);
            const x1 = px(HUB.lon), y1 = py(HUB.lat), x2 = px(b.lon), y2 = py(b.lat);
            const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 60;
            const len = 600;
            return (
              <g key={b.name}>
                <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={b.c} strokeWidth={2} strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={0.8} />
                <circle cx={x2} cy={y2} r={7 + 8 * p * (0.5 + 0.5 * Math.sin(f / 6))} fill={b.c} opacity={0.18 * p} />
                <circle cx={x2} cy={y2} r={7} fill={b.c} opacity={p} />
                <text x={x2 + (b.lon > 100 ? -14 : b.place.startsWith('Egypt') ? -20 : 14)} y={y2 + (b.place.startsWith('Egypt') ? 34 : -12)} textAnchor={b.lon > 100 ? 'end' : 'start'} fill={C.white} fontFamily={HEAD} fontSize={22} opacity={p}>{b.place}</text>
              </g>
            );
          })}
          <circle cx={px(HUB.lon)} cy={py(HUB.lat)} r={9} fill={C.gold} />
          <text x={px(HUB.lon) + 14} y={py(HUB.lat) + 30} fill={C.gold} fontFamily={MONO} fontSize={15} letterSpacing={2}>DUBAI · RIYADAX9 LENS</text>
        </svg>
      </div>
      <div style={{position: 'absolute', left: 120, top: 630, width: MW, fontFamily: MONO, fontSize: 16, color: C.w40, letterSpacing: 2}}>
        ONE METHOD · EVERY MARKET · SAME 3-MINUTE READ
      </div>
      {/* metrics */}
      <div style={{position: 'absolute', left: 880, right: 120, top: 180}}>
        <div style={{display: 'flex', fontFamily: MONO, fontSize: 16, color: C.w40, letterSpacing: 2, marginBottom: 10}}>
          <div style={{width: 330}}>TITLE</div><div style={{flex: 1}}>AVG SHOT</div><div style={{flex: 1}}>STAKE STATED</div>
        </div>
        {BM.map((b, i) => {
          const p = spring({frame: f - at[i], fps: 30, config: {damping: 200}});
          return (
            <div key={b.name} style={{display: 'flex', alignItems: 'center', padding: '16px 0', borderTop: `1px solid ${C.line}`, opacity: 0.15 + 0.85 * fade(f, at[i])}}>
              <div style={{width: 330}}>
                <div style={{fontFamily: MONO, fontSize: 13, color: b.c, letterSpacing: 2}}>{b.scope}</div>
                <div style={{fontFamily: HEAD, fontSize: 32, fontWeight: 700, color: C.white}}>{b.name}</div>
                <div style={{fontFamily: BODY, fontSize: 17, color: C.w40}}>{b.src}</div>
              </div>
              <div style={{flex: 1, paddingRight: 24}}>
                <div style={{height: 14, background: C.line, borderRadius: 7}}><div style={{width: `${(b.shot / 12) * 100 * p}%`, height: '100%', background: b.c, borderRadius: 7}} /></div>
                <div style={{fontFamily: HEAD, fontSize: 26, color: C.white, marginTop: 6}}>{b.shot.toFixed(1)}s</div>
              </div>
              <div style={{flex: 1}}>
                <div style={{height: 14, background: C.line, borderRadius: 7}}><div style={{width: `${Math.max(3, (b.stakeSec / 250) * 100) * p}%`, height: '100%', background: b.c, borderRadius: 7}} /></div>
                <div style={{fontFamily: HEAD, fontSize: 26, color: C.white, marginTop: 6}}>{b.stake}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 700, fontFamily: HEAD, fontSize: 64, fontWeight: 700, color: C.white, opacity: fade(f, verdict), transform: `translateY(${rise(f, verdict)}px)`}}>
        Sher’s gap is not pace — <GradText>it’s the promise.</GradText>
      </div>
      <div style={{position: 'absolute', bottom: 40, left: 120, right: 120, fontFamily: MONO, fontSize: 15, color: C.w40}}>Measured 5 Oct 2026 from official YouTube uploads (ARY Digital, Diriliş Ertuğrul/TRT, Viu MENA, Netflix India). Ali Clay & Squid Game are official scene clips, not episode openings. Map is schematic.</div>
    </Scene>
  );
};

// ================= 5 WHAT IS =================
const LESSONS = [['Relationships', 'over plot'], ['Payoffs', 'over exposition'], ['Characters', 'sell the show'], ['Chemistry', 'is the hook'], ['End on a feeling', 'every episode']];
const WhatIs: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur} tag="WHAT IS · WHY SHER WORKED">
      <Constellation intensity={0.2} />
      <div style={{position: 'absolute', top: 200, left: 120, right: 120}}>
        {LESSONS.map(([a, b], i) => {
          const s = Math.round(dur * 0.14) + i * Math.round(dur * 0.15);
          const active = f >= s;
          return (
            <div key={a} style={{display: 'flex', alignItems: 'baseline', gap: 36, padding: '18px 0', borderTop: `1px solid ${C.line}`, opacity: fade(f, s) * 0.9 + 0.1}}>
              <div style={{fontFamily: MONO, fontSize: 24, color: active ? C.cyan : C.w20, width: 60}}>0{i + 1}</div>
              <div style={{fontFamily: HEAD, fontSize: 76, fontWeight: 700, color: active ? C.white : C.w20, transform: `translateX(${rise(f, s, 40)}px)`}}>{a}</div>
              <div style={{fontFamily: HEAD, fontSize: 56, fontWeight: 400}}>{active ? <GradText>{b}</GradText> : <span style={{color: C.w20}}>{b}</span>}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ================= 6 TRADITIONAL (deliberately sub-standard edit) =================
const STEPS_OLD = ['Write', 'Produce', 'Broadcast', 'Measure'];
const Traditional: React.FC<{dur: number}> = ({dur}) => {
  const raw = useCurrentFrame();
  const f = Math.floor(raw / 5) * 5; // choppy 6fps motion
  const jitterX = (random(`jx${f}`) - 0.5) * 14, jitterY = (random(`jy${f}`) - 0.5) * 8;
  const dropout = random(`d${Math.floor(raw / 3)}`) > 0.93; // dropped frames
  const reach = interpolate(f, [dur * 0.5, dur * 0.75], [0, 1], clamp);
  return (
    <Scene dur={dur} tag="THE TRADITIONAL METHOD">
      <AbsoluteFill style={{filter: 'grayscale(1) contrast(0.85) brightness(0.9)', transform: `translate(${jitterX}px, ${jitterY}px)`, opacity: dropout ? 0.25 : 1}}>
        <div style={{position: 'absolute', top: 230, left: 120, right: 120, display: 'flex', alignItems: 'center', gap: 28}}>
          {STEPS_OLD.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{fontFamily: HEAD, fontSize: 70, fontWeight: 700, color: C.w85, opacity: f >= 6 + i * 20 ? 1 : 0, border: `2px dashed ${C.w40}`, padding: '14px 30px', transform: `rotate(${(random(`rot${i}`) - 0.5) * 3}deg)`}}>{s}</div>
              {i < 3 && <div style={{fontFamily: HEAD, fontSize: 56, color: C.w40, opacity: f >= 16 + i * 20 ? 1 : 0}}>→</div>}
            </React.Fragment>
          ))}
        </div>
        <div style={{position: 'absolute', top: 420, left: 120, fontFamily: MONO, fontSize: 22, color: C.w60, letterSpacing: 2}}>
          {f > dur * 0.3 ? '■ INVESTING BLIND' : ''}{f > dur * 0.42 ? '   ■ MEASURED ONLY AFTER BROADCAST' : ''}
        </div>
        {/* stalled progress bar */}
        <div style={{position: 'absolute', top: 480, left: 120, width: 760, height: 10, background: C.line}}>
          <div style={{width: `${Math.min(38, f / 2)}%`, height: '100%', background: C.w60}} />
        </div>
      </AbsoluteFill>
      {/* audience reach: small lit slice vs the world (illustrative, not data) */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform="translate(1420,760)">
          <circle r={210} fill="none" stroke={C.line} strokeWidth={26} />
          <circle r={210} fill="none" stroke={C.w60} strokeWidth={26} strokeDasharray={`${2 * Math.PI * 210 * 0.12} 2000`} transform="rotate(-90)" />
          <circle r={210} fill="none" stroke="url(#gg)" strokeWidth={26} strokeDasharray={`${2 * Math.PI * 210 * 0.88 * reach} 2000`} transform={`rotate(${-90 + 0.12 * 360})`} />
          <defs><linearGradient id="gg"><stop offset="0" stopColor={C.blue} /><stop offset="1" stopColor={C.cyan} /></linearGradient></defs>
          <text textAnchor="middle" y={-6} fill={C.w85} fontFamily={HEAD} fontSize={30}>served today</text>
          <text textAnchor="middle" y={34} fill={C.cyan} fontFamily={HEAD} fontSize={30} opacity={reach}>vs. the reachable world</text>
        </g>
      </svg>
      <div style={{position: 'absolute', top: 640, left: 120, width: 980, fontFamily: HEAD, fontSize: 52, color: C.white, lineHeight: 1.2, opacity: fade(raw, dur * 0.55)}}>
        Built for one channel’s audience — while stories can now <GradText>cross every border.</GradText>
      </div>
      <div style={{position: 'absolute', bottom: 40, left: 120, fontFamily: MONO, fontSize: 15, color: C.w40}}>Ring is illustrative, not measured data.</div>
    </Scene>
  );
};

// ================= 7 NEW MODEL =================
const STEPS_NEW = ['Analyze', 'Predict', 'Optimize', 'Produce', 'Measure'];
const BENEFITS = ['Reduced production risk', 'Higher audience retention', 'Stronger export potential', 'More effective marketing', 'Greater return on investment', 'Improved storytelling quality'];
export const NewModel: React.FC<{dur: number; line?: [string, string]; benefits?: string[]}> = ({dur, line, benefits}) => {
  const BEN = benefits && benefits.length >= 3 ? benefits.slice(0, 6) : BENEFITS;
  const f = useCurrentFrame();
  const active = Math.floor(interpolate(f, [8, dur * 0.4], [0, 5], clamp));
  return (
    <Scene dur={dur} tag="THE LENS READS · NEW INTELLIGENCE MODEL">
      <Constellation intensity={0.3} glow={0.3} />
      <div style={{position: 'absolute', top: 190, left: 120, right: 120, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {STEPS_NEW.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{fontFamily: HEAD, fontSize: 52, fontWeight: 700, padding: '16px 30px', borderRadius: 16, border: `1.5px solid ${i < active ? C.cyan : C.line}`, background: i < active ? rgba(C.blue, 0.12) : 'transparent', color: i < active ? C.white : C.w20, boxShadow: i === active - 1 ? `0 0 40px ${rgba(C.cyan, 0.35)}` : 'none'}}>{s}</div>
            {i < 4 && <div style={{flex: 1, height: 2, margin: '0 12px', background: i < active - 1 ? grad() : C.line}} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{position: 'absolute', top: 380, left: 120, right: 120, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22}}>
        {BEN.map((b, i) => {
          const s = Math.round(dur * 0.38) + i * 9;
          return (
            <div key={b} style={{background: C.panel, border: `1px solid ${rgba(C.cyan, 0.25)}`, borderRadius: 14, padding: '24px 28px', fontFamily: BODY, fontSize: 30, color: C.white, opacity: fade(f, s), transform: `translateY(${rise(f, s)}px)`, display: 'flex', gap: 16, alignItems: 'center'}}>
              <div style={{width: 12, height: 12, borderRadius: 6, background: C.cyan, boxShadow: `0 0 14px ${C.cyan}`}} />{b}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 760, left: 120, right: 120, fontFamily: HEAD, fontSize: 72, fontWeight: 700, color: C.white, opacity: fade(f, dur * 0.72), transform: `translateY(${rise(f, dur * 0.72)}px)`}}>
        {line ? <>{line[0]} → <GradText>{line[1]}</GradText></> : <>National broadcast dramas → <GradText>global trends.</GradText></>}
      </div>
    </Scene>
  );
};

// ================= 8 SEASON 2 PROCESS =================
const S2 = [
  {s: 'Analyze', a: '40 episodes · 982M views', b: 'find what held ~24.5M viewers an episode, scene by scene'},
  {s: 'Predict', a: 'benchmark the world', b: 'Squid Game’s viral scene states its rule at 0:13 · Ertuğrul · Ali Clay'},
  {s: 'Optimize', a: 'stake at 4:08 → first 15s', b: '3 Shorts-ready moments written into every script'},
  {s: 'Produce', a: '18 caption languages in S1', b: 'dub & market for Türkiye, MENA & beyond'},
  {s: 'Measure', a: 'views → influence', b: 'sentiment · cross-border talk · family, dignity, humane leadership'},
];
const Season2: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <Scene dur={dur} tag="WHAT COULD BE · SHER SEASON 2 THROUGH THE LENS">
      <Grid />
      <div style={{position: 'absolute', top: 160, left: 120, right: 120}}>
        {S2.map((r, i) => {
          const s = Math.round(dur * 0.1) + i * Math.round(dur * 0.13);
          return (
            <div key={r.s} style={{display: 'flex', alignItems: 'center', gap: 36, padding: '20px 0', borderTop: `1px solid ${C.line}`, opacity: fade(f, s), transform: `translateX(${(1 - fade(f, s)) * 40}px)`}}>
              <div style={{fontFamily: MONO, fontSize: 22, color: C.cyan, width: 50}}>0{i + 1}</div>
              <div style={{fontFamily: HEAD, fontSize: 48, fontWeight: 700, color: C.white, width: 300}}>{r.s}</div>
              <div style={{fontFamily: HEAD, fontSize: 34, fontWeight: 600, width: 560}}><GradText>{r.a}</GradText></div>
              <div style={{fontFamily: BODY, fontSize: 26, color: C.w60, flex: 1}}>{r.b}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 110, left: 120, right: 120, display: 'flex', gap: 22, opacity: fade(f, dur * 0.78)}}>
        {['More viral', 'More engaging', 'A positive cultural artifact — internationally'].map((t, i) => (
          <div key={t} style={{fontFamily: HEAD, fontSize: 34, fontWeight: 600, padding: '14px 28px', borderRadius: 40, border: `1.5px solid ${C.cyan}`, color: i === 2 ? C.white : C.cyan, background: i === 2 ? rgba(C.blue, 0.15) : 'transparent'}}>{t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 40, left: 120, fontFamily: MONO, fontSize: 15, color: C.w40}}>Season 2 values are Lens targets, not forecasts. Benchmarks measured from official YouTube uploads, 5 Oct 2026.</div>
    </Scene>
  );
};

// ================= 9 CLOSE =================
const Close: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const g = spring({frame: f, fps: 30, config: {damping: 200}});
  return (
    <Scene dur={dur + 8}>
      <Constellation intensity={0.6} labels glow={0.6 * g} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(8,8,8,0.95) 30%, rgba(8,8,8,0.4) 80%)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: BODY, fontSize: 36, color: C.w60, opacity: fade(f, 0)}}>That’s the power of</div>
        <div style={{fontFamily: HEAD, fontSize: 150, fontWeight: 700, letterSpacing: -3, transform: `scale(${0.9 + 0.1 * g})`}}><GradText>Cultural Lens</GradText></div>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: C.gold, marginTop: 20, opacity: fade(f, 40)}}>POWERED BY RIYADAX9</div>
        <div style={{fontFamily: HEAD, fontSize: 34, color: C.white, marginTop: 50, opacity: fade(f, 60)}}>lens.communities.company</div>
        <div style={{fontFamily: BODY, fontSize: 22, color: C.w40, marginTop: 18, opacity: fade(f, 75)}}>AI analysis partners across the Middle East</div>
      </AbsoluteFill>
    </Scene>
  );
};

