"""Traditional Pakistani-style score (tabla keherwa + tanpura drone + bansuri in Raag Kafi),
cycle restarts on every scene cut so each cut lands on 'sam'. Mixed low under the Kokoro VO."""
import json, os, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 44100
WORK = sys.argv[1]
tl = json.load(open(os.path.join(WORK, 'tl.json')))
TOTAL = (tl[-1][1] + tl[-1][2]) / 30
N = int(TOTAL * SR) + SR * 4
rng = np.random.default_rng(11)
bounds = [(k, a / 30, (a + d) / 30) for k, a, d in tl]

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)
def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def add(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i >= len(buf): return
    j = min(len(buf), i + len(sig)); buf[i:j] += sig[:j - i] * g

SA = 146.83  # D3
def sw(k):  # Kafi swaras relative to Sa (semitones)
    return {'S': 0, 'R': 2, 'g': 3, 'm': 5, 'P': 7, 'D': 9, 'n': 10}[k]
def hz(note, octv=0):
    return SA * 2 ** ((sw(note) + 12 * octv) / 12)

# ---------- tabla ----------
DAYAN = SA * 2  # tuned to Sa
def na(g=1.0):
    n = int(0.5 * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * DAYAN * h * t) * a * np.exp(-t / d) for h, a, d in [(1, 1, .22), (2, .55, .16), (3, .4, .12), (4, .25, .08), (5, .15, .06)])
    click = filt(rng.standard_normal(n), 'band', [2000, 7000]) * env(n, .0003, .006)
    return (x * np.minimum(1, t / .001) + click * .6) * .5 * g
def tin(g=1.0):
    n = int(0.6 * SR); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * DAYAN * t) + .3 * np.sin(2 * np.pi * DAYAN * 2 * t)) * np.exp(-t / .3)
    return x * np.minimum(1, t / .002) * .35 * g
def ka(g=1.0):
    n = int(0.06 * SR)
    return filt(rng.standard_normal(n), 'band', [600, 2500]) * env(n, .0005, .012) * .45 * g
def ge(g=1.0, glide=True):
    n = int(0.7 * SR); t = np.arange(n) / SR
    f = 82 + (28 * (1 - np.exp(-t / .12)) if glide else 0)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .25 * np.sin(2 * np.pi * np.cumsum(f * 2.1) / SR)
    return x * env(n, .002, .38) * .7 * g
def dha(g=1.0): return np.concatenate([na(g), np.zeros(int(.2 * SR))]) + np.pad(ge(g), (0, int(.0 * SR)))[:int(.7 * SR)].tolist() + [0] * 0 if False else _mix(na(g), ge(g))
def dhi(g=1.0): return _mix(tin(g), ge(g * .8))
def _mix(a, b):
    n = max(len(a), len(b)); o = np.zeros(n); o[:len(a)] += a; o[:len(b)] += b; return o
def manjira(g=1.0):
    n = int(1.2 * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t) for f in (2950, 4170, 5830, 7210)) / 4
    return x * env(n, .0005, .35) * .12 * g

BOLS = {'Dha': dha, 'Ge': lambda g=1: ge(g * .7), 'Na': na, 'Ti': lambda g=1: ka(g * 1.2), 'Ka': ka, 'Dhi': dhi, 'Tin': tin, 'Ta': lambda g=1: na(g * .8)}
KEHERWA = ['Dha', 'Ge', 'Na', 'Ti', 'Na', 'Ka', 'Dhi', 'Na']
ACC = [1.0, .55, .7, .45, .75, .4, .8, .55]
MATRA = 0.34  # seconds per beat (~176 bpm keherwa, madhya laya)

# ---------- tanpura ----------
def tanpura_pluck(f, dur=3.2):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for h in range(1, 14):
        jaw = 1 + .8 * np.clip(t / .6, 0, 1) * (h > 3)  # jawari: upper partials bloom
        x += np.sin(2 * np.pi * f * h * t + rng.random() * 6) / h ** 1.1 * jaw
    return x * env(n, .02, 1.6) * .09
def tanpura(buf, a, b):
    seq = [hz('P', -1), hz('S'), hz('S'), hz('S', -1)]
    t = a; i = 0
    while t < b:
        add(buf, tanpura_pluck(seq[i % 4]), t); t += MATRA * 2; i += 1

# ---------- bansuri ----------
def flute(f0, dur, f_prev=None):
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.full(n, f0)
    if f_prev:  # meend glide from previous note
        g = int(min(.18, dur * .4) * SR); f[:g] = f_prev + (f0 - f_prev) * (1 - np.cos(np.linspace(0, np.pi, g))) / 2
    vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .25) / .3, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    breath = filt(rng.standard_normal(n), 'band', [max(200, f0 * .8), f0 * 3]) * .12
    a = np.minimum(1, t / .07) * np.minimum(1, (dur - t) / .12)
    return (tone + breath) * a * .14
