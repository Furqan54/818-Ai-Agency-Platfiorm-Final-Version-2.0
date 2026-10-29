# 818 AI Agency — 3D website

A complete multi-page website in plain **HTML, CSS and JavaScript**, with **three.js** for the 3D.
No React, no database, no server code. The finished site is just static files in the `site/` folder.

```
Home · About · Services · Contact
Services / AI Receptionist · AI Solutions · AI Automation · AI Tools & Agents
           Custom Software · Web Development · CRM & Integrations
```

## Open it

The built site is already in `site/`.

- **Quick look:** double-click `site/index.html`. Everything (three.js included) is bundled into one file, so it works without a server.
- **Local server:** `npm install`, then `npm start`, then open http://localhost:8818

## Change it

You only need to edit text in **one file**: `src/data/site.js`.

| What | Where in `src/data/site.js` |
| --- | --- |
| Email, WhatsApp number, form endpoint | `site` at the top |
| The 7 services (titles, text, steps, deliverables) | `services` |
| Guide to Pakistan / CyberXSoft cards and links | `services[…].projects` (web-development) |
| About page story slides | `stories` |
| Countries strip | `regions` |

After editing, rebuild:

```
npm install        # first time only
npm run build      # rewrites everything in site/
npm run watch      # rebuilds on every save
```

### Things to fill in before going live

1. **Email** — `site.email` is a placeholder (`hello@818ai.com`).
2. **WhatsApp** — `site.whatsapp` is empty. Add digits only, with country code, e.g. `971501234567`. A WhatsApp link then appears in the footer and contact page.
3. **Contact form** — until `site.formEndpoint` is set, the form opens the visitor's email app with the message filled in. To send straight to you, paste a form service URL (Formspree, Web3Forms, your own endpoint) into `formEndpoint`; the form then POSTs JSON to it.
4. **Guide to Pakistan link** — `url` is empty, so that card shows without a link.
5. **Arabic text** — the greeting, the receptionist demo and the "Built for Dubai" band include Arabic. Please have a native speaker confirm the wording.

## Pictures

- All pictures are already optimised (WebP) in `site/assets/img/`. To swap one, save a new WebP of about 1600 px wide under the same file name there. `tools/make-images.py` shows how the originals were converted (point it at a folder of your PNGs).
- **Background:** `tools/bg.jpg` is the Dubai night image with the 818 logo. To change it, replace that file and run `python3 tools/make-bg.py` (it embeds the picture in `site/assets/bg-image.js` so it also loads from a double-click). Then `npm run build`.
- `site/assets/img/logo.jpg` is the logo used in the header and as the browser tab icon.

## How the 3D works

One fixed WebGL canvas sits behind the whole page:

1. It draws the **Dubai night background** with light streams flowing out of the logo.
2. It then draws each 3D scene inside its own box on the page: the 3D 818 mark, the orbit hubs (About, Services), the Dubai skyline band above the footer and the floating glass cubes on service pages.

On top of that, plain CSS and JavaScript add the card fly-ins, hover tilt, 3D picture frames, the sticky card stack, the coverflow sliders, magnetic buttons and the smooth scroll (Lenis).

Performance: one animation loop, only visible scenes are drawn, pixel ratio is capped, and the background resolution lowers itself if a device is slow. If WebGL is unavailable the site falls back to a static background image and stays fully usable. `prefers-reduced-motion` is respected.

```
src/
  data/site.js          all the words
  templates/            page templates (pages.js), header/footer (partials.js), icons
  styles.css            all styling
  js/main.js            starts everything
  js/core/              scroll + animation loop
  js/fx/                DOM effects (reveal, tilt, sliders, chat, form …)
  js/gl/                three.js scenes (backdrop, logo, orbit hub, skyline, hero fx)
build.mjs               generates site/*.html and bundles JS/CSS
serve.mjs               tiny local server
```

## Put it online

Upload the contents of `site/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, or normal web hosting). There is nothing to run on the server.
