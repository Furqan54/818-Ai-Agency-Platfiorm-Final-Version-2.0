"""Turns the original PNG pictures into small WebP files for the website.
Run:  python3 tools/make-images.py   (needs Pillow)"""
from PIL import Image
import os, sys
# usage: python3 tools/make-images.py /folder/with/your/original/pngs
A = (sys.argv[1].rstrip("/") + "/") if len(sys.argv) > 1 else '/mnt/user-data/attachments/4b43cf3c-d346-53d1-b42e-3ef8cfd6d46c/'
OUT = os.path.join(os.path.dirname(__file__), '..', 'site', 'assets', 'img')
os.makedirs(OUT, exist_ok=True)
FILES = {                       # name: (source file, max width)
  'ai-receptionist':  ('8cea9a53-image.png', 1600),
  'ai-solutions':     ('931a6bc5-image.png', 1600),
  'ai-automation':    ('d1821e3d-image.png', 1500),
  'ai-agents':        ('4dc4d953-image.png', 1600),
  'custom-software':  ('870c3750-image.png', 1600),
  'web-development':  ('6946e0c1-image.png', 1600),
  'crm-integrations': ('4bbcded8-image.png', 1600),
  'crm-dashboard':    ('eca5c17f-image.png', 1100),
  'about-hero':       ('fba98697-image.png', 1944),
  'lets-build':       ('b39aa54a-image.png', 1916),
  'project-gtp':      ('10d7cb81-image.png', 1000),
  'project-cyberxsoft': ('d90cb4cf-image.png', 1200),
}
for name, (src, mw) in FILES.items():
    im = Image.open(A + src).convert('RGB')
    if im.width > mw:
        im = im.resize((mw, round(im.height * mw / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, name + '.webp')
    im.save(p, 'WEBP', quality=80, method=6)
    print(name, im.size, os.path.getsize(p) // 1024, 'KB')
