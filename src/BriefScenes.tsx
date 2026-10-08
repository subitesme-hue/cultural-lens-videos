// "The Intelligence Brief" — registers mixed from the reference set:
//  · Solutions = editorial chapters (Creative History Opener: full-bleed plate, huge condensed accent title,
//    index number, rotated sidebar, ghost word)
//  · Value = infographic posters (one idea per screen: layer ring + counter, outcome rings, hub map + counters)
//    with motion borrowed from the pilot film (scanner sweep, hub-and-arc map, spring counters)
//  · Close = documentary end card over the pilot film's glowing constellation
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, random} from 'remotion';
import {C, rgba, HEAD, BODY, clamp, fade, Constellation} from './LensParts';
import {DocProps, DocScene, Plate, PLATES, PlateKind, BigWord, Hairlines, Pill, SliceReveal, sentenceStarts, ein, fit, PLEX, INK} from './DocScenes';

const COND = 'Oswald, "Space Grotesk", sans-serif';
const W60 = 'rgba(255,255,255,0.62)', W40 = 'rgba(255,255,255,0.42)', WLINE = 'rgba(255,255,255,0.14)';

// ======================= 3 · SOLUTIONS — editorial chapters =======================
export const BriefSolutions: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const st = sentenceStarts(p.vo?.solutions, dur, 4, [0, 0.1, 0.38, 0.66]);
  const starts = st.slice(1);
  const sols = p.solutions.slice(0, 3);
  const cur = starts.filter((s) => f >= s - 4).length - 1; // -1 = intro card
  return (
    <DocScene dur={dur} tag="WHAT CULTURAL LENS DOES">
      {/* intro: one lens, three answers */}
      <AbsoluteFill style={{opacity: 1 - ein(f, starts[0] - 6, 14)}}>
        <BigWord text="ANSWERS · ANSWERS · ANSWERS" top={640} size={330} opacity={0.08} speed={2} x0={-60} />
        <div style={{position: 'absolute', left: 170, top: 300}}>
          <div style={{fontFamily: COND, fontWeight: 700, fontSize: 190, lineHeight: 0.92, textTransform: 'uppercase', color: '#fff', transform: `translateY(${(1 - ein(f, 0, 18)) * 60}px)`}}>One lens.</div>
          <div style={{fontFamily: COND, fontWeight: 700, fontSize: 190, lineHeight: 0.92, textTransform: 'uppercase', color: C.cyan, transform: `translateY(${(1 - ein(f, 5, 18)) * 60}px)`, opacity: ein(f, 5, 12)}}>Three answers.</div>
        </div>
      </AbsoluteFill>
      {sols.map((s, i) => {
        const at = starts[i], next = i < 2 ? starts[i + 1] : dur + 60;
        if (f < at - 6 || f > next + 20) return null;
        const reveal = ein(f, at - 4, 18);
        const kind: PlateKind = PLATES[(v + i + 2) % PLATES.length];
        const ghost = s.module.split(' ')[0];
        const pain = p.pains[i];
        return (
          <AbsoluteFill key={i} style={{clipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`}}>
            <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.05 * ((f - at) / Math.max(1, next - at))})`}}>
              <Plate kind={kind} w={1920} h={1080} id={`bs${i}`} push={(f - at) / Math.max(1, next - at)} tint={0.5} bright={0.85} />
            </div>
            <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(6,6,7,0.94) 0%, rgba(6,6,7,0.78) 48%, rgba(6,6,7,0.25) 100%)'}} />
            <BigWord text={`${ghost}  ${ghost}`} top={220} size={360} opacity={0.07} speed={1.6} x0={760} />
            {/* leading edge of the wipe */}
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - reveal) * 100}%`, width: 6, background: C.cyan, opacity: reveal < 1 ? 1 : 0}} />
            <div style={{position: 'absolute', left: 170, top: 220, width: 1080}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: PLEX, fontSize: 20, letterSpacing: 5, color: C.cyan, opacity: ein(f, at + 4, 12)}}>
                <span style={{fontFamily: COND, fontSize: 46, fontWeight: 700, letterSpacing: 0}}>0{i + 1}</span>
                <span style={{width: 60, height: 2, background: C.cyan}} />{s.module.toUpperCase()}
              </div>
              <div style={{fontFamily: COND, fontWeight: 700, fontSize: fit(s.title, 150, 112, 40), lineHeight: 0.98, textTransform: 'uppercase', color: C.cyan, marginTop: 26, overflow: 'hidden'}}>
                <div style={{transform: `translateY(${(1 - ein(f, at + 6, 20)) * 110}%)`}}>{s.title}</div>
              </div>
              <div style={{fontFamily: BODY, fontSize: fit(s.detail, 32, 27, 140), lineHeight: 1.45, color: 'rgba(255,255,255,0.86)', marginTop: 30, maxWidth: 920, opacity: ein(f, at + 16, 14)}}>{s.detail}</div>
              {pain && <div style={{marginTop: 38, display: 'flex', alignItems: 'center', gap: 16, opacity: ein(f, at + 26, 14)}}>
                <Pill text={`Answers pressure 0${i + 1}`} bg="#fff" fg={INK} size={15} />
                <span style={{fontFamily: HEAD, fontSize: 24, color: W60}}>{pain.title}</span>
              </div>}
            </div>
          </AbsoluteFill>
        );
      })}
      {/* rotated sidebar (history-opener chrome) */}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 96, background: 'rgba(6,6,7,0.92)', borderRight: `1px solid ${WLINE}`}}>
        <div style={{position: 'absolute', top: 64, left: 34, display: 'flex', flexDirection: 'column', gap: 6}}>
          {[0, 1, 2].map((k) => <div key={k} style={{width: 28, height: 3, background: '#fff'}} />)}
        </div>
        <div style={{position: 'absolute', bottom: 70, left: 0, width: 96, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 34}}>
          {sols.map((s, i) => (
            <div key={i} style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: HEAD, fontWeight: 600, fontSize: 15, letterSpacing: 4, textTransform: 'uppercase',
              color: i === cur ? C.cyan : 'rgba(255,255,255,0.35)'}}>{s.module}</div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 170, bottom: 54, fontFamily: PLEX, fontSize: 15, letterSpacing: 5, color: W40}}>
        {cur < 0 ? 'THREE PRESSURES · THREE MODULES' : `MODULE 0${cur + 1} OF 03 · CULTURAL LENS`}
      </div>
    </DocScene>
  );
};

// ======================= 4 · VALUE — infographic posters =======================
const DEF_IN = ['Video content', 'Scripts', 'Audience conversations', 'Industry signals'];
const DEF_OUT = ['Executive reports', 'Audience mapping', 'Forecasting', 'Decision support'];
const LAYER = ['Story', 'Audience', 'Character', 'Narrative', 'Cultural', 'Predictive'];
const DEF_OUTCOMES = [{k: 'Capacity', t: 'Read entire catalogues, not samples'}, {k: 'Deliverability', t: 'Decision-ready reports for every greenlight'}, {k: 'Profitability', t: 'Fewer misfires, stronger returns'}, {k: 'Scalability', t: 'From one market to many'}];
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
};
// schematic land mass for the hub map (lon/lat ellipses: Africa, Europe, Arabia, South Asia, East Asia)
const LAND = [[20, 5, 22, 30], [15, 50, 22, 10], [47, 24, 10, 9], [78, 22, 10, 13], [105, 35, 28, 18], [62, 45, 25, 10]];
const inLand = (lon: number, lat: number) => LAND.some(([x, y, rx, ry]) => ((lon - x) / rx) ** 2 + ((lat - y) / ry) ** 2 < 1);
const MARKETS = [{lon: 31, lat: 30}, {lon: 46.7, lat: 24.7}, {lon: 36, lat: 33}, {lon: 29, lat: 41}, {lon: 67, lat: 25}, {lon: 73, lat: 19}, {lon: 77, lat: 28.6}, {lon: 90, lat: 23.8}, {lon: 3, lat: 36.7}, {lon: 51.5, lat: 25.3}];

export const BriefValue: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const [, b1, b2] = sentenceStarts(p.vo?.value, dur, 3, [0, 0.36, 0.68]);
  const ins = (p.value?.inputs?.length ? p.value.inputs : DEF_IN).slice(0, 4);
  const outs = (p.value?.outputs?.length ? p.value.outputs : DEF_OUT).slice(0, 4);
  const oc = p.value?.outcomes?.length === 4 ? p.value.outcomes : DEF_OUTCOMES;
  const oA = 1 - ein(f, b1 - 6, 14), oB = ein(f, b1 - 6, 14) * (1 - ein(f, b2 - 6, 14)), oC = ein(f, b2 - 6, 14);
  // --- beat A: six-layer ring ---
  const CX = 960, CY = 600, R = 220;
  const segOn = (i: number) => ein(f, 14 + i * 7, 14);
  const n = Math.round(interpolate(f, [14, 14 + 6 * 7], [0, 6], clamp));
  // --- beat C: hub map ---
  const MX = 120, MY = 250, MW = 1000, MH = 640;
  const px = (lon: number) => MX + ((lon + 20) / 150) * MW, py = (lat: number) => MY + ((62 - lat) / 72) * MH;
  const dots: React.ReactNode[] = [];
  for (let lon = -18; lon <= 128; lon += 3.2) for (let lat = -8; lat <= 60; lat += 3.2) if (inLand(lon, lat)) dots.push(<circle key={`${lon}_${lat}`} cx={px(lon)} cy={py(lat)} r={3} fill="#fff" opacity={0.22} />);
  const hub = {x: px(55.3), y: py(25.2)};
  const scan = interpolate(f, [b2, b2 + 40], [MX, MX + MW], clamp);
  const count = (to: number, at: number) => Math.round(to * spring({frame: f - at, fps: 30, config: {damping: 200}, durationInFrames: 40}));
  return (
    <DocScene dur={dur} tag={`WHAT YOU GET · ${p.segment.toUpperCase()}`}>
      {/* ---------- A: raw signal → six layers → decision support ---------- */}
      <AbsoluteFill style={{opacity: oA}}>
        <BigWord text="SIGNAL → DECISION → SIGNAL → DECISION" top={170} size={200} opacity={0.07} speed={2.2} x0={0} />
        <div style={{position: 'absolute', top: 140, left: 120, fontFamily: HEAD, fontSize: 52, fontWeight: 700, color: '#fff', letterSpacing: -1}}>
          From raw signal to <span style={{color: C.cyan}}>decision support</span>
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          {LAYER.map((l, i) => {
            const a0 = -Math.PI / 2 + (i * Math.PI) / 3 + 0.05, a1 = a0 + Math.PI / 3 - 0.1;
            const on = segOn(i), mid = (a0 + a1) / 2;
            return (
              <g key={l}>
                <path d={arc(CX, CY, R, a0, a1)} fill="none" stroke={WLINE} strokeWidth={34} />
                <path d={arc(CX, CY, R, a0, a0 + (a1 - a0) * on)} fill="none" stroke={i % 2 ? C.blue : C.cyan} strokeWidth={34} style={{filter: `drop-shadow(0 0 12px ${rgba(C.cyan, 0.5)})`}} />
                <text x={CX + (R + 52) * Math.cos(mid)} y={CY + (R + 52) * Math.sin(mid) + 8} textAnchor={Math.cos(mid) > 0.3 ? 'start' : Math.cos(mid) < -0.3 ? 'end' : 'middle'} fill="#fff" opacity={0.25 + 0.75 * on} fontFamily={HEAD} fontWeight={600} fontSize={22} letterSpacing={3}>{l.toUpperCase()}</text>
              </g>
            );
          })}
          {/* inputs flow in, outputs flow out */}
          {f > 20 && Array.from({length: 8}, (_, i) => {
            const t = ((f * 1.4 + i * 17) % 60) / 60, left = i % 2 === 0, y = 430 + (i % 4) * 85;
            const x = left ? 560 + (CX - R - 40 - 560) * t : CX + R + 40 + (1360 - CX - R - 40) * t;
            return <rect key={i} x={x} y={y + (CY - y) * (left ? t * 0.6 : (1 - t) * 0.6)} width={14} height={3} fill={C.cyan} opacity={1 - t * 0.6} />;
          })}
        </svg>
        <div style={{position: 'absolute', left: CX - 200, width: 400, top: CY - 120, textAlign: 'center'}}>
          <div style={{fontFamily: COND, fontWeight: 700, fontSize: 200, lineHeight: 1, color: '#fff'}}>{n}</div>
          <div style={{fontFamily: PLEX, fontSize: 16, letterSpacing: 5, color: C.cyan}}>INTELLIGENCE LAYERS</div>
        </div>
        {[{t: 'INPUTS', items: ins, x: 120, at: 6, hi: false}, {t: 'OUTPUTS', items: outs, x: 1400, at: 40, hi: true}].map((col) => (
          <div key={col.t} style={{position: 'absolute', left: col.x, top: 400, width: 400}}>
            <div style={{fontFamily: PLEX, fontSize: 15, letterSpacing: 5, color: col.hi ? C.cyan : W40, opacity: fade(f, col.at)}}>{col.t}</div>
            {col.items.map((t, i) => (
              <div key={t} style={{marginTop: 14, fontFamily: HEAD, fontSize: 28, fontWeight: 600, color: '#fff', padding: '12px 18px', background: col.hi ? rgba(C.blue, 0.22) : 'rgba(255,255,255,0.06)', borderLeft: `3px solid ${col.hi ? C.cyan : W40}`,
                opacity: fade(f, col.at + 4 + i * 5), transform: `translateX(${(1 - ein(f, col.at + 4 + i * 5, 16)) * (col.hi ? 40 : -40)}px)`}}>{t}</div>
            ))}
          </div>
        ))}
      </AbsoluteFill>

      {/* ---------- B: how it pays back — outcome poster rings ---------- */}
      <AbsoluteFill style={{opacity: oB}}>
        <BigWord text="PAYBACK · PAYBACK · PAYBACK" top={720} size={300} opacity={0.07} speed={2} x0={-80} />
        <div style={{position: 'absolute', top: 140, left: 120, fontFamily: HEAD, fontSize: 52, fontWeight: 700, color: '#fff', letterSpacing: -1}}>
          What it <span style={{color: C.cyan}}>pays back</span>
        </div>
        <div style={{position: 'absolute', left: 120, right: 120, top: 290, display: 'flex', gap: 28}}>
          {oc.map((o, i) => {
            const at = b1 + 4 + i * 10, g = ein(f, at, 34), r = 110;
            return (
              <div key={o.k} style={{flex: 1, height: 470, background: 'rgba(255,255,255,0.045)', border: `1px solid ${WLINE}`, padding: '40px 34px', position: 'relative', overflow: 'hidden',
                opacity: fade(f, at), transform: `translateY(${(1 - ein(f, at, 18)) * 50}px)`}}>
                <div style={{position: 'absolute', right: 24, bottom: 6, fontFamily: COND, fontSize: 90, fontWeight: 700, color: 'rgba(255,255,255,0.07)'}}>0{i + 1}</div>
                <svg width={2 * r + 30} height={2 * r + 30} style={{display: 'block', margin: '0 auto'}}>
                  <circle cx={r + 15} cy={r + 15} r={r} fill="none" stroke={WLINE} strokeWidth={14} />
                  <path d={arc(r + 15, r + 15, r, -Math.PI / 2, -Math.PI / 2 + Math.max(0.001, g) * Math.PI * 1.999)} fill="none" stroke={C.cyan} strokeWidth={14} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${rgba(C.cyan, 0.6)})`}} />
                  <text x={r + 15} y={r + 26} textAnchor="middle" fill="#fff" fontFamily={COND} fontWeight={700} fontSize={o.k.length > 12 ? 25 : o.k.length > 10 ? 28 : 36} letterSpacing={1}>{o.k.toUpperCase()}</text>
                </svg>
                <div style={{fontFamily: HEAD, fontSize: fit(o.t, 32, 26, 56), fontWeight: 700, color: '#fff', marginTop: 34, lineHeight: 1.2, opacity: ein(f, at + 14, 14)}}>{o.t}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* ---------- C: one method, every market — hub map + counters ---------- */}
      <AbsoluteFill style={{opacity: oC}}>
        <div style={{position: 'absolute', top: 140, left: 120, fontFamily: HEAD, fontSize: 52, fontWeight: 700, color: '#fff', letterSpacing: -1}}>
          One method. <span style={{color: C.cyan}}>Every market.</span>
        </div>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <g opacity={ein(f, b2, 16)}>{dots}</g>
          {MARKETS.map((m, i) => {
            const at = b2 + 10 + i * 4, g = ein(f, at, 22);
            const x2 = px(m.lon), y2 = py(m.lat), mx = (hub.x + x2) / 2, my = Math.min(hub.y, y2) - 70;
            return (
              <g key={i}>
                <path d={`M${hub.x},${hub.y} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray={600} strokeDashoffset={600 * (1 - g)} opacity={0.85} />
                <circle cx={x2} cy={y2} r={6 + 10 * g * (0.5 + 0.5 * Math.sin(f / 6 + i))} fill={C.cyan} opacity={0.18 * g} />
                <circle cx={x2} cy={y2} r={6} fill={C.cyan} opacity={g} />
              </g>
            );
          })}
          <circle cx={hub.x} cy={hub.y} r={11} fill={C.gold} />
          <circle cx={hub.x} cy={hub.y} r={22 + 6 * Math.sin(f / 7)} fill="none" stroke={C.gold} strokeOpacity={0.5} />
          <text x={hub.x + 18} y={hub.y + 36} fill={C.gold} fontFamily={PLEX} fontSize={15} letterSpacing={3}>DUBAI · RIYADAX9</text>
          {/* pilot-film scanner sweep */}
          <rect x={scan} y={MY} width={3} height={MH} fill={C.cyan} opacity={scan > MX && scan < MX + MW - 2 ? 0.9 : 0} style={{filter: `drop-shadow(0 0 14px ${C.cyan})`}} />
          <text x={MX} y={MY + MH + 30} fill={W40} fontFamily={PLEX} fontSize={13} letterSpacing={3}>MENA · SOUTH ASIA · BEYOND — SCHEMATIC</text>
        </svg>
        <div style={{position: 'absolute', left: 1240, right: 120, top: 280}}>
          {[{n: count(10, b2 + 14), suf: '⁹+', l: 'STORIES ANALYZED', pre: ''}, {n: count(120, b2 + 24), suf: '+', l: 'SIGNAL SOURCES', pre: ''}, {n: count(48, b2 + 34), suf: '', l: 'CULTURAL MARKETS', pre: ''}].map((s, i) => (
            <div key={s.l} style={{padding: '22px 0', borderBottom: `1px solid ${WLINE}`, opacity: fade(f, b2 + 14 + i * 10)}}>
              <div style={{fontFamily: COND, fontWeight: 700, fontSize: 110, lineHeight: 1, color: '#fff'}}>{s.n}{s.suf === '⁹+' ? <><span style={{fontSize: 56, verticalAlign: 'top', position: 'relative', top: 8, color: '#fff'}}>9</span><span style={{color: C.cyan}}>+</span></> : <span style={{color: C.cyan}}>{s.suf}</span>}</div>
              <div style={{fontFamily: PLEX, fontSize: 16, letterSpacing: 5, color: W60, marginTop: 8}}>{s.l}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </DocScene>
  );
};

// ======================= 6 · CLOSE — end card over the glowing constellation =======================
export const BriefClose: React.FC<{dur: number; p: DocProps; v: number}> = ({dur, p, v}) => {
  const f = useCurrentFrame();
  const g = spring({frame: f, fps: 30, config: {damping: 200}});
  const wide = interpolate(f, [0, dur], [0.08, 0.2]);
  return (
    <DocScene dur={dur + 8} noBrand>
      <Constellation intensity={0.5} labels glow={0.6 * g} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.72) 45%, rgba(8,8,8,0.8) 100%)'}} />
      <div style={{position: 'absolute', left: 0, top: 290, width: 600, height: 440}}>
        <SliceReveal at={0} w={600} h={440} n={4}><Plate kind={PLATES[(v + 1) % PLATES.length]} w={600} h={440} id="bc" push={f / dur} tint={0.45} /></SliceReveal>
      </div>
      <Hairlines x={650} y={230} h={620} at={6} />
      <div style={{position: 'absolute', left: 740, right: 100, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: PLEX, fontSize: 22, letterSpacing: 8, color: W60, opacity: fade(f, 2)}}>BUILT FOR {p.audience.toUpperCase()}</div>
        <div style={{fontFamily: HEAD, fontSize: 140, fontWeight: 700, lineHeight: 1, color: '#fff', letterSpacing: `${wide}em`, textTransform: 'uppercase', marginTop: 18, whiteSpace: 'nowrap', opacity: fade(f, 6)}}>Cultural</div>
        <div style={{fontFamily: HEAD, fontSize: 140, fontWeight: 700, lineHeight: 1, color: C.cyan, letterSpacing: `${wide}em`, textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: fade(f, 12)}}>Lens</div>
        <div style={{fontFamily: HEAD, fontSize: 30, color: W60, marginTop: 30, opacity: fade(f, 26)}}>
          Conventional analytics measure views. <span style={{color: '#fff', fontWeight: 600}}>Cultural Lens measures influence.</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 34, opacity: fade(f, 40)}}>
          <Pill text="Powered by RiyadaX9" bg={rgba(C.gold, 0.14)} fg={C.gold} size={17} style={{border: `1.5px solid ${C.gold}`}} />
          <div style={{fontFamily: HEAD, fontSize: 32, fontWeight: 600, color: '#fff'}}>lens.communities.company</div>
        </div>
        <div style={{fontFamily: BODY, fontSize: 21, color: W40, marginTop: 20, opacity: fade(f, 60)}}>AI analysis partners across the Middle East</div>
      </div>
      <div style={{position: 'absolute', left: 740, bottom: 56, display: 'flex', alignItems: 'center', gap: 14, fontFamily: PLEX, fontSize: 15, letterSpacing: 5, color: C.cyan, opacity: fade(f, 70)}}>
        <span style={{width: 40, height: 2, background: C.cyan}} />FOLLOW FOR MORE CULTURAL INTELLIGENCE
      </div>
    </DocScene>
  );
};
