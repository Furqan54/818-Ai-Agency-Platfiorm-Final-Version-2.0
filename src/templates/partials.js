/* Pieces that appear on every page: <head>, background layers, menu, footer, Dubai band. */
import { site, services, regions } from '../data/site.js';
import { sprite, icon } from './icons.js';
import { seoHead, iconLinks } from './seo.js';

/* "?v=abc123" added to app.js, styles.css and bg-image.js. build.mjs fills it in from the file contents,
   so a visitor's browser can keep these files for a long time and still gets the new one right after every change. */
const FONTS = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&family=Cairo:wght@600;700&display=swap';
const ver = f => (globalThis.ASSET_VER && globalThis.ASSET_VER[f] ? `?v=${globalThis.ASSET_VER[f]}` : '');

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const arrowBtn = (href, label, cls = 'btn--outline', extra = '') =>
  `<a class="btn ${cls} magnetic" href="${href}"${extra}><span>${label}</span>${icon('arrow', 'arr')}</a>`;

/** Wraps a page body in the common shell.
    r        = path back to the site root ('' or '../')
    path     = this page's file name inside site/ ('index.html', 'about.html', 'services/ai-automation.html'), used for the canonical link
    fullTitle= the complete <title>; when left out it becomes "<title> | 818 AI Agency"
    kind     = 'home' | 'about' | 'contact' | 'services' | 'service' (decides which structured data is written)  */
