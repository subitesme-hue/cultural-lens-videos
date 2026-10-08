// Extra scene registers so consecutive videos never look alike. Each "look" (see LOOKS in LeadVideo.tsx)
// combines one scene per slot from DocScenes / BriefScenes / this file.
//  · EdHook / EdPains  — editorial (Creative History Opener): full-bleed plate, condensed titles, rotated sidebar
//  · PosterHook / PosterPains — infographic poster (Infographic Posters): solid accent poster, gauges, big index type
//  · HubSolutions — pilot-film motion: glowing constellation hub with three module nodes
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, random} from 'remotion';
import {C, rgba, HEAD, BODY, clamp, fade, Constellation} from './LensParts';
import {DocProps, DocScene, Plate, PLATES, PlateKind, BigWord, Hairlines, Pill, FilmTexture, sentenceStarts, ein, fit, PLEX, INK} from './DocScenes';

const COND = 'Oswald, "Space Grotesk", sans-serif';
const W60 = 'rgba(255,255,255,0.62)', W40 = 'rgba(255,255,255,0.42)', WLINE = 'rgba(255,255,255,0.14)';

const Sidebar: React.FC<{labels: string[]; active: number}> = ({labels, active}) => (
  <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 96, background: 'rgba(6,6,7,0.92)', borderRight: `1px solid ${WLINE}`}}>
    <div style={{position: 'absolute', top: 64, left: 34, display: 'flex', flexDirection: 'column', gap: 6}}>
      {[0, 1, 2].map((k) => <div key={k} style={{width: 28, height: 3, background: '#fff'}} />)}
    </div>
    <div style={{position: 'absolute', bottom: 70, left: 0, width: 96, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 34}}>
      {labels.map((s, i) => (
        <div key={i} style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: HEAD, fontWeight: 600, fontSize: 15, letterSpacing: 4, textTransform: 'uppercase', color: i === active ? C.cyan : 'rgba(255,255,255,0.35)'}}>{s}</div>
      ))}
    </div>
  </div>
);

