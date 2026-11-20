#!/usr/bin/env python3
"""
Berechnet Pin-Plätze für eine Landschaftsgrafik: nur freie Wiese, nicht auf Wegen, im Wasser, auf Brücken,
Bäumen, Büschen oder Steinen. Benötigt Python 3 mit Pillow und numpy.

Aufruf:  python3 tools/landscape_slots.py public/friedhofslandschaft.webp [Anzahl] [Radius] [Abstand]
Ausgabe: JSON-Liste [[x, y], ...] in Bildpixeln (Reihenfolge: von der Mitte nach außen) und Vorschau tools/slots_preview.png.
Die Werte gehören in src/lib/slots.ts; Bildgröße in SCENE (src/lib/config.ts).
Die Farbschwellen sind auf die helle Wiese der aktuellen Grafik abgestimmt und müssen bei anderem Stil angepasst werden.
"""
import json, sys
import numpy as np
from PIL import Image, ImageDraw

src = sys.argv[1]
N = int(sys.argv[2]) if len(sys.argv) > 2 else 24
R = float(sys.argv[3]) if len(sys.argv) > 3 else 46      # freier Radius um den Pin-Mittelpunkt (px)
MIN = float(sys.argv[4]) if len(sys.argv) > 4 else 104   # Mindestabstand zwischen Pins (px)
S = 4

im = Image.open(src).convert('RGB'); W, H = im.size
a = np.asarray(im.resize((W // S, H // S), Image.BILINEAR)).astype(float) / 255
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx = a.max(-1); d = mx - a.min(-1) + 1e-9
h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
s = d / (mx + 1e-9)
meadow = (h >= 68) & (h <= 80) & (s > 0.7) & (mx >= 0.72)          # helle, freie Wiese
path = (h >= 20) & (h <= 48) & (s > 0.45) & (mx > 0.55)            # Wege und Holz der Brücken
water = (h >= 170) & (h <= 215) & (s > 0.4)

def dil(m, k):
    out = m.copy()
    for dy in range(-k, k + 1):
        for dx in range(-k, k + 1):
            if dx * dx + dy * dy <= k * k:
                out |= np.roll(np.roll(m, dy, 0), dx, 1)
    return out

meadow = ~dil(~dil(meadow, 2), 2)                                   # Blümchen u. Ä. schließen
forbid = ~meadow | path | water

# Abstand zum nächsten Hindernis (Chamfer)
hh, ww = forbid.shape; D = np.where(forbid, 0.0, 1e9)
for y in range(hh):
    for x in range(ww):
        v = D[y, x]
        if v == 0: continue
        if y > 0: v = min(v, D[y-1, x] + 1)
        if x > 0: v = min(v, D[y, x-1] + 1)
        if y > 0 and x > 0: v = min(v, D[y-1, x-1] + 1.414)
        if y > 0 and x < ww - 1: v = min(v, D[y-1, x+1] + 1.414)
        D[y, x] = v
for y in range(hh - 1, -1, -1):
    for x in range(ww - 1, -1, -1):
        v = D[y, x]
        if v == 0: continue
        if y < hh - 1: v = min(v, D[y+1, x] + 1)
        if x < ww - 1: v = min(v, D[y, x+1] + 1)
        if y < hh - 1 and x < ww - 1: v = min(v, D[y+1, x+1] + 1.414)
        if y < hh - 1 and x > 0: v = min(v, D[y+1, x-1] + 1.414)
        D[y, x] = v
D *= S

# Dichte Packung spaltenweise; Randbereiche und ferne Hügel (oben) auslassen
ys, xs = np.where(D >= R)
cand = [(x * S + S / 2, y * S + S / 2) for y, x in zip(ys, xs) if 0.2 * H <= y * S <= 0.91 * H and 70 <= x * S <= W - 70]
cand.sort(key=lambda p: (round(p[0] / 20), p[1]))
ch = []
for x, y in cand:
    if all(max(abs(x - cx) / MIN, abs(y - cy) / (MIN * 1.15)) >= 1 for cx, cy in ch):
        ch.append((x, y))
if len(ch) < N:
    sys.exit(f'Nur {len(ch)} Plätze gefunden (gewünscht {N}). Radius oder Abstand verkleinern.')
ch = ch[:N]
ch.sort(key=lambda p: (p[0] - W * 0.5) ** 2 + ((p[1] - H * 0.58) * 1.4) ** 2)

prev = im.copy(); dr = ImageDraw.Draw(prev)
for i, (x, y) in enumerate(ch):
    dr.ellipse([x-47, y-47, x+47, y+47], fill=(120, 160, 130), outline=(255, 255, 255), width=5)
    dr.text((x-6, y-6), str(i + 1), fill=(255, 255, 255))
    dr.rounded_rectangle([x-36, y+52, x+36, y+70], radius=8, fill=(255, 255, 255))
prev.save('tools/slots_preview.png')
print(json.dumps([[int(round(x)), int(round(y))] for x, y in ch]))
