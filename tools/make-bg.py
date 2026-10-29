"""Turns tools/bg.jpg (the Dubai night picture) into site/assets/bg-image.js (a data URI).
Why: browsers refuse to let WebGL read a local image file, but they accept embedded data, so the
background also works when you open the pages by double-click.
Run again after replacing bg.jpg:   python3 tools/make-bg.py"""
import base64, pathlib
here = pathlib.Path(__file__).parent
data = base64.b64encode((here / 'bg.jpg').read_bytes()).decode()
out = here.parent / 'site' / 'assets' / 'bg-image.js'
out.write_text('window.BG_IMAGE = "data:image/jpeg;base64,' + data + '";\n')
print(out, len(data) // 1024, 'KB')
