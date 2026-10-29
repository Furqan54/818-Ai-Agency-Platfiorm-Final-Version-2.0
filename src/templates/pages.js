/* One function per kind of page. Each returns the HTML between <main> and </main>
   (the shared header, footer and Dubai band are added by layout() in partials.js). */
import { site, services, problems, path, process as processSteps, stories } from '../data/site.js';
import { icon } from './icons.js';
import { layout, esc, arrowBtn, ctaCard, regionsStrip } from './partials.js';
 
const svcHref = (r, s) => `${r}services/${s.slug}.html`;
const other = services.filter(s => !s.featured);          // the 6 services that sit around the hub
const receptionist = services.find(s => s.featured);
const BTN = (href, label, cls) => arrowBtn(href, label, cls);
 
/* ============================================================== HOME */
export function home() {
  const r = '';
  const hubCard = s => `<article class="card svc" data-tilt>
      <p class="svc__cat">${esc(s.category)}</p>
      <span class="svc__icon">${icon(s.icon)}</span>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.card)}</p>
      <p class="svc__point"><i></i>${esc(s.point)}</p>
      <a class="svc__more" href="${svcHref(r, s)}"><span>Learn more</span>${icon('arrow', 'arr')}</a>
    </article>`;
  const mini = (side, title, ic, text) => `<article class="card-wrap" data-fly data-side="${side}"><div class="card mini" data-tilt>
        <div class="mini__row"><h3>${title}</h3>${icon(ic)}</div><p>${text}</p></div></article>`;
 
  const body = `
  <!-- HERO -->
  <section class="hero wrap" id="top">
    <div class="hero__copy">
      <p class="eyebrow eyebrow--line reveal">${site.tagline}</p>
      <h1 class="reveal" style="--d:.08s"><span>Technology</span><span>That Moves</span><em>Your Business</em><em>Forward.</em></h1>
      <p class="lead reveal" style="--d:.16s">Connect your systems, simplify everyday work, and unlock new possibilities with intelligent AI-powered solutions built around your business.</p>
      <div class="hero__cta reveal" style="--d:.24s">
        ${BTN('contact.html', 'Let\'s Build What\'s Next', 'btn--outline')}
        <a class="chip-link magnetic" href="services/ai-receptionist.html">${icon('headset')}<span>New: AI Receptionist, live 24/7</span>${icon('arrow-right', 'arr')}</a>
      </div>
    </div>
    <p class="hero__tag" aria-hidden="true">818 AI Agency <i></i> Your next chapter starts here</p>
  </section>
 
  ${regionsStrip()}
 
  <!-- LEAD SERVICE: AI RECEPTIONIST -->
  <section class="section wrap lead-svc" id="receptionist">
    <div class="lead-svc__copy">
      <p class="eyebrow eyebrow--line reveal">Our lead service · AI Receptionist</p>
      <h2 class="reveal" style="--d:.06s">Never miss a call, a chat <em>or a customer.</em></h2>
      <p class="lead reveal" style="--d:.12s">${esc(receptionist.intro)}</p>
      <ul class="chips reveal" style="--d:.18s">
        <li>${icon('phone')}Phone calls</li><li>${icon('whatsapp')}WhatsApp</li><li>${icon('mail')}Email</li><li>${icon('chat')}Live chat</li><li>${icon('calendar')}Bookings</li>
      </ul>
      <div class="hero__cta reveal" style="--d:.24s">
        ${BTN('services/ai-receptionist.html', 'Meet the AI Receptionist', 'btn--solid')}
        ${BTN('contact.html', 'Book a demo')}
      </div>
    </div>
    <div class="lead-svc__visual">
      <div class="frame3d" data-frame>
        <img class="frame3d__img" src="assets/img/${receptionist.image}" width="1600" height="900" alt="The 818 AI Receptionist answering a customer, with a live chat panel showing bookings and escalation" loading="lazy">
        <span class="float float--a">${icon('clock')}Always available · 24/7</span>
        <span class="float float--b">${icon('calendar')}Appointment booked</span>
        <span class="float float--c">${icon('escalate')}Handed to your team</span>
      </div>
    </div>
  </section>
 
  <!-- ABOUT: five cards around the 3D 818 mark -->
  <section class="section wrap" id="about">
    <div class="about">
      <div class="about__side">
        <header class="about__head reveal">
          <p class="eyebrow eyebrow--line">A smarter digital future</p>
          <h2>Technology That Moves <em>Your Business Forward.</em></h2>
          <p>818 AI Agency designs AI solutions, automation and software around the way your business works.</p>
        </header>
        ${mini(-1, 'AI-Powered Solutions', 'bars', 'Use practical AI capabilities to make work simpler, faster and more effective.')}
        ${mini(-1, 'Room to Grow', 'gem', 'Build a flexible digital foundation that can evolve with your business.')}
      </div>
      <div class="about__core" data-3d="logo" aria-hidden="true"></div>
      <div class="about__side about__side--right">
        ${mini(1, 'Connected Systems', 'globe', 'Bring business tools and everyday workflows into a more connected experience.')}
        ${mini(1, 'Customer Experience', 'users', 'Create smoother customer interactions across your business touchpoints.')}
        ${mini(1, 'Intelligent Automation', 'gear', 'Reduce repetitive tasks and give your team more time for meaningful work.')}
      </div>
    </div>
    <div class="about__cta reveal">
      <p>Let's build <em>what's next.</em></p>
      ${BTN('about.html', 'About 818 AI', 'btn--outline btn--sm')}
    </div>
  </section>
 
  <!-- SERVICES HUB -->
  <section class="section wrap" id="services">
    <header class="section__head section__head--center reveal">
      <p class="eyebrow">818 AI · Our services</p>
      <h2>Technology that moves <em>your business forward.</em></h2>
      <p>Explore practical solutions designed around your business.</p>
    </header>
    <div class="hub-wrap">
      <div class="hub" id="hub">
        <div class="hub__side">${other.slice(0, 3).map(hubCard).join('')}</div>
        <div class="hub__core" id="hubCore" aria-hidden="true">
          <svg class="hub__lines" id="hubLines"></svg>
          <div class="hub__orb"><span class="hub__ring"></span><span class="hub__ring"></span><img class="hub__mark" src="assets/img/logo.jpg" width="52" height="52" alt=""></div>
        </div>
        <div class="hub__side">${other.slice(3).map(hubCard).join('')}</div>
      </div>
    </div>
    <div class="pill-cta reveal"><span>Let's build something better</span>${BTN('services.html', 'All services', 'btn--outline btn--sm')}</div>
  </section>
 
  <!-- PROCESS (cards stack on top of each other) -->
  <section class="section wrap" id="process">
    <header class="section__head reveal">
      <p class="eyebrow eyebrow--line">How we work</p>
      <h2>From first call to <em>running system.</em></h2>
    </header>
    <div class="stack" id="stack">
      ${processSteps.map(([t, text, viz], i) => `<article class="step" style="--i:${i}">
        <div class="step__text"><p class="step__label">Step 0${i + 1}</p><h3>${t}</h3><p>${text}</p></div>
        ${stepViz[viz]}
      </article>`).join('')}
    </div>
  </section>
 
  ${ctaCard(r, 'contact')}`;
 
  return layout({ r, title: site.name, desc: '818 AI Agency. Intelligence, engineered. An AI receptionist, AI solutions, automation, custom software, CRM integrations and web development for businesses in Dubai, the UAE and the GCC.', active: 'home', body, pageClass: 'page-home' });
}
 
