"""Builds the three picture files used by the animated "Built for Dubai and the Gulf" band.

    python3 tools/make-gulf.py  path/to/photo.png  [site/assets/img]

Writes:
    dubai-gulf.webp       the photo
    dubai-gulf-m1.png     masks   R = water   G = fountains   B = glowing light streaks
    dubai-gulf-m2.png     masks   R = sky     G = swaying leaves   B = depth (0 far ... 1 near)

The regions were placed by hand for the photo supplied by the client (1877 x 838 px). If the photo is
replaced, the coordinates in the REGIONS block below have to be adjusted to the new picture.
Needs: python3, numpy, opencv-python.
"""
import sys, os
import numpy as np
import cv2

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else 'site/assets/img'
os.makedirs(out, exist_ok=True)
img = cv2.imread(src, cv2.IMREAD_COLOR)
H, W = img.shape[:2]
RW, RH = 1877.0, 838.0                       # the coordinates below are written for this size
sx, sy = W / RW, H / RH

def P(pts):                                   # reference coordinates -> this image
    return np.array([[x * sx, y * sy] for x, y in pts], np.int32)

def fill_poly(pts, val=1.0):
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [P(pts)], val)
    return m

def fill_ellipse(cx, cy, ax, ay, val=1.0):
    m = np.zeros((H, W), np.float32)
    cv2.ellipse(m, (int(cx * sx), int(cy * sy)), (int(ax * sx), int(ay * sy)), 0, 0, 360, val, -1)
    return m

def fill_box(x0, y0, x1, y1, val=1.0):
    m = np.zeros((H, W), np.float32)
    m[int(y0 * sy):int(y1 * sy), int(x0 * sx):int(x1 * sx)] = val
    return m

def blur(m, s):
    return cv2.GaussianBlur(m, (0, 0), s * sx)

# ---------- colour helpers ----------
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
hue = hsv[..., 0] * 360.0 / 255.0
sat = hsv[..., 1] / 255.0
val = hsv[..., 2] / 255.0
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
yy = np.repeat(np.arange(H, dtype=np.float32)[:, None], W, 1) / sy           # y in reference pixels
xx = np.repeat(np.arange(W, dtype=np.float32)[None, :], H, 0) / sx

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

# ---------- REGIONS (reference pixels) ----------
MEN = [(387, 640, 56, 132), (498, 640, 64, 128), (602, 648, 58, 138)]                       # three men
BOATS = {'y1': (680, 572, 912, 664), 'y2': (1242, 604, 1480, 696), 'y3': (1542, 614, 1660, 664), 'dh': (1722, 640, 1860, 696)}
FOUNT = [(730, 470, 850, 592), (1020, 505, 1190, 650), (1228, 470, 1342, 612), (1458, 490, 1552, 642)]
DECK_EDGE = [(292, 684), (433, 705), (542, 722), (658, 751), (760, 772), (880, 800), (983, 833), (1000, 838)]
SHORE_L = [(275, 613), (650, 607), (1000, 603), (1560, 608), (1877, 632)]
PILLAR = [(80, 0), (232, 0), (214, 300), (188, 620), (84, 620)]

# ---------- boats (needed by several masks) ----------
boats = np.zeros((H, W), np.float32)
for (x0, y0, x1, y1) in BOATS.values():
    boats = np.maximum(boats, fill_box(x0, y0, x1, y1 + 36))        # includes the reflection below the hull
boats = blur(boats, 6)
men = np.zeros((H, W), np.float32)
for (cx, cy, ax, ay) in MEN:
    men = np.maximum(men, fill_ellipse(cx, cy, ax + 6, ay + 6))
men = np.maximum(men, fill_poly([(520, 560), (566, 548), (568, 562), (528, 600)]))            # the pointing arm
men = blur(men, 3)

# ---------- M1.R  water ----------
water_poly = SHORE_L + [(1877, 838)] + [(x, y) for x, y in reversed(DECK_EDGE)] + [(275, 640)]
water = fill_poly(water_poly)
rail = np.zeros((H, W), np.float32)
top = 650 + (xx - 650) * 0.0945                                       # the slanted top rail: keep it still
rail = (np.abs(yy - top) < 11).astype(np.float32) * (xx > 640)
rail = np.maximum(rail, (np.abs(yy - (top + 24)) < 7).astype(np.float32) * (xx > 640))
water = water * (1 - blur(rail, 1.5)) * (1 - np.clip(men * 1.2, 0, 1)) * (1 - 0.6 * boats)
water = blur(water, 3)
# ---------- M1.G  fountains ----------
bright = smooth(0.52, 0.78, val) * (1 - smooth(0.45, 0.85, sat))
fz = np.zeros((H, W), np.float32)
for (x0, y0, x1, y1) in FOUNT:
    fz = np.maximum(fz, fill_box(x0, y0, x1, y1))
