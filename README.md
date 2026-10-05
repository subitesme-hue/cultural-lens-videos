# cultural-lens-videos

Separate render pipeline for RiyadaX9 **Cultural Lens** lead videos (independent of `history-shorts`).

- `src/` — Remotion template (`LensLead` composition), styles in `STYLE.md`
- `scripts/render.py` — Kokoro VO → Remotion → score (`scripts/score.py`) → mux
- `.github/workflows/render-lead.yml` — `workflow_dispatch` with `props` + `tag`; publishes `video.mp4` + `video_cover.jpg` to a GitHub release with that tag
- n8n workflow "Cultural Lens — Lead Video Pipeline" qualifies leads, dispatches renders and posts via PostEverywhere

Local test: `python3 scripts/render.py props.sample.json out/sample.mp4` (needs `models/` with Kokoro files).