PHRASES = [
    [('S', 1, 1.2), ('n', 0, .5), ('D', 0, .5), ('P', 0, 1.6)],
    [('m', 0, .5), ('P', 0, .5), ('D', 0, .5), ('n', 0, .5), ('S', 1, 2.0)],
    [('R', 1, .6), ('g', 1, .9), ('R', 1, .5), ('S', 1, .6), ('n', 0, 1.6)],
    [('P', 0, .6), ('m', 0, .5), ('g', 0, .5), ('R', 0, .6), ('S', 0, 2.2)],
]
def bansuri(buf, t, idx):
    prev = None
    for note, o, d in PHRASES[idx % len(PHRASES)]:
        f = hz(note, o + 1)  # bansuri sits an octave above
        add(buf, flute(f, d + .1, prev), t); prev = f; t += d

tabla = np.zeros(N); drone = np.zeros(N); mel = np.zeros(N); perc = np.zeros(N)

# arrangement per scene: (tabla_level, manjira, bansuri_phrase or None, fills)
ARR = {
 'hook':      (0.0, 0, 0, 0),
 'pains':     (0.6, 1, None, 1),
 'solutions': (0.75, 1, 2, 1),
 'value':     (0.75, 1, 1, 1),
 'model':     (0.85, 1, None, 1),
 'close':     (0.0, 1, 3, 0),
}
for idx, (k, a, b) in enumerate(bounds):
    lvl, man, phr, fills = ARR[k]
    tanpura(drone, a, b)
    # sam accent on the cut (except very start)
    if idx > 0:
        add(perc, ge(1.0), a, .9); add(perc, manjira(1.0), a, 1.0)
    if lvl > 0:
        t = a; m = 0
        last_cycle_start = b - 8 * MATRA
        while t < b - 0.05:
            bol = KEHERWA[m % 8]
            # roll (tirakita) in the last 2 matras before the next cut
            if fills and b - t <= 2 * MATRA + 1e-6 and idx < len(bounds) - 1:
                for q in range(4): add(tabla, ka(1.1) if q % 2 else na(.7), t + q * MATRA / 2, lvl)
                t += 2 * MATRA; m += 2; continue
            add(tabla, BOLS[bol](ACC[m % 8]), t, lvl)
            if man and m % 8 == 0: add(perc, manjira(.6), t)
            t += MATRA; m += 1
    if phr is not None:
        bansuri(mel, a + (0.2 if k != 'close' else 0.6), phr)
# opening alaap on bansuri over the drone
bansuri(mel, 0.3, 0)

# final tihai landing on the close-card reveal
ka_, ca, cb = bounds[-1]
tihai_end = ca + 0.9
for r in range(3):
    base = tihai_end - (3 - r) * 3 * MATRA * 0.66
    for q, bl in enumerate(['Dha', 'Ge', 'Na']):
        add(tabla, BOLS[bl](1.0), base + q * MATRA * 0.66, .8)
add(perc, dha(1.2), tihai_end, .9); add(perc, manjira(1.4), tihai_end)

music = tabla * 1.0 + drone * 0.9 + mel * 1.0 + perc * 0.8
music = music[:N]

# ---- VO ----
vo = np.zeros(N)
for k, a, d in tl:
    x, sr = sf.read(os.path.join(WORK, f'vo_{k}.wav'))
    add(vo, resample_poly(x, SR, sr), a / 30 + (0.4 if k == 'hook' else 0))

# stronger sidechain duck under speech
e = np.convolve(np.abs(vo), np.ones(int(.15 * SR)) / int(.15 * SR), mode='same')
duck = 1 - 0.6 * np.clip(e / 0.025, 0, 1)
duck = np.convolve(duck, np.ones(int(.08 * SR)) / int(.08 * SR), mode='same')
music *= duck
music /= np.max(np.abs(music)) + 1e-9
end = int(TOTAL * SR)
mix = music * 0.20 + vo * 0.95
fo = int(1.2 * SR); mix[end - fo:end] *= np.linspace(1, 0, fo); mix = mix[:end]
mix /= max(1.0, np.max(np.abs(mix)) / 0.95)
sf.write(os.path.join(WORK, 'mix.wav'), np.stack([mix, mix], 1), SR)
v = vo[:end] * .95; m_ = music[:end] * .2
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
for k, a, b in bounds:
    s = slice(int(a * SR), int(b * SR)); print(f'{k:12s} VO {db(v[s]):6.1f}  music {db(m_[s]):6.1f}')