const stepViz = {
  map: '<svg class="step__viz" viewBox="0 0 160 160" fill="none" aria-hidden="true"><circle cx="80" cy="80" r="64" stroke="rgba(255,255,255,.14)"/><circle cx="80" cy="80" r="44" stroke="rgba(255,255,255,.2)"/><circle cx="80" cy="80" r="24" stroke="#5ee0ff" stroke-width="2"/><path d="M80 80 128 40" stroke="#5ee0ff" stroke-width="2" stroke-linecap="round"/><circle cx="128" cy="40" r="5" fill="#5ee0ff"/><circle cx="46" cy="110" r="4" fill="#2f7bff"/><circle cx="104" cy="118" r="3" fill="#fff"/></svg>',
  build: '<svg class="step__viz" viewBox="0 0 160 160" fill="none" aria-hidden="true"><rect x="22" y="92" width="22" height="46" rx="6" fill="rgba(255,255,255,.14)"/><rect x="56" y="70" width="22" height="68" rx="6" fill="rgba(255,255,255,.22)"/><rect x="90" y="46" width="22" height="92" rx="6" fill="#2f7bff" fill-opacity=".85"/><rect x="124" y="22" width="22" height="116" rx="6" fill="#5ee0ff"/></svg>',
  run: '<svg class="step__viz" viewBox="0 0 160 160" fill="none" aria-hidden="true"><path d="M14 124 C40 120 52 96 76 98 S116 62 146 30" stroke="#5ee0ff" stroke-width="3" stroke-linecap="round"/><path d="M14 138h132" stroke="rgba(255,255,255,.18)"/><circle cx="146" cy="30" r="6" fill="#fff"/><circle cx="146" cy="30" r="14" stroke="rgba(94,224,255,.5)"/></svg>',
};
 