export function layout({ r = '', title, fullTitle, desc, path = 'index.html', kind = 'home', service, active = '', body, pageClass = '' }) {
  const full = fullTitle || (title === site.name ? title : `${title} | ${site.name}`);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
${seoHead({ full, desc, path, kind, service })}
<meta name="theme-color" content="#030814">
${iconLinks(r)}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${FONTS}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<link rel="stylesheet" href="${r}assets/styles.css${ver('styles.css')}">
</head>
<body class="${pageClass}">
${sprite()}

<!-- Fixed background: one WebGL canvas (Dubai night picture + live light streams + all 3D scenes), a fallback picture, a dark veil -->
<div class="bg-fallback" id="bgFallback" aria-hidden="true"></div>
<canvas id="gl" aria-hidden="true"></canvas>
<div class="veil" aria-hidden="true"></div>
<div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>

${nav(r, active)}

<main>
${body}
</main>

${gulfBand(r)}
${footer(r)}

<script src="${r}assets/bg-image.js${ver('bg-image.js')}" defer></script>
<script src="${r}assets/app.js${ver('app.js')}" defer></script>
</body>
</html>
`;
}

export const brand = (r, full = true) => `<a class="brand" href="${r}index.html" aria-label="${site.name}, home">
  <img class="brand__mark" src="${r}assets/img/logo.jpg" width="38" height="38" alt="">
  <span class="brand__text"><b>818 <i>AI</i>${full ? ' Agency' : ''}</b>${full ? `<small>${site.tagline}</small>` : ''}</span></a>`;

function nav(r, active) {
  const link = (id, href, label) => `<a href="${r}${href}"${active === id ? ' class="active" aria-current="page"' : ''}>${label}</a>`;
  return `<header class="nav" id="nav">
  <div class="nav__in">
    ${brand(r)}
    <nav class="nav__links" aria-label="Main">
      ${link('home', 'index.html', 'Home')}
      ${link('about', 'about.html', 'About')}
      <div class="dd${active === 'services' ? ' is-active' : ''}">
        <a href="${r}services.html" class="dd__btn${active === 'services' ? ' active' : ''}" aria-haspopup="true">Services ${icon('chevron', 'dd__chev')}</a>
        <div class="dd__panel" role="menu">
          ${services.map(s => `<a role="menuitem" href="${r}services/${s.slug}.html"><span class="dd__ic">${icon(s.icon)}</span><span><b>${esc(s.nav)}</b><small>${esc(s.category)}</small></span></a>`).join('')}
          <a class="dd__all" role="menuitem" href="${r}services.html">All services ${icon('arrow-right', 'arr')}</a>
        </div>
      </div>
      ${link('contact', 'contact.html', 'Contact')}
    </nav>
    <div class="nav__end">
      ${arrowBtn(`${r}contact.html`, 'Book a Consultation', 'btn--outline btn--sm nav__cta')}
      <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menu">${icon('menu', 'burger__open')}${icon('close', 'burger__close')}</button>
    </div>
  </div>
  <div class="menu" id="menu" hidden>
    <a href="${r}index.html">Home</a><a href="${r}about.html">About</a><a href="${r}services.html">Services</a>
    <div class="menu__sub">${services.map(s => `<a href="${r}services/${s.slug}.html">${icon(s.icon)}${esc(s.nav)}</a>`).join('')}</div>
    <a href="${r}contact.html">Contact</a>
    ${arrowBtn(`${r}contact.html`, 'Book a Consultation', 'btn--solid')}
  </div>
</header>`;
}

/** The Dubai night skyline (3D, drawn by three.js) with a greeting on top */
function gulfBand(r) {
  return `<section class="gulf" aria-label="Built for the GCC">
  <div class="gulf__scene" data-3d="skyline" data-base="${r}assets/img/dubai-gulf"></div>
  <div class="gulf__text wrap">
    <h2>Built for <em>GCC.</em></h2>
    <p>Intelligent software and AI that fit how business really works across the UAE and the wider region.</p>
  </div>
</section>`;
}

function footer(r) {
  return `<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      ${brand(r, false)}
      <p class="footer__tag">${site.tagline}</p>
      <p>AI, software and digital solutions built around the way your business works.</p>
      <a class="footer__link" href="${r}contact.html">Start a conversation ${icon('arrow', 'arr')}</a>
    </div>
    <nav class="footer__col" aria-label="Explore">
      <h4>Explore</h4>
      <a href="${r}index.html">Home</a><a href="${r}about.html">About</a><a href="${r}services.html">Services</a><a href="${r}contact.html">Contact</a>
    </nav>
    <nav class="footer__col" aria-label="Services">
      <h4>Services</h4>
      ${services.map(s => `<a href="${r}services/${s.slug}.html">${esc(s.nav)}</a>`).join('')}
    </nav>
    <div class="footer__col">
      <h4>Get in touch</h4>
      <a href="mailto:${site.email}">${site.email}</a>
      ${site.whatsapp ? `<a href="https://wa.me/${site.whatsapp}" rel="noopener">WhatsApp</a>` : ''}
      <p class="footer__regions">${regions.map(x => x.name).join(' · ')}</p>
    </div>
  </div>
  <div class="wrap footer__bottom"><p>© ${new Date().getFullYear()} 818 AI. All rights reserved.</p><p>AI · Software · Digital</p></div>
</footer>`;
}

/** The big "Have an idea?" card (home, about, services) */
export function ctaCard(r, id = '') {
  return `<section class="section wrap"${id ? ` id="${id}"` : ''}>
    <div class="card-wrap cta-wrap reveal">
      <div class="card cta geo" data-tilt>
        <p class="pill">Your next chapter starts here</p>
        <h2>Have an Idea? <em>Let's Build It.</em></h2>
        <p class="cta__text">AI automation, software, a website or a completely custom solution. Let's turn your idea into technology.</p>
        <div class="hero__cta">
          ${arrowBtn(`${r}contact.html`, 'Start your project', 'btn--solid')}
          ${arrowBtn(`${r}contact.html`, 'Book a consultation')}
        </div>
      </div>
    </div>
  </section>`;
}

export const flag = {
  AE: '<rect width="40" height="28" fill="#fff"/><rect width="40" height="9.4" fill="#00732f"/><rect y="18.6" width="40" height="9.4" fill="#111"/><rect width="10" height="28" fill="#e4002b"/>',
  SA: '<rect width="40" height="28" fill="#006c35"/><path d="M11 10.5h18M13 13.5h13" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M11 20h18" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M27 20.6l2.6-.6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  QA: '<rect width="40" height="28" fill="#8a1538"/><polygon fill="#fff" points="0,0 13,0 19,2.8 13,5.6 19,8.4 13,11.2 19,14 13,16.8 19,19.6 13,22.4 19,25.2 13,28 0,28"/>',
  BH: '<rect width="40" height="28" fill="#ce1126"/><polygon fill="#fff" points="0,0 13,0 19,2.8 13,5.6 19,8.4 13,11.2 19,14 13,16.8 19,19.6 13,22.4 19,25.2 13,28 0,28"/>',
  KW: '<rect width="40" height="28" fill="#fff"/><rect width="40" height="9.4" fill="#007a3d"/><rect y="18.6" width="40" height="9.4" fill="#ce1126"/><polygon fill="#111" points="0,0 10,9.4 10,18.6 0,28"/>',
  OM: '<rect width="40" height="28" fill="#fff"/><rect y="9.4" width="40" height="9.3" fill="#db161b"/><rect y="18.6" width="40" height="9.4" fill="#008000"/><rect width="12" height="28" fill="#db161b"/><path d="M4 8h4M4 20h4M6 8v12" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>',
};
export const regionsStrip = () => `<div class="regions"><ul class="wrap regions__list">
  ${regions.map(x => `<li${x.main ? ' class="is-main"' : ''}><svg viewBox="0 0 40 28" aria-hidden="true">${flag[x.code]}</svg>${x.name}</li>`).join('')}
</ul></div>`;
