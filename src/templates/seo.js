/* Everything search engines and link previews read about a page:
     - the canonical link (the one official address of the page)
     - Open Graph + Twitter tags (the picture and text shown when a link is shared)
     - structured data (JSON-LD): who the business is, which page this is, where it sits in the site
   The text itself comes from src/data/site.js and from the layout() call of each page. */
import { site, regions } from '../data/site.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The full public address of a page. `path` is the file name inside site/, e.g. 'about.html' or 'services/ai-automation.html' */
export const pageUrl = path => (path === 'index.html' ? `${site.url}/` : `${site.url}/${path}`);
const abs = p => `${site.url}/${p}`;

const ORG = `${site.url}/#organization`;
const WEB = `${site.url}/#website`;

/** The business itself. Written in full on the home page; other pages point to it by its @id. */
const organization = () => ({
  '@type': 'Organization', '@id': ORG,
  name: site.name, alternateName: site.short, url: `${site.url}/`, slogan: site.tagline,
  description: site.description, email: site.email,
  logo: { '@type': 'ImageObject', url: abs('assets/img/logo-192.png'), width: 192, height: 192 },
  image: abs(site.ogImage),
  areaServed: regions.map(x => ({ '@type': 'Country', name: x.name })),
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: site.email }],
  ...(site.social && site.social.length ? { sameAs: site.social } : {}),
});

const website = () => ({
  '@type': 'WebSite', '@id': WEB, url: `${site.url}/`, name: site.name, alternateName: site.short,
  inLanguage: 'en', publisher: { '@id': ORG },
});

/** kind: 'home' | 'about' | 'contact' | 'services' | 'service'.   service = the entry from site.js (service pages only) */
function graph({ full, desc, path, kind, service }) {
  const url = pageUrl(path);
  const type = { about: 'AboutPage', contact: 'ContactPage', services: 'CollectionPage' }[kind] || 'WebPage';
  const out = [];
  if (kind === 'home') out.push(organization(), website());
  out.push({
    '@type': type, '@id': `${url}#webpage`, url, name: full, description: desc, inLanguage: 'en',
    isPartOf: { '@id': WEB }, about: { '@id': ORG },
    primaryImageOfPage: { '@type': 'ImageObject', url: abs(site.ogImage), width: 1200, height: 630 },
  });
  if (kind !== 'home') {
    const trail = [{ name: 'Home', url: pageUrl('index.html') }];
    if (kind === 'service') trail.push({ name: 'Services', url: pageUrl('services.html') });
    trail.push({ name: kind === 'service' ? service.title : full.split(' | ')[0], url });
    out.push({ '@type': 'BreadcrumbList', itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: t.url })) });
  }
  if (kind === 'service') {
    out.push({
      '@type': 'Service', '@id': `${url}#service`, url, name: service.title, serviceType: service.title, description: desc,
      provider: { '@id': ORG }, areaServed: regions.map(x => ({ '@type': 'Country', name: x.name })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': out };
}

/** The <head> lines for one page */
export function seoHead({ full, desc, path, kind = 'home', service }) {
  const url = pageUrl(path);
  const img = abs(site.ogImage);
  const alt = `${site.name}. ${site.tagline}`;
  return `<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_AE">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(full)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img}">
<meta name="twitter:image:alt" content="${esc(alt)}">
<script type="application/ld+json">${JSON.stringify(graph({ full, desc, path, kind, service })).replace(/</g, '\\u003c')}</script>`;
}

/** Favicons: the browser tab, the Google result, the phone home screen */
export const iconLinks = r => `<link rel="icon" href="${r}favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" href="${r}assets/img/favicon-48.png" sizes="48x48">
<link rel="icon" type="image/png" href="${r}assets/img/logo-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="${r}assets/img/apple-touch-icon.png">`;