/* ============================================================== ABOUT */
export function about() {
  const r = '';
  const nodeList = [
    ['Website', 'web-development', 'globe'], ['AI', 'ai-solutions', 'chip'], ['Automation', 'ai-automation', 'flow'],
    ['Custom Software', 'custom-software', 'code'], ['AI Tools', 'ai-tools-agents', 'bot'], ['CRM', 'crm-integrations', 'share'], ['AI Receptionist', 'ai-receptionist', 'headset'],
  ];
  const pillars = [
    ['code', 'Custom Software Development', 'Build websites, applications, and digital tools for your business.'],
    ['db', 'Systems & Integrations', 'Connect your tools and platforms so information flows smoothly.'],
    ['bars', 'AI-Powered Solutions', 'Make it easier for your team to get information and work faster.'],
  ];
 
  const body = `
  <!-- HERO BANNER -->
  <section class="section--top wrap">
    <div class="banner reveal">
      <div class="banner__frame" data-frame>
        <img class="banner__img" src="assets/img/about-hero.webp" width="1944" height="809" alt="The 818 AI mark floating in a glass boardroom above the Dubai skyline">
        <div class="banner__panel geo">
          <p class="eyebrow eyebrow--line">About 818 AI</p>
          <h1>Technology Built <em>for What's Next.</em></h1>
          <p>818 AI is a technology company helping businesses use AI, software and digital systems to operate smarter and grow faster.</p>
          <a class="btn btn--outline magnetic" href="#story"><span>Explore About Us</span>${icon('arrow-down', 'arr')}</a>
        </div>
      </div>
    </div>
  </section>
 
  <!-- ONE ECOSYSTEM (3D orbit hub) -->
  <section class="section wrap" id="story">
    <div class="split">
      <div class="split__copy">
        <p class="pill reveal">About 818 AI</p>
        <h2 class="reveal" style="--d:.06s">Technology That <em>Moves Business Forward.</em></h2>
        <p class="lead reveal" style="--d:.12s">818 AI is a technology company focused on building intelligent digital systems that help businesses work smarter, operate faster and create better experiences.</p>
        <p class="reveal" style="--d:.18s">From websites and custom software to AI automation, intelligent tools, CRM systems and AI-powered customer experiences, we bring different technologies together into practical solutions built around real business needs.</p>
        <p class="tagline reveal" style="--d:.24s"><i></i><span>One ecosystem. <em>Multiple possibilities.</em></span></p>
      </div>
      <div class="constel constel--orbs" data-3d="constel" data-core="logo" aria-label="The 818 AI ecosystem">
        ${nodeList.map(([l, slug, ic]) => `<a class="node" href="services/${slug}.html"><span class="node__ic">${icon(ic)}</span><span class="node__t">${l}</span></a>`).join('')}
      </div>
    </div>
  </section>
 
  <!-- CHALLENGES TO SOLUTIONS -->
  <section class="section wrap">
    <header class="section__head section__head--center reveal">
      <p class="pill">Technology, applied</p>
      <h2>Turning business challenges into <em>practical technology solutions.</em></h2>
      <p>We help businesses use AI, automation, and custom software to work smarter, save time, and grow faster.</p>
    </header>
    <div class="frame3d frame3d--wide reveal" data-frame>
      <img class="frame3d__img" src="assets/img/ai-automation.webp" width="1351" height="1164" alt="Scattered tools and slow processes on the left flowing through the 818 AI core into automated, connected solutions on the right" loading="lazy">
    </div>
    <div class="pillars">
      ${pillars.map(([ic, t, d], i) => `<article class="card-wrap" data-fly data-side="${i - 1}"><div class="card pillar" data-tilt><span class="svc__icon">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></div></article>`).join('')}
    </div>
  </section>
 
  <!-- HOW WE TURN TECHNOLOGY INTO SOLUTIONS (3D slider) -->
  <section class="section wrap" id="solutions">
    <header class="section__head section__head--center reveal">
      <p class="pill">Technology, applied</p>
      <h2>How We Turn Technology <em>Into Solutions.</em></h2>
      <p>We do not use technology simply for the sake of technology. We apply it where it can remove friction, improve experiences, connect systems and create meaningful business impact.</p>
    </header>
    <div class="slider slider--story reveal" data-slider>
      <div class="slider__stage">
        ${stories.map((s, i) => `<article class="slide story" aria-label="${i + 1} of ${stories.length}">
          <div class="story__img"><img src="assets/img/${s.image}" alt="" loading="lazy"><span class="story__no">0${i + 1}</span></div>
          <div class="story__text">
            <p class="pill">${esc(s.tag)}</p>
            <h3>${esc(s.title)} <em>${esc(s.em)}</em></h3>
            <p>${esc(s.text)}</p>
            <a class="btn btn--outline btn--sm magnetic" href="services/${s.link}.html"><span>Explore service</span>${icon('arrow-right', 'arr')}</a>
          </div>
        </article>`).join('')}
      </div>
      ${sliderBar()}
    </div>
    <div class="pill-cta reveal"><span>See how these ideas become real solutions</span>${BTN('services.html', 'Explore Our Services', 'btn--outline btn--sm')}</div>
  </section>
 
  ${ctaCard(r)}`;
  return layout({ r, title: 'About', desc: '818 AI is a technology company helping businesses in Dubai, the UAE and the GCC use AI, software and digital systems to operate smarter and grow faster.', active: 'about', body });
}
 
