# Cultural Lens — video execution styles

Lead videos are 50–90 s, 16:9, 1920×1080, graphics only (no third-party footage).

## Inspirations

| Source | What we take | Where it shows |
|---|---|---|
| **Pixonal** (pixonal.com) | Near-black canvas, long-exposure light trails, large centred grotesk statements, monospace "A + B + C" eyebrows, command-room dashboard panels, dark rounded cards | `command` style: hook, pain cards, "operating picture" solutions panel |
| **Lens site** (lens.communities.company) | Drifting signal constellation with mono labels, blue→cyan gradient, Space Grotesk | `constellation` style backdrop, brand chrome, close card |
| **RiyadaX9** | Gold accent reserved for the RiyadaX9 mark | "Powered by RiyadaX9" only |

## Segment colour themes
Background (#080808), fonts and the RiyadaX9 gold stay constant; the accent gradient changes per segment:
OTT streaming violet→orchid · broadcasting blue→cyan · film & TV production emerald→mint · kids/animation pink→peach · audience measurement indigo→periwinkle · digital media rose→orange · distribution sky→lime.

## Variety (no two consecutive videos look the same)
Each video derives a layout variant from its id: backdrop (light trails / constellation / signal waves), pain points (cards with sparklines / numbered risk-meter rows), solutions (command-room panel / hub graph), value scene backdrop (grid / waves).

## Two execution styles (alternate per lead)

1. **Command Room** (`style: "command"`) — light-trail backdrop, dashboard panels, live signal bars. Best for OTT/streaming, broadcasters, audience-measurement firms.
2. **Constellation** (`style: "constellation"`) — signal-network backdrop. Best for production houses, animation/kids, content studios.

## Scene grammar (fixed order)

1. **Cover / Hook** — frame 0 is a finished thumbnail: brand badge, eyebrow, headline, "FOR {AUDIENCE}" (e.g. FOR OTT PLATFORMS — never a brand name), live signal strip. No fade-in.
2. **Pain points** — 3 dark cards: mono signal label + trend line + title + detail.
3. **What Lens does** — 3 modules lighting up + live dashboard panel.
4. **Value / What you get** — the Lens pipeline from the site: segment inputs → six intelligence layers → segment outputs, plus Capacity · Deliverability · Profitability · Scalability tiles and the platform-scale strip.
5. **Model** — Analyse → Predict → Optimise → Produce → Measure + six segment benefits + a "from → to" line.
6. **Close** — "Built for {audience}" · Cultural Lens · lens.communities.company · Powered by RiyadaX9.

## Rules

- Pain points are segment-level and drawn only from public information. Never state that a named company has a problem it has not said publicly.
- No partner names (AI analysis partners across the Middle East only).
- Every unmeasured visual is illustrative (dashboards, trend lines, exposure meters). No invented numbers; no pilot/case-study references — videos sell the service.
- Voice: Kokoro `bm_george`, 1.15×. Score: tabla keherwa + tanpura + bansuri, ~15 dB under VO, sam on every cut.
- **No brand or company names** anywhere in the video or voiceover. Videos speak to a segment ("OTT platforms", "production houses"). Companies are addressed only in the social caption (names / @tags).

## Current look: "The Intelligence Brief" (default since Oct 2026)

Three registers mixed per scene, chosen for what each part of the script must do. Same props, script, Kokoro VO, timing and segment colours as before; `look: "classic"` in props renders the previous dashboard look.

| Scene | Register | Reference | What it shows |
|---|---|---|---|
| Hook | Documentary cover | Motion Array "Cinematic Documentary" | Paper/ink split, sliced monochrome plate, triple hairlines, headline + FOR {AUDIENCE} pill; frame 0 is the thumbnail |
| Pains | Documentary chapters | same | One chapter per pressure (outlined 01–03, strip-reveal plate, paper card, drifting keyword), synced to each VO sentence |
| Solutions | Editorial chapters | Motion Array "Creative History Opener" | Full-bleed tinted plate, huge condensed (Oswald) accent title, rotated module sidebar, ghost word, "answers pressure 0X" link |
| Value | Infographic posters | Motion Array "Infographic Posters" + pilot-film motion | 6-layer ring counter with inputs/outputs flowing; outcome rings; Dubai hub map with arcs, scanner sweep, count-up site figures |
| Model | Kinetic type | Cinematic Documentary | One huge step word at a time, then benefits grid and from → to band |
| Close | End card | Cinematic Documentary + pilot close | Plate block, hairlines, wide wordmark over glowing constellation, "measure views → measures influence" line, follow CTA |

Plates are generated graphics (light trails, halftone globe, signal waves, constellation, bars), monochrome with a segment duotone — still no third-party footage. The pilot film contributes motion only (constellation glow, scanner sweep, hub-and-arc map, spring counters), never its text or data. Code: `src/DocScenes.tsx`, `src/BriefScenes.tsx`.
