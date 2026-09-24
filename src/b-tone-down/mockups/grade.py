#!/usr/bin/env python3
"""Tone-down grade for the Ghostex onboarding panels.

Nothing moves; only colour changes. The trick is a frequency split: the nebula is
low-frequency, UI accents (toggles, pills, buttons, dots) are high-frequency. We grade
the blurred base layer only and add the untouched detail back on top, so the shader
calms down while the toggle stays Ghostex-blue.

  - blue in the base layer is desaturated luma-preserving -> navy goes toward #0A0A0A
  - the base layer is dimmed: a little on the right (shader kept), hard on the left
  - left column gets a flat charcoal field with one soft directional light instead
  - fine grain + slight vignette to break the airbrushed-gradient look
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

SPLITS = {1: 759, 2: 801, 3: 796, 4: 727, 5: 793, 6: 816, 7: 756, 8: 777}

P = dict(
    blur=26.0, fine=5.0, prot_lo=0.008, prot_hi=0.038,                  # low/high frequency cut, px
    hue_lo=190.0, hue_hi=262.0,
    desat_right=0.52,           # how much blue is pulled out of the right-hand base
    desat_left=0.72,
    dim_right=0.70,             # base-layer brightness, right column (shader kept)
    dim_left=0.34,              # left column: clouds mostly gone
    trim_right=0.15, trim_left=0.26,
    grain=2.3,
    vignette=0.14,
)


def rgb_to_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn
    h = np.zeros_like(mx)
    nz = d > 1e-6
    idx = nz & (mx == r); h[idx] = ((g - b)[idx] / d[idx]) % 6
    idx = nz & (mx == g); h[idx] = ((b - r)[idx] / d[idx]) + 2
    idx = nz & (mx == b); h[idx] = ((r - g)[idx] / d[idx]) + 4
    h *= 60.0
    s = np.zeros_like(mx)
    m = mx > 1e-6
    s[m] = d[m] / mx[m]
    return h, s, mx


def smoothstep(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def luma(a):
    return (a * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(-1, keepdims=True)


def blue_mask(a):
    h, s, _ = rgb_to_hsv(np.clip(a, 0, 1))
    m = smoothstep(h, P['hue_lo'] - 20, P['hue_lo']) * (1 - smoothstep(h, P['hue_hi'], P['hue_hi'] + 20))
    return m * smoothstep(s, 0.10, 0.32)


def grade(path, split, out_path, seed=0):
    img = np.asarray(Image.open(path).convert('RGB'), np.float32) / 255.0
    H, W, _ = img.shape

    base = gaussian_filter(img, sigma=(P['blur'], P['blur'], 0), mode='nearest')

    xs = np.arange(W, dtype=np.float32)[None, :]
    ys = np.arange(H, dtype=np.float32)[:, None] / H
    side = np.repeat(smoothstep(xs, split - 6, split + 6), H, axis=0)   # 0 left, 1 right

    # ---- grade the base layer, then apply it as a per-channel ratio --------
    # Multiplicative keeps blacks black. `protect` finds anything with structure at a
    # small scale (toggles, pills, borders, glyph glows) by comparing a fine blur with a
    # coarse one -- the nebula looks the same at both scales, a toggle does not.
    mid = gaussian_filter(img, sigma=(P['fine'], P['fine'], 0), mode='nearest')
    contrast = np.abs(luma(mid) - luma(base))[..., 0]
    protect = smoothstep(contrast, P['prot_lo'], P['prot_hi'])
    protect = np.clip(gaussian_filter(protect, P['fine'] * 1.6, mode='nearest') * 1.35, 0, 1)

    bm = blue_mask(base)
    amt = bm * (P['desat_left'] + (P['desat_right'] - P['desat_left']) * side)
    g = base * (1 - amt[..., None]) + luma(base) * amt[..., None]

    dim = P['dim_left'] + (P['dim_right'] - P['dim_left']) * side
    g = g * (1 - bm[..., None]) + g * (dim * bm)[..., None]

    ratio = g / np.maximum(base, 2.0 / 255.0)
    w = blue_mask(img) * (1 - protect)
    img = img * (1 + (ratio - 1) * w[..., None])

    # ---- global blue trim: everything, accents included, just gently --------
    gd = blue_mask(img) * (P['trim_left'] + (P['trim_right'] - P['trim_left']) * side)
    img = img * (1 - gd[..., None]) + luma(img) * gd[..., None]

    # ---- left column: flat charcoal field + one soft light -----------------
    dark = 1 - smoothstep(luma(img)[..., 0], 0.03, 0.16)          # background only
    left = (1 - side) * dark
    field = (0.044 - 0.014 * ys)[..., None] * np.array([0.88, 0.95, 1.05], np.float32)
    gx, gy = (xs / W - 0.05), (ys - 0.06)
    glow = (np.exp(-((gx ** 2) / 0.10 + (gy ** 2) / 0.34)) * 0.026)[..., None] * np.array([0.5, 0.7, 1.0], np.float32)
    img = img + (field + glow) * left[..., None]

    # ---- grain + vignette --------------------------------------------------
    rng = np.random.default_rng(1000 + seed)
    n = rng.normal(0, P['grain'] / 255.0, (H, W, 1)).astype(np.float32)
    n = n * (0.4 + 0.6 * (1 - smoothstep(img.max(-1, keepdims=True), 0.05, 0.45)))
    img = img + n

    cx, cy = (xs / W - 0.5) * 2, (ys - 0.5) * 2
    r = np.sqrt(cx ** 2 * 0.9 + cy ** 2)
    img = img * (1 - P['vignette'] * smoothstep(r, 0.55, 1.35))[..., None]

    Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)).save(out_path)
    return out_path


if __name__ == '__main__':
    only = [int(x) for x in sys.argv[1:]] or sorted(SPLITS)
    for i in only:
        grade(f'/mnt/user-data/uploads/ghostex_panel_{i:02d}.png', SPLITS[i],
              f'/home/claude/work/out/ghostex_panel_{i:02d}.png', seed=i)
        print('wrote', i)