const sliderBar = () => `<div class="slider__bar">
  <button class="slider__btn" type="button" data-prev aria-label="Previous">${icon('arrow-left')}</button>
  <div class="slider__dots" data-dots></div>
  <p class="slider__count"><b data-cur>01</b> / <span data-total>00</span></p>
  <button class="slider__btn" type="button" data-next aria-label="Next">${icon('arrow-right')}</button>
</div>`;
 
/* ============================================================== SERVICES */
export function servicesPage() {
  const r = '';
  const body = `
  <!-- HERO with the 3D intelligence sphere -->
  <section class="sphero wrap">
    <div class="sphero__copy">
      <p class="eyebrow eyebrow--line reveal">What we do</p>
      <h1 class="reveal" style="--d:.08s">Technology built <em>for what's next.</em></h1>
      <p class="lead reveal" style="--d:.16s">Software, artificial intelligence and connected digital solutions designed to help businesses work smarter and grow.</p>
      <div class="hero__cta reveal" style="--d:.24s">${BTN('contact.html', 'Book a Consultation', 'btn--solid')}${BTN('#capabilities', 'See all 7 services', 'btn--outline')}</div>
    </div>
    <div class="constel constel--cards" data-3d="constel" data-core="sphere" aria-label="818 AI services">
      <p class="constel__core"><b>818 AI</b><span>Intelligence</span></p>
      ${services.map(s => `<a class="node" href="services/${s.slug}.html"><span class="node__ic">${icon(s.icon)}</span><span class="node__t">${esc(s.nav)}</span><span class="node__s">${esc(s.category)}</span></a>`).join('')}
    </div>
  </section>
 
  <!-- PROBLEMS -->
  <section class="section wrap" id="problems">
    <header class="section__head section__head--center reveal">
      <p class="pill">Beyond the technology</p>
      <h2>Technology should solve <em>real problems.</em></h2>
      <p>We combine software development, artificial intelligence and automation to address everyday business challenges with practical, purpose-built digital solutions.</p>
    </header>
    <div class="split split--even">
      <div class="problems">
        ${problems.map(([t, d], i) => `<article class="card-wrap" data-fly data-side="${i % 2 ? 1 : -1}"><div class="card problem" data-tilt><span class="problem__no">0${i + 1}</span><h3>${t}</h3><p>${d}</p></div></article>`).join('')}
      </div>
      <div class="card-wrap reveal"><div class="card flowviz geo" data-tilt>
        <p class="flowviz__cap">${icon('spark')}Connected workflows</p>
        ${flowViz()}
        <p class="flowviz__foot">One connected business</p>
      </div></div>
    </div>
    <div class="pill-cta reveal"><span>Different challenges. One connected approach.</span>${BTN('contact.html', 'Book a Consultation', 'btn--outline btn--sm')}</div>
  </section>
 
  <!-- CAPABILITIES (3D slider) -->
  <section class="section wrap" id="capabilities">
    <div class="caps">
      <header class="caps__head reveal">
        <p class="pill">What we do</p>
        <h2>The right technology for <em>what comes next.</em></h2>
        <p>Every business has different challenges. Explore the services that help turn complex problems into practical opportunities.</p>
        <p class="caps__no"><b>7</b> AI &amp; software services</p>
      </header>
      <div class="slider slider--caps reveal" data-slider data-peek>
        <div class="slider__stage">
          ${services.map((s, i) => `<article class="slide cap card" aria-label="${i + 1} of ${services.length}">
            <div class="cap__top"><span class="svc__icon">${icon(s.icon)}</span><span class="cap__no">${s.num}</span></div>
            <p class="svc__cat">${esc(s.category)}</p>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.card)}</p>
            <p class="cap__label">What this can deliver</p>
            <ul class="checks">${s.value.slice(0, 3).map(v => `<li>${icon('check')}${esc(v)}</li>`).join('')}</ul>
            <div class="cap__actions">
              <a class="btn btn--outline btn--sm" href="services/${s.slug}.html"><span>More info</span>${icon('arrow', 'arr')}</a>
              <a class="btn btn--solid btn--sm" href="contact.html"><span>Discuss this service</span></a>
            </div>
          </article>`).join('')}
        </div>
        ${sliderBar()}
      </div>
    </div>
  </section>
 
  <!-- PATH -->
  <section class="section wrap" id="path">
    <header class="section__head section__head--center reveal">
      <p class="pill">From possibility to reality</p>
      <h2>A clear path. <em>From idea to impact.</em></h2>
      <p>A structured process designed to turn your goals into real, measurable results. We work closely with you at every stage, from initial discovery to long-term growth.</p>
    </header>
    <ol class="path">
      ${path.map(([t, d, k], i) => `<li class="card-wrap" data-fly data-side="${Math.sign(i - 2)}"><div class="card pathcard" data-tilt>
        <span class="pathcard__no">0${i + 1}</span>
        <span class="svc__icon">${icon(['search', 'pen', 'layers', 'rocket', 'bars'][i])}</span>
        <h3>${t}</h3><p>${d}</p><span class="pathcard__tag">${k}</span></div></li>`).join('')}
    </ol>
    <div class="pill-cta reveal"><span>Ready when you are</span>${BTN('contact.html', 'Start a Project', 'btn--outline btn--sm')}</div>
  </section>
 
  ${ctaCard(r)}`;
  return layout({ r, title: 'Services', desc: 'AI Receptionist, AI Solutions, AI Automation, AI Tools & Agents, Custom Software, Web Development and CRM & Integrations from 818 AI.', active: 'services', body });
}
 