// ======================= HOOK · editorial cover (frame 0 finished) =======================
export const EdHook: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const kind: PlateKind = (['globe', 'trails', 'waves', 'bars'] as PlateKind[])[v % 4];
  const word = (p.hook_eyebrow || p.segment).split('+')[0].trim();
  return (
    <DocScene dur={dur} noFadeIn noBrand>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1.02 + 0.05 * (f / Math.max(1, dur))})`}}>
        <Plate kind={kind} w={1920} h={1080} id="eh" push={f / Math.max(1, dur)} tint={0.5} bright={0.9} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,6,7,0.95) 0%, rgba(6,6,7,0.82) 55%, rgba(6,6,7,0.3) 100%)'}} />
      <BigWord text={`${word}  ${word}`} top={600} size={380} opacity={0.08} speed={1.4} x0={700} />
      <Sidebar labels={['Cultural Lens', 'By RiyadaX9', `For ${p.audience}`]} active={2} />
      <div style={{position: 'absolute', top: 60, right: 120, fontFamily: PLEX, fontSize: 15, letterSpacing: 5, color: W60}}>CULTURAL LENS <span style={{color: C.gold}}>· RIYADAX9</span></div>
      <div style={{position: 'absolute', left: 170, top: 0, bottom: 0, width: 1250, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: PLEX, fontSize: 20, letterSpacing: 5, color: C.cyan}}>
          <span style={{fontFamily: COND, fontSize: 46, fontWeight: 700, letterSpacing: 0}}>00</span><span style={{width: 60, height: 2, background: C.cyan}} />{p.hook_eyebrow}
        </div>
        <div style={{fontFamily: COND, fontWeight: 700, fontSize: fit(p.hook_title, 132, 104, 80), lineHeight: 1, textTransform: 'uppercase', color: '#fff', marginTop: 26}}>{p.hook_title}</div>
        <div style={{fontFamily: BODY, fontSize: 30, lineHeight: 1.4, color: 'rgba(255,255,255,0.8)', marginTop: 28, maxWidth: 1050, opacity: fade(f, Math.round(dur * 0.45))}}>{p.hook_sub}</div>
        <div style={{marginTop: 40}}><Pill text={`For ${p.audience}`} bg={C.cyan} fg={INK} size={20} /></div>
      </div>
      <div style={{position: 'absolute', left: 170, bottom: 54, fontFamily: PLEX, fontSize: 15, letterSpacing: 5, color: W40}}>A CULTURAL INTELLIGENCE BRIEF · {p.segment.toUpperCase()}</div>
    </DocScene>
  );
};

// ======================= PAINS · editorial chapters =======================
export const EdPains: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const starts = sentenceStarts(p.vo?.pains, dur, 4, [0, 0.12, 0.39, 0.66]).slice(1);
  const pains = p.pains.slice(0, 3);
  const cur = starts.filter((s) => f >= s - 4).length - 1;
  const warm = C.amber;
  return (
    <DocScene dur={dur} tag={`THREE PRESSURES · ${p.segment.toUpperCase()}`}>
      <AbsoluteFill style={{opacity: 1 - ein(f, starts[0] - 6, 14)}}>
        <BigWord text="PRESSURE · PRESSURE · PRESSURE" top={640} size={330} opacity={0.08} speed={2} x0={-60} />
        <div style={{position: 'absolute', left: 170, top: 320}}>
          <div style={{fontFamily: COND, fontWeight: 700, fontSize: 180, lineHeight: 0.92, textTransform: 'uppercase', color: '#fff', transform: `translateY(${(1 - ein(f, 0, 18)) * 60}px)`}}>Three pressures</div>
          <div style={{fontFamily: COND, fontWeight: 700, fontSize: 120, lineHeight: 1, textTransform: 'uppercase', color: warm, opacity: ein(f, 5, 12)}}>on {p.segment}</div>
        </div>
      </AbsoluteFill>
      {pains.map((x, i) => {
        const at = starts[i], next = i < 2 ? starts[i + 1] : dur + 60;
        if (f < at - 6 || f > next + 20) return null;
        const reveal = ein(f, at - 4, 18);
        const kind = PLATES[(v + i + 1) % PLATES.length];
        return (
          <AbsoluteFill key={i} style={{clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}}>
            <div style={{position: 'absolute', inset: 0}}><Plate kind={kind} w={1920} h={1080} id={`ep${i}`} push={(f - at) / Math.max(1, next - at)} bright={0.75} /></div>
            <AbsoluteFill style={{background: 'linear-gradient(270deg, rgba(6,6,7,0.95) 0%, rgba(6,6,7,0.8) 55%, rgba(6,6,7,0.35) 100%)'}} />
            <BigWord text={`${x.signal}  ${x.signal}`} top={720} size={260} opacity={0.08} speed={2} x0={0} />
            <div style={{position: 'absolute', top: 0, bottom: 0, right: `${reveal * 0 + (1 - reveal) * 100}%`, width: 6, background: warm, opacity: reveal < 1 ? 1 : 0}} />
            <div style={{position: 'absolute', right: 140, top: 230, width: 1000, textAlign: 'right'}}>
              <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18, fontFamily: PLEX, fontSize: 20, letterSpacing: 5, color: warm, opacity: ein(f, at + 4, 12)}}>
                {x.signal.toUpperCase()}<span style={{width: 60, height: 2, background: warm}} /><span style={{fontFamily: COND, fontSize: 46, fontWeight: 700, letterSpacing: 0}}>0{i + 1}</span>
              </div>
              <div style={{fontFamily: COND, fontWeight: 700, fontSize: fit(x.title, 150, 112, 40), lineHeight: 0.98, textTransform: 'uppercase', color: '#fff', marginTop: 26, overflow: 'hidden'}}>
                <div style={{transform: `translateY(${(1 - ein(f, at + 6, 20)) * 110}%)`}}>{x.title}</div>
              </div>
              <div style={{fontFamily: BODY, fontSize: fit(x.detail, 32, 27, 140), lineHeight: 1.45, color: 'rgba(255,255,255,0.86)', marginTop: 30, marginLeft: 'auto', maxWidth: 900, opacity: ein(f, at + 16, 14)}}>{x.detail}</div>
            </div>
          </AbsoluteFill>
        );
      })}
      <Sidebar labels={pains.map((x) => x.signal)} active={cur} />
      <div style={{position: 'absolute', left: 170, bottom: 54, fontFamily: PLEX, fontSize: 15, letterSpacing: 5, color: W40}}>{cur < 0 ? 'WHAT IS COSTING THE SEGMENT' : `PRESSURE 0${cur + 1} OF 03`}</div>
    </DocScene>
  );
};

// ======================= HOOK · infographic poster (frame 0 finished) =======================
const LAYERS = ['Story', 'Audience', 'Character', 'Narrative', 'Cultural', 'Predictive'];
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
};
export const PosterHook: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p}) => {
  const f = useCurrentFrame();
  const word = (p.hook_eyebrow || p.segment).split('+')[0].trim();
  const CX = 1440, CY = 540, R = 270, rot = f / 300;
  return (
    <AbsoluteFill style={{background: `linear-gradient(135deg, ${C.blue} 0%, ${rgba(C.blue, 0.85)} 40%, #0A0A12 100%)`, opacity: interpolate(f, [dur - 8, dur], [1, 0], clamp)}}>
      <BigWord text={`${word} ${word} ${word}`} top={-40} size={420} opacity={0.12} speed={1.2} x0={-60} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <circle cx={CX} cy={CY} r={R + 70} fill="none" stroke="#fff" strokeOpacity={0.12} strokeWidth={1.5} strokeDasharray="4 10" transform={`rotate(${f / 3} ${CX} ${CY})`} />
        {LAYERS.map((l, i) => {
          const a0 = -Math.PI / 2 + (i * Math.PI) / 3 + 0.06 + rot, a1 = a0 + Math.PI / 3 - 0.12, mid = (a0 + a1) / 2;
          const pulse = 0.55 + 0.45 * Math.max(0, Math.sin(f / 14 - i * 0.9));
          return (
            <g key={l}>
              <path d={arc(CX, CY, R, a0, a1)} fill="none" stroke="#fff" strokeOpacity={0.25 + 0.75 * pulse} strokeWidth={46} />
              <text x={CX + (R + 74) * Math.cos(mid)} y={CY + (R + 74) * Math.sin(mid) + 8} textAnchor="middle" fill="#fff" fontFamily={HEAD} fontWeight={600} fontSize={20} letterSpacing={3}>{l.toUpperCase()}</text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: CX - 200, width: 400, top: CY - 118, textAlign: 'center', color: '#fff'}}>
        <div style={{fontFamily: COND, fontWeight: 700, fontSize: 190, lineHeight: 1}}>6</div>
        <div style={{fontFamily: PLEX, fontSize: 15, letterSpacing: 5}}>INTELLIGENCE LAYERS</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 64, display: 'flex', alignItems: 'center', gap: 12, color: '#fff'}}>
        <div style={{fontFamily: HEAD, fontSize: 24, fontWeight: 700}}>Cultural Lens</div><div style={{width: 1.5, height: 20, background: W60}} />
        <div style={{fontFamily: PLEX, fontSize: 17, letterSpacing: 4, color: C.gold}}>BY RIYADAX9</div>
      </div>
      <div style={{position: 'absolute', left: 120, width: 960, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff'}}>
        <div><Pill text={p.hook_eyebrow} bg="#fff" fg={INK} size={17} /></div>
        <div style={{fontFamily: COND, fontWeight: 700, fontSize: fit(p.hook_title, 120, 92, 80), lineHeight: 1, textTransform: 'uppercase', marginTop: 30}}>{p.hook_title}</div>
        <div style={{fontFamily: BODY, fontSize: 29, lineHeight: 1.4, color: 'rgba(255,255,255,0.88)', marginTop: 28, opacity: fade(f, Math.round(dur * 0.45))}}>{p.hook_sub}</div>
        <div style={{marginTop: 40, fontFamily: PLEX, fontSize: 24, letterSpacing: 6}}>FOR <span style={{fontWeight: 700}}>{p.audience.toUpperCase()}</span></div>
      </div>
      <FilmTexture />
    </AbsoluteFill>
  );
};

// ======================= PAINS · infographic posters with pressure gauges =======================
export const PosterPains: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p}) => {
  const f = useCurrentFrame();
  const starts = sentenceStarts(p.vo?.pains, dur, 4, [0, 0.12, 0.39, 0.66]).slice(1);
  const pains = p.pains.slice(0, 3);
  const cur = starts.filter((s) => f >= s - 4).length - 1;
  return (
    <DocScene dur={dur} tag={`THREE PRESSURES · ${p.segment.toUpperCase()}`}>
      <BigWord text="PRESSURE · PRESSURE · PRESSURE" top={790} size={260} opacity={0.06} speed={1.8} x0={-40} />
      <div style={{position: 'absolute', top: 132, left: 120, fontFamily: COND, fontWeight: 700, fontSize: 84, textTransform: 'uppercase', color: '#fff', opacity: fade(f, 0)}}>
        Three pressures on <span style={{color: C.amber}}>{p.segment}</span>
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 280, display: 'flex', gap: 30, alignItems: 'flex-start'}}>
        {pains.map((x, i) => {
          const at = starts[i], on = f >= at - 4, active = i === cur;
          const g = ein(f, at, 40);
          const R = 120, a0 = Math.PI, aEnd = Math.PI + Math.PI * (0.55 + 0.35 * random(`pp${i}`)) * g;
          const nx = 160 + R * Math.cos(aEnd), ny = 150 + R * Math.sin(aEnd);
          return (
            <div key={i} style={{flex: 1, height: 640, padding: '34px 36px', position: 'relative', overflow: 'hidden',
              background: active ? '#fff' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? '#fff' : WLINE}`,
              opacity: on ? (active ? 1 : 0.55) : 0.18, transform: `translateY(${on ? (1 - ein(f, at - 4, 16)) * 40 : 40}px) scale(${active ? 1 : 0.97})`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Pill text={x.signal} bg={active ? INK : C.amber} fg={active ? '#fff' : INK} size={14} />
                <span style={{fontFamily: COND, fontWeight: 700, fontSize: 64, color: active ? INK : 'rgba(255,255,255,0.3)'}}>0{i + 1}</span>
              </div>
              <svg width={320} height={175} style={{display: 'block', margin: '26px auto 0'}}>
                <path d={arc(160, 150, R, Math.PI, 2 * Math.PI - 0.0001)} fill="none" stroke={active ? 'rgba(10,10,11,0.12)' : WLINE} strokeWidth={22} />
                {g > 0 && <path d={arc(160, 150, R, a0, aEnd)} fill="none" stroke={C.amber} strokeWidth={22} />}
                <line x1={160} y1={150} x2={nx} y2={ny} stroke={active ? INK : '#fff'} strokeWidth={4} strokeLinecap="round" />
                <circle cx={160} cy={150} r={9} fill={active ? INK : '#fff'} />
                <text x={38} y={172} fill={active ? 'rgba(10,10,11,0.5)' : W40} fontFamily={PLEX} fontSize={13} letterSpacing={2}>LOW</text>
                <text x={282} y={172} textAnchor="end" fill={active ? 'rgba(10,10,11,0.5)' : W40} fontFamily={PLEX} fontSize={13} letterSpacing={2}>HIGH</text>
              </svg>
              <div style={{fontFamily: PLEX, fontSize: 13, letterSpacing: 4, color: active ? 'rgba(10,10,11,0.5)' : W40, textAlign: 'center', marginTop: 4}}>PRESSURE · ILLUSTRATIVE</div>
              <div style={{fontFamily: COND, fontWeight: 700, fontSize: fit(x.title, 52, 40, 42), lineHeight: 1.04, textTransform: 'uppercase', color: active ? INK : '#fff', marginTop: 26}}>{x.title}</div>
              <div style={{fontFamily: BODY, fontSize: fit(x.detail, 24, 21, 140), lineHeight: 1.45, color: active ? 'rgba(10,10,11,0.65)' : W60, marginTop: 16}}>{x.detail}</div>
            </div>
          );
        })}
      </div>
    </DocScene>
  );
};

// ======================= SOLUTIONS · glowing hub (pilot-film motion) =======================
export const HubSolutions: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p}) => {
  const f = useCurrentFrame();
  const starts = sentenceStarts(p.vo?.solutions, dur, 4, [0, 0.1, 0.38, 0.66]).slice(1);
  const sols = p.solutions.slice(0, 3);
  const cur = starts.filter((s) => f >= s - 4).length - 1;
  const HX = 960, HY = 520;
  const pos = [{x: 470, y: 330}, {x: 1450, y: 330}, {x: 960, y: 860}];
  const g = interpolate(f, [starts[0], starts[2] + 30], [0.2, 1], clamp);
  return (
    <DocScene dur={dur} tag="WHAT CULTURAL LENS DOES">
      <Constellation intensity={0.3 + 0.4 * g} labels glow={g} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(8,8,8,0.55) 20%, rgba(8,8,8,0.92) 75%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {pos.map((q, i) => {
          const e = ein(f, starts[i], 24), x2 = HX + (q.x - HX) * e, y2 = HY + (q.y - HY) * e, t = ((f - starts[i]) % 40) / 40;
          return (
            <g key={i}>
              <line x1={HX} y1={HY} x2={x2} y2={y2} stroke={C.cyan} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="8 10" strokeDashoffset={-f * 2} />
              {e >= 1 && <circle cx={HX + (q.x - HX) * t} cy={HY + (q.y - HY) * t} r={6} fill={C.cyan} />}
            </g>
          );
        })}
        <circle cx={HX} cy={HY} r={110 + 6 * Math.sin(f / 8)} fill={rgba(C.blue, 0.18)} stroke={C.cyan} strokeWidth={2} />
        <circle cx={HX} cy={HY} r={170 + 10 * Math.sin(f / 11)} fill="none" stroke={rgba(C.cyan, 0.3)} strokeWidth={1} />
      </svg>
      <div style={{position: 'absolute', left: HX - 140, width: 280, top: HY - 56, textAlign: 'center', fontFamily: COND, fontWeight: 700, fontSize: 52, lineHeight: 1, textTransform: 'uppercase', color: '#fff'}}>Cultural<br />Lens</div>
      {sols.map((s, i) => {
        const q = pos[i], at = starts[i] + 18, active = i === cur;
        return (
          <div key={i} style={{position: 'absolute', left: q.x - 300, top: i === 2 ? q.y - 120 : q.y - 200, width: 600, padding: '22px 28px', background: active ? 'rgba(14,16,19,0.96)' : 'rgba(14,16,19,0.8)',
            border: `1px solid ${active ? C.cyan : WLINE}`, boxShadow: active ? `0 0 40px ${rgba(C.cyan, 0.25)}` : 'none', opacity: fade(f, at), transform: `scale(${0.92 + 0.08 * fade(f, at)})`}}>
            <div style={{fontFamily: PLEX, fontSize: 15, letterSpacing: 4, color: C.cyan}}>0{i + 1} · {s.module.toUpperCase()}</div>
            <div style={{fontFamily: COND, fontWeight: 700, fontSize: fit(s.title, 46, 36, 42), lineHeight: 1.05, textTransform: 'uppercase', color: '#fff', marginTop: 8}}>{s.title}</div>
            <div style={{fontFamily: BODY, fontSize: fit(s.detail, 22, 19, 140), lineHeight: 1.4, color: W60, marginTop: 8}}>{s.detail}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 120, bottom: 54, fontFamily: COND, fontWeight: 700, fontSize: 40, textTransform: 'uppercase', color: '#fff', opacity: 1 - ein(f, starts[0], 12)}}>
        One lens. <span style={{color: C.cyan}}>Three answers.</span>
      </div>
    </DocScene>
  );
};