fz = blur(fz, 6)
fountain = np.clip(fz * (0.05 + 1.05 * bright), 0, 1) * (1 - 0.8 * boats)
fountain = blur(fountain, 1.5)
# ---------- M1.B  glowing streaks, LED edges, lit windows in the city ----------
blue = ((hue > 195) & (hue < 250) & (sat > 0.28) & (val > 0.68)).astype(np.float32)
core = ((val > 0.86) & (sat < 0.35)).astype(np.float32)
near = cv2.dilate(blue, np.ones((5, 5), np.uint8))
streak = np.clip(blue + core * near, 0, 1)
streak *= (yy < 596) * (1 - fz) * 1.0
streak *= (xx > 330)
logo = fill_box(905, 212, 1072, 372)                                      # the 818 AI lettering on the Burj stays steady
streak *= 1 - 0.7 * blur(logo, 4)
streak = blur(streak, 1.2)
streak = np.clip(streak * 1.4, 0, 1)

# ---------- M2.R  sky (clouds drift a little) ----------
g = gray
mean = cv2.blur(g, (9, 9)); mean2 = cv2.blur(g * g, (9, 9))
std = np.sqrt(np.maximum(mean2 - mean * mean, 0))
cand = ((std < 7.5) & (g < 96) & (yy < 575) & (xx > 300) & ~((xx < 430) & (yy < 182)) & (cv2.dilate(blue, np.ones((9, 9), np.uint8)) < 0.5)).astype(np.uint8)
cand = cv2.morphologyEx(cand, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab = cv2.connectedComponents(cand)
sky = np.zeros((H, W), np.float32)
topband = lab[: int(40 * sy), :]
for k in np.unique(topband):
    if k == 0: continue
    if (lab == k).sum() > 4000: sky[lab == k] = 1.0
burj = fill_poly([(962, 0), (1012, 0), (1052, 150), (1078, 230), (1084, 570), (896, 570), (902, 230), (934, 150)])
sky = sky * (1 - blur(cv2.dilate(burj, np.ones((15, 15), np.uint8)), 4))
sky = blur(cv2.morphologyEx(sky, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)), 7)
sky = np.clip(sky * 1.15, 0, 1)

# ---------- M2.G  leaves and plants that sway ----------
leaf = ((hue > 20) & (hue < 190) & (sat > 0.18) & (val > 0.08)).astype(np.float32)
sway = np.zeros((H, W), np.float32)
palm_tl = fill_box(0, 0, 332, 346) * (1 - fill_poly(PILLAR)) * (1 - fill_box(100, 0, 420, 178))
sway = np.maximum(sway, palm_tl)
sway = np.maximum(sway, fill_box(150, 472, 264, 642))
sway = np.maximum(sway, 0.55 * fill_box(322, 684, 462, 746))
sway = np.maximum(sway, fill_box(0, 788, 300, 838))
sway = np.maximum(sway, fill_box(1788, 732, 1877, 838))
sway = blur(sway, 4) * blur(cv2.dilate(leaf, np.ones((3, 3), np.uint8)), 1.5)
sway = np.clip(sway * 1.5, 0, 1)

# ---------- M2.B  depth: 0 far ... 1 near ----------
depth = np.where(yy < 600, 0.05, 0.16 + 0.60 * np.power(np.clip((yy - 600) / 238.0, 0, 1), 1.25)).astype(np.float32)      # the whole skyline is one far plane (no shear)
def lay(d, mask, v):
    return d * (1 - mask) + v * mask
promenade = fill_box(1450, 430, 1877, 640);   depth = lay(depth, blur(promenade, 8), 0.12)
for key, v in (('y1', 0.27), ('y2', 0.36), ('y3', 0.22), ('dh', 0.32)):
    x0, y0, x1, y1 = BOATS[key]; depth = lay(depth, blur(fill_box(x0, y0, x1, y1), 5), v)