function flowViz() {
  return `<svg class="flowviz__svg" viewBox="0 0 400 300" role="img" aria-label="Systems, automation, communication and software connected around one centre">
    <g class="fv-lines" fill="none" stroke="rgba(94,224,255,.45)" stroke-width="1.4">
      <path d="M200 150 80 70"/><path d="M200 150 320 70"/><path d="M200 150 80 230"/><path d="M200 150 320 230"/>
    </g>
    <g fill="none" stroke="#bfeaff" stroke-width="2.4" stroke-linecap="round" class="fv-pulses">
      <path class="fv-p" pathLength="100" d="M200 150 80 70"/><path class="fv-p" pathLength="100" d="M200 150 320 70" style="animation-delay:-.8s"/>
      <path class="fv-p" pathLength="100" d="M200 150 80 230" style="animation-delay:-1.6s"/><path class="fv-p" pathLength="100" d="M200 150 320 230" style="animation-delay:-2.4s"/>
    </g>
    <circle class="fv-ring" cx="200" cy="150" r="30" fill="none" stroke="rgba(94,224,255,.7)"/>
    <circle cx="200" cy="150" r="22" fill="rgba(47,123,255,.25)" stroke="#5ee0ff" stroke-width="1.6"/>
    <path d="M200 140v20M190 150h20M193 143l14 14M207 143l-14 14" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
    ${[['Systems', 80, 70], ['Automation', 320, 70], ['Communication', 80, 230], ['Software', 320, 230]].map(([t, x, y]) =>
      `<circle cx="${x}" cy="${y}" r="5" fill="#5ee0ff"/><text x="${x}" y="${y + (y < 150 ? -16 : 24)}" text-anchor="middle" fill="rgba(226,238,255,.8)" font-size="11" letter-spacing="2" font-family="JetBrains Mono, monospace">${t.toUpperCase()}</text>`).join('')}
  </svg>`;
}
 
const DIM = { 'ai-receptionist.webp': [1600, 900], 'ai-solutions.webp': [1536, 1024], 'ai-automation.webp': [1351, 1164], 'ai-agents.webp': [1600, 900], 'custom-software.webp': [1536, 1024], 'web-development.webp': [1536, 1024], 'crm-integrations.webp': [1600, 900] };
 
