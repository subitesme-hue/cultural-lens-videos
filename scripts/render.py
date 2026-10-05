"""Render one Cultural Lens lead video from a props JSON.

Usage: python3 scripts/render.py props.json [out/video.mp4]
Steps: Kokoro voiceover per scene -> timings -> Remotion render (silent) -> score + mix -> mux (-14 LUFS).
Env: KOKORO_DIR (model files), BROWSER_EXECUTABLE (optional Chrome for Remotion), VOICE (default bm_george).
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
props_path = sys.argv[1]
out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'out', 'video.mp4')
work = os.path.join(ROOT, 'out', 'work'); os.makedirs(work, exist_ok=True)
KOKORO_DIR = os.environ.get('KOKORO_DIR', os.path.join(ROOT, 'models'))
VOICE = os.environ.get('VOICE', 'bm_george')
SPEED = float(os.environ.get('VOICE_SPEED', '1.15'))

props = json.load(open(props_path, encoding='utf-8'))
spoken = props.get('audience_spoken') or props['audience']

# Model + close lines are fixed and segment-level (no brand names); the value line comes from the script
# (falls back to a generic capability line so older props still render).
vo = dict(props['vo'])
vo.setdefault('value', "From raw signal to decision support: six intelligence layers turn content, scripts and conversations "
                       "into executive reports, audience maps and forecasts, at any scale.")
vo['model'] = "Analyse, predict, optimise, produce, measure. Lower risk, stronger retention, and stories that travel."
vo['close'] = f"Built for {spoken}. That's the power of Cultural Lens, powered by Riyada X nine."
ORDER = ['hook', 'pains', 'solutions', 'value', 'model', 'close']

# ---- 1. voiceover ----
from kokoro_onnx import Kokoro
k = Kokoro(os.path.join(KOKORO_DIR, 'kokoro-v1.0.onnx'), os.path.join(KOKORO_DIR, 'voices-v1.0.bin'))
timing = {}
for key in ORDER:
    a, sr = k.create(vo[key], voice=VOICE, speed=SPEED, lang='en-gb' if VOICE.startswith('b') else 'en-us')
    e = np.abs(a) > 0.01; i = int(np.argmax(e)); j = len(a) - int(np.argmax(e[::-1]))
    a = a[max(0, i - int(.05 * sr)):min(len(a), j + int(.1 * sr))]
    sf.write(os.path.join(work, f'vo_{key}.wav'), a, sr)
    timing[key] = round(len(a) / sr, 2)
total_vo = sum(timing.values())
print('VO timing', timing, 'total', round(total_vo, 1))
if total_vo > 86:
    raise SystemExit(f'Voiceover too long ({total_vo:.1f}s > 86s); shorten the script.')

props['timing'] = timing
render_props = os.path.join(work, 'props_render.json')
json.dump(props, open(render_props, 'w', encoding='utf-8'), ensure_ascii=False)

# timeline (must match src/LeadVideo.tsx timelineFor)
LEAD, GAP, HOLD, FPS = 0.4, 0.25, 1.8, 30
tl, t = [], 0.0
for n, key in enumerate(ORDER):
    d = (LEAD if n == 0 else 0) + timing[key] + (HOLD if n == len(ORDER) - 1 else GAP)
    tl.append([key, round(t * FPS), round(d * FPS)]); t += d
json.dump(tl, open(os.path.join(work, 'tl.json'), 'w'))

# ---- 2. Remotion render (silent) ----
silent = os.path.join(work, 'silent.mp4')
cmd = ['npx', 'remotion', 'render', 'src/index.tsx', 'LensLead', silent, f'--props={render_props}', '--codec=h264', '--crf=18', '--log=error']
if os.environ.get('BROWSER_EXECUTABLE'):
    cmd.append(f"--browser-executable={os.environ['BROWSER_EXECUTABLE']}")
subprocess.run(cmd, cwd=ROOT, check=True)

# ---- 3. score + mix ----
subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'score.py'), work], check=True)

# ---- 4. mux ----
os.makedirs(os.path.dirname(out_path), exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', silent, '-i', os.path.join(work, 'mix.wav'), '-map', '0:v', '-map', '1:a',
                '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                '-shortest', '-movflags', '+faststart', out_path], check=True)
# cover image (frame 0) for reference / manual thumbnail use
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '0.5', '-i', out_path, '-frames:v', '1', out_path.replace('.mp4', '_cover.jpg')], check=True)
print('done', out_path, 'duration', round(t, 1))