deck = fill_poly(DECK_EDGE + [(0, 838), (0, 690)])
floor_d = (0.50 + 0.50 * np.clip((yy - 650) / 188.0, 0, 1)).astype(np.float32)
depth = lay(depth, blur(deck, 5), floor_d)
rail_zone = ((np.abs(yy - top) < 14) & (xx > 275)).astype(np.float32); depth = lay(depth, blur(rail_zone, 3), 0.50)
depth = lay(depth, blur(fill_box(0, 628, 292, 772), 5), 0.86)                        # sofa
depth = lay(depth, blur(fill_ellipse(240, 790, 180, 60), 5), 0.93)                   # table
depth = lay(depth, blur(fill_box(180, 678, 236, 742), 3), 0.90)                      # lantern
depth = lay(depth, blur(fill_poly(PILLAR), 5), 0.84)                                 # pillar
depth = lay(depth, blur(fill_box(80, 0, 420, 176), 6), 0.95)                         # roof overhang
depth = lay(depth, blur(palm_tl * (1 - fill_poly(PILLAR)), 4), 0.92)                 # big palm
depth = lay(depth, blur(fill_box(150, 472, 264, 642), 4), 0.80)
depth = lay(depth, blur(fill_box(322, 684, 462, 746), 3), 0.78)
depth = lay(depth, blur(fill_box(0, 788, 300, 838), 3), 0.98)
depth = lay(depth, blur(fill_box(1788, 732, 1877, 838), 3), 0.98)
# the three men: an accurate cut-out of their silhouettes (GrabCut), so the buildings right behind them stay on the far plane
def men_silhouette():
    mask = np.full((H, W), cv2.GC_BGD, np.uint8)
    for (cx, cy, ax, ay) in MEN:
        c = (int(cx * sx), int(cy * sy))
        for (da, dd, label) in ((22, 22, cv2.GC_PR_BGD), (4, 4, cv2.GC_PR_FGD), (-26, -40, cv2.GC_FGD)):
            e = np.zeros((H, W), np.uint8)
            cv2.ellipse(e, c, (int(max(ax + da, 8) * sx), int(max(ay + dd, 8) * sy)), 0, 0, 360, 1, -1)
            mask[e > 0] = label
    arm = np.zeros((H, W), np.uint8); cv2.fillPoly(arm, [P([(520, 560), (566, 548), (568, 562), (528, 600)])], 1); mask[arm > 0] = cv2.GC_PR_FGD
    y0, y1, x0, x1 = int(430 * sy), H, int(260 * sx), int(740 * sx)
    sub = mask[y0:y1, x0:x1].copy()
    cv2.grabCut(img[y0:y1, x0:x1].copy(), sub, None, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_MASK)
    sil = np.zeros((H, W), np.float32); sil[y0:y1, x0:x1] = ((sub == cv2.GC_FGD) | (sub == cv2.GC_PR_FGD)).astype(np.float32)
    return cv2.GaussianBlur(sil, (0, 0), 1.2 * sx)
depth = lay(depth, men_silhouette(), 0.50)
depth = blur(depth, 3)       # soft but narrow edges

# ---------- write ----------
def chan(a): return np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8)
small = lambda a: cv2.resize(a, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
m1 = np.dstack([chan(small(streak)), chan(small(fountain)), chan(small(water))])        # BGR order = B,G,R
m2 = np.dstack([chan(small(depth)), chan(small(sway)), chan(small(sky))])
cv2.imwrite(os.path.join(out, 'dubai-gulf.webp'), img, [cv2.IMWRITE_WEBP_QUALITY, 84])
cv2.imwrite(os.path.join(out, 'dubai-gulf-m1.png'), m1, [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(os.path.join(out, 'dubai-gulf-m2.png'), m2, [cv2.IMWRITE_PNG_COMPRESSION, 9])
for f in ('dubai-gulf.webp', 'dubai-gulf-m1.png', 'dubai-gulf-m2.png'):
    print(f, os.path.getsize(os.path.join(out, f)) // 1024, 'KB')

# a picture to check the masks by eye (not shipped)
if os.environ.get('GULF_DEBUG'):
    dbg = os.environ['GULF_DEBUG']
    def over(a, color):
        o = img.astype(np.float32).copy(); c = np.array(color, np.float32)
        return np.clip(o * (1 - 0.7 * a[..., None]) + c * 0.7 * a[..., None], 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(dbg, 'm_water.png'), over(water, (255, 120, 40)))
    cv2.imwrite(os.path.join(dbg, 'm_fountain.png'), over(fountain, (60, 255, 255)))
    cv2.imwrite(os.path.join(dbg, 'm_streak.png'), over(streak, (80, 255, 80)))
    cv2.imwrite(os.path.join(dbg, 'm_sky.png'), over(sky, (255, 60, 255)))
    cv2.imwrite(os.path.join(dbg, 'm_sway.png'), over(sway, (60, 60, 255)))
    cv2.imwrite(os.path.join(dbg, 'm_depth.png'), chan(depth))