/* ============================================================== SERVICE (one template, 7 pages) */
export function servicePage(s, i) {
  const r = '../';
  const prev = services[(i + services.length - 1) % services.length];
  const next = services[(i + 1) % services.length];
  const cols = s.build.length > 3 ? 'grid3 grid3--six' : 'grid3';
  const ex = {
    'ai-receptionist': () => receptionistExtras(r, s),
    'web-development': () => projectsBlock(s),
    'crm-integrations': () => '',
  }[s.slug];
 
  const body = `
  <!-- HERO: copy on the left, your picture tilting in 3D on the right, glass cubes and light dust drifting behind (three.js) -->
  <section class="phero">
    <div class="phero__fx" data-3d="fx" aria-hidden="true"></div>
    <div class="wrap phero__grid">
      <div class="phero__in">
        <a class="crumb reveal" href="${r}services.html">${icon('arrow-left')}All services</a>
        <p class="pill reveal" style="--d:.05s">Service ${s.num} · ${esc(s.category)}</p>
        <h1 class="reveal" style="--d:.1s">${esc(s.title)}</h1>
        <p class="lead reveal" style="--d:.16s">${esc(s.tagline)}</p>
        <p class="phero__text reveal" style="--d:.2s">${esc(s.intro)}</p>
        <div class="hero__cta reveal" style="--d:.26s">
          ${BTN(`${r}contact.html`, 'Discuss your project', 'btn--solid')}
          <a class="btn btn--ghost magnetic" href="#build"><span>Explore capabilities</span>${icon('arrow-down', 'arr')}</a>
        </div>
      </div>
      <div class="phero__visual reveal" style="--d:.12s">
        <div class="frame3d" data-frame>
          <img class="frame3d__img" src="${r}assets/img/${s.image}" width="${DIM[s.image][0]}" height="${DIM[s.image][1]}" alt="${esc(s.title)}">
        </div>
      </div>
    </div>
  </section>
 
  ${ex && s.slug === 'ai-receptionist' ? ex() : ''}
 
  <!-- WHAT WE CAN BUILD -->
  <section class="section wrap" id="build">
    <header class="section__head section__head--center reveal">
      <p class="pill">What we can build</p>
      <h2>${esc(s.buildTitle).replace(/(requirements\.?|channel)$/i, m => `<em>${m}</em>`)}</h2>
      <p>We define the scope with you so the solution fits your goals, tools, and day-to-day operations.</p>
    </header>
    <div class="${cols}">
      ${s.build.map(([t, d], k) => `<article class="card-wrap" data-fly data-side="${(k % 3) - 1}"><div class="card feature" data-tilt>
        <span class="feature__no">${String(k + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div></article>`).join('')}
    </div>
  </section>
 
  ${ex && s.slug === 'web-development' ? ex() : ''}
 
  <!-- HOW WE WORK -->
  <section class="section wrap">
    <header class="section__head section__head--center reveal">
      <p class="pill">How we work</p>
      <h2>A clear path from idea <em>to implementation.</em></h2>
    </header>
    <ol class="stepgrid">
      ${s.steps.map((t, k) => `<li class="reveal" style="--d:${(k % 2) * 0.08}s"><span class="stepgrid__no">${String(k + 1).padStart(2, '0')}</span><p>${esc(t)}</p></li>`).join('')}
    </ol>
  </section>
 
  <!-- DELIVERABLES + VALUE -->
  <section class="section wrap">
    <div class="lists">
      <div class="reveal">
        <p class="pill">What you receive</p>
        <h2>Clear <em>deliverables.</em></h2>
        <ul class="checks checks--lg">${s.deliver.map(v => `<li>${icon('check')}${esc(v)}</li>`).join('')}</ul>
      </div>
      <div class="reveal" style="--d:.1s">
        <p class="pill">Expected value</p>
        <h2>Practical business <em>benefits.</em></h2>
        <ul class="checks checks--lg">${s.value.map(v => `<li>${icon('check')}${esc(v)}</li>`).join('')}</ul>
      </div>
    </div>
    ${s.note ? `<p class="note reveal">${esc(s.note)}</p>` : ''}
  </section>
 
  <!-- CTA -->
  <section class="section wrap">
    <div class="card-wrap cta-wrap reveal"><div class="card cta cta--slim geo" data-tilt>
      <p class="pill">Let's talk about your goals</p>
      <h2>Have a requirement <em>in mind?</em></h2>
      <p class="cta__text">Tell us what you need to achieve. We'll discuss the requirements, suitable options, and a realistic scope for your project.</p>
      <div class="hero__cta">${BTN(`${r}contact.html?service=${s.slug}`, 'Start a conversation', 'btn--solid')}</div>
    </div></div>
    <nav class="svcnav" aria-label="Other services">
      <a class="svcnav__a" href="${prev.slug}.html">${icon('arrow-left')}<span><small>Previous service</small><b>${esc(prev.title)}</b></span></a>
      <a class="svcnav__a svcnav__a--next" href="${next.slug}.html"><span><small>Next service</small><b>${esc(next.title)}</b></span>${icon('arrow-right')}</a>
    </nav>
  </section>`;
  return layout({ r, title: s.title, desc: `${s.tagline} ${s.intro}`.slice(0, 200), active: 'services', body });
}
 
/* ---- AI Receptionist: channel cards + a live chat you can try ---- */
function receptionistExtras(r, s) {
  const channel = (ic, t, d) => `<article class="card-wrap" data-fly data-side="-1"><div class="card chan" data-tilt><span class="svc__icon">${icon(ic)}</span><div><h3>${t}</h3><p>${d}</p></div></div></article>`;
  const perk = (ic, t, d) => `<article class="card-wrap" data-fly data-side="1"><div class="card chan" data-tilt><span class="svc__icon">${icon(ic)}</span><div><h3>${t}</h3><p>${d}</p></div></div></article>`;
  return `<section class="section wrap" id="demo">
    <header class="section__head section__head--center reveal">
      <p class="pill">Try it yourself</p>
      <h2>Say hello to your <em>AI receptionist.</em></h2>
      <p>This is a scripted preview of how a conversation can feel. Tap a question, or switch to Arabic. Your real receptionist is set up with your services, opening hours and tone of voice.</p>
    </header>
    <div class="demo">
      <div class="demo__side">
        ${channel('phone', 'Phone Calls', 'Answer enquiries')}
        ${channel('whatsapp', 'WhatsApp', 'Chat with customers')}
        ${channel('mail', 'Email Support', 'Handle queries')}
        ${channel('chat', 'Live Chat', 'Engage visitors')}
      </div>
      <div class="card-wrap reveal"><div class="card chat" id="chat" data-chat>
        <div class="chat__head">
          <img src="${r}assets/img/logo.jpg" width="34" height="34" alt="">
          <div><b><bdi dir="ltr">818 AI</bdi> Receptionist</b><small><i></i>Online</small></div>
          <div class="chat__lang" role="group" aria-label="Language"><button type="button" class="is-on" data-lang="en">EN</button><button type="button" data-lang="ar" lang="ar">عربي</button></div>
        </div>
        <div class="chat__body" data-body aria-live="polite"></div>
        <div class="chat__quick" data-quick></div>
        <form class="chat__form" data-form autocomplete="off">
          <input type="text" data-input maxlength="160" placeholder="Type a message…" aria-label="Type a message">
          <button type="submit" aria-label="Send">${icon('send')}</button>
        </form>
      </div></div>
      <div class="demo__side">
        ${perk('calendar', 'Appointment Booking', 'Check availability and confirm slots')}
        ${perk('escalate', 'Smart Escalation', 'Hand over to a person with context')}
        ${perk('clock', 'Always Available', 'Day, night, weekends and holidays')}
      </div>
    </div>
  </section>`;
}
 
/* ---- Web development: selected projects ---- */
function projectsBlock(s) {
  return `<section class="section wrap" id="projects">
    <header class="section__head section__head--center reveal">
      <p class="pill">Selected projects</p>
      <h2>Work and development <em>experience.</em></h2>
      <p>A selection of projects from our supplied portfolio material. Project status and contributions are stated conservatively.</p>
    </header>
    <div class="projects">
      ${s.projects.map((p, k) => `<article class="card-wrap" data-fly data-side="${k % 2 === 0 ? -1 : 1}"><div class="card project" data-tilt>
        <div class="project__shot"><img src="../assets/img/${p.image}" alt="Screenshot of ${esc(p.name)}" loading="lazy"><span class="project__badge">Live project</span></div>
        <p class="svc__cat">Our project experience</p>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.blurb)}</p>
        <p class="project__notes"><b>Project notes</b>${esc(p.notes)}</p>
        ${p.url ? `<a class="btn btn--outline btn--sm magnetic" href="${p.url}" target="_blank" rel="noopener"><span>To view this project, click here</span>${icon('arrow', 'arr')}</a>` : ''}
      </div></article>`).join('')}
    </div>
  </section>`;
}
 
/* ============================================================== CONTACT */
export function contact() {
  const r = '';
  const budgets = ['Under $2,000', '$2,000 – $5,000', '$5,000 – $15,000', '$15,000 – $50,000', '$50,000+', 'Not sure yet'];
  const body = `
  <section class="section--top wrap">
    <div class="banner banner--contact reveal">
      <div class="banner__frame" data-frame>
        <img class="banner__img" src="assets/img/lets-build.webp" width="1916" height="821" alt="" >
        <div class="banner__panel banner__panel--left geo">
          <p class="pill"><i class="dot"></i>Let's build something meaningful</p>
          <h1>Let's talk about <em>what's next.</em></h1>
          <p>Have a project in mind, a process to improve, or an idea you're ready to explore? Tell us what you're working towards.</p>
          <a class="btn btn--outline magnetic" href="#enquiry"><span>Tell us about your project</span>${icon('arrow-down', 'arr')}</a>
        </div>
        <p class="banner__ar" lang="ar" dir="rtl">تواصل معنا</p>
      </div>
    </div>
  </section>
 
  <section class="section wrap" id="enquiry">
    <div class="contact">
      <div class="contact__side">
        <p class="eyebrow eyebrow--line reveal">Get in touch</p>
        <h2 class="reveal" style="--d:.06s">Good work starts <em>with a conversation.</em></h2>
        <p class="lead reveal" style="--d:.12s">Share your goals, challenges, or early-stage ideas. We'll use the details to understand what you're looking to achieve.</p>
        <ol class="mini-steps">
          ${[['Tell us about it', 'Describe your project and what you want to accomplish.'], ['Explore the options', 'Identify the requirements and possible approaches.'], ['Plan the next step', 'Work towards a realistic scope for your project.']]
            .map(([t, d], i) => `<li class="reveal" style="--d:${i * 0.07}s"><span>0${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join('')}
        </ol>
        <p class="notebox reveal">${icon('arrow')}Not sure which service you need? That's fine. Tell us about the problem and we'll start there.</p>
        <ul class="direct reveal">
          <li>${icon('mail')}<a href="mailto:${site.email}">${site.email}</a><button class="cta__copy" type="button" data-copy="${site.email}">Copy</button></li>
          ${site.whatsapp ? `<li>${icon('whatsapp')}<a href="https://wa.me/${site.whatsapp}" rel="noopener">Chat on WhatsApp</a></li>` : ''}
        </ul>
      </div>
 
      <div class="card-wrap reveal"><form class="card form geo" id="enquiryForm" novalidate data-endpoint="${esc(site.formEndpoint)}" data-email="${site.email}">
        <p class="eyebrow">Project enquiry</p>
        <h2 class="form__title">Tell us what you have in mind.</h2>
        <p class="form__hint">Fields marked with * are required.</p>
        <div class="form__row">
          <div class="field"><label for="f-name">Your name *</label><input id="f-name" name="name" type="text" autocomplete="name" maxlength="80" placeholder="Enter your name" required></div>
          <div class="field"><label for="f-email">Email address *</label><input id="f-email" name="email" type="email" autocomplete="email" maxlength="160" placeholder="you@company.com" required></div>
        </div>
        <div class="field"><label for="f-company">Company <small>Optional</small></label><input id="f-company" name="company" type="text" autocomplete="organization" maxlength="120" placeholder="Your company or organisation"></div>
        <div class="form__row">
          <div class="field"><label for="f-service">What do you need? *</label>
            <select id="f-service" name="service" required><option value="">Select a service</option><option>A consultation</option>${services.map(s => `<option value="${s.slug}">${esc(s.title)}</option>`).join('')}<option>Something else</option></select></div>
          <div class="field"><label for="f-budget">Estimated budget <small>Optional</small></label>
            <select id="f-budget" name="budget"><option value="">Choose a range</option>${budgets.map(b => `<option>${b}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label for="f-msg">Project details *</label><textarea id="f-msg" name="message" rows="5" maxlength="2000" placeholder="What are you looking to build, improve, or solve?" required></textarea>
          <p class="field__foot"><span>Share as much detail as you can.</span><span data-count>0 characters</span></p></div>
        <div class="hp" aria-hidden="true"><label for="f-web">Website</label><input id="f-web" name="website" type="text" tabindex="-1" autocomplete="off"></div>
        <p class="form__status" role="status" aria-live="polite" data-status></p>
        <button class="btn btn--solid btn--block magnetic" type="submit"><span>Send enquiry</span>${icon('arrow', 'arr')}</button>
        <p class="form__legal" data-legal></p>
      </form></div>
    </div>
  </section>
 
  <section class="strip wrap reveal">
    <div><p class="eyebrow">818 AI</p><h2>Every good project starts <em>somewhere.</em></h2></div>
    <a class="strip__link" href="#enquiry">Start with an idea ${icon('arrow', 'arr')}</a>
  </section>`;
  return layout({ r, title: 'Contact', desc: 'Tell 818 AI about your project. AI receptionist, automation, software, CRM and web development for businesses in Dubai and the GCC.', active: 'contact', body, pageClass: 'page-contact' });
}