/* AI Receptionist: the sample phone call player.
   Plays site/assets/audio/voice-demo.mp3. While it plays, the sound wave fills in and each line of the
   conversation appears when it is spoken (the start and end second of every line are in the HTML).
   Nothing here talks to a server, and without JavaScript the whole conversation is simply shown as text. */
import { $, $$, REDUCED } from '../core/env.js';

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function initVoice() {
  const root = $('[data-voice]'); if (!root) return;
  const playBtn = $('[data-vplay]', root), wave = $('[data-vwave]', root), body = $('[data-vbody]', root);
  const status = $('[data-vstatus]', root), timeEl = $('[data-vtime]', root);
  const bars = $$('i', wave);
  const lines = $$('.msg', body).map(el => ({ el, start: +el.dataset.start, end: +el.dataset.end }));
  let dur = +root.dataset.duration || 55;

  const audio = new Audio();
  audio.preload = 'none';
  audio.src = root.dataset.src;

  let shown = -1, playedTo = -1, raf = 0, ended = false, failed = false, dragging = false;
  root.classList.add('is-ready');                        // from now on the lines wait until they are spoken

  /* paint the picture for second t: bars, lines, clock */
  function render(t) {
    t = Math.max(0, Math.min(dur, t));
    const upto = Math.floor((t / dur) * bars.length);
    if (upto !== playedTo) {
      bars.forEach((b, i) => b.classList.toggle('is-played', i < upto));
      playedTo = upto;
    }
    let last = -1;
    lines.forEach((l, i) => {
      const on = t >= l.start - 0.05;
      l.el.classList.toggle('is-pending', !on);
      l.el.classList.toggle('is-speaking', t >= l.start && t < l.end + 0.15);
      if (on) last = i;
    });
    if (last !== shown) {
      shown = last;
      root.classList.toggle('has-lines', last >= 0);
      body.scrollTo({ top: last < 0 ? 0 : body.scrollHeight, behavior: REDUCED ? 'auto' : 'smooth' });
    }
    timeEl.textContent = `${fmt(t)} / ${fmt(dur)}`;
    wave.setAttribute('aria-valuenow', String(Math.round(t)));
    wave.setAttribute('aria-valuetext', fmt(t));
  }

  function setStatus(text) { status.textContent = text; }
  function setPlaying(on) {
    root.classList.toggle('is-playing', on);
    playBtn.setAttribute('aria-label', on ? 'Pause the sample call' : (ended ? 'Play the sample call again' : 'Play the sample call'));
  }

  function tick() {
    render(audio.currentTime);
    if (!audio.paused && !audio.ended) raf = requestAnimationFrame(tick);
  }

  function fail() {
    failed = true; setPlaying(false); root.classList.remove('is-ready');   // show the whole conversation as text instead
    $$('.msg', body).forEach(m => m.classList.remove('is-pending'));
    setStatus('The audio could not be loaded. You can read the call below.');
  }

  async function toggle() {
    if (failed) return;
    if (!audio.paused) { audio.pause(); return; }
    if (ended) { ended = false; audio.currentTime = 0; }
    setStatus('Connecting…');
    try { await audio.play(); } catch (e) { if (!failed) { setPlaying(false); setStatus('Tap play to listen (English)'); } }
  }

  playBtn.addEventListener('click', toggle);
  audio.addEventListener('playing', () => { setPlaying(true); setStatus('On a call · English'); cancelAnimationFrame(raf); tick(); });
  audio.addEventListener('pause', () => { if (audio.ended) return; setPlaying(false); setStatus('Paused'); cancelAnimationFrame(raf); render(audio.currentTime); });
  audio.addEventListener('ended', () => { ended = true; setPlaying(false); setStatus('Call ended · appointment booked'); cancelAnimationFrame(raf); render(dur); });
  audio.addEventListener('waiting', () => setStatus('Loading…'));
  audio.addEventListener('loadedmetadata', () => { if (isFinite(audio.duration) && audio.duration > 1) { dur = audio.duration; render(audio.currentTime); } });
  audio.addEventListener('error', fail);

  /* move to second t (click or drag on the wave, or the arrow keys) */
  function seek(t) {
    t = Math.max(0, Math.min(dur - 0.05, t));
    ended = false;
    if (audio.paused) { setStatus(t < 0.1 ? 'Tap play to listen (English)' : 'Paused'); setPlaying(false); }
    if (audio.readyState > 0) audio.currentTime = t;
    else { audio.addEventListener('loadedmetadata', () => { audio.currentTime = t; }, { once: true }); audio.load(); }
    render(t);
  }
  const at = e => { const r = wave.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; return (root.dir === 'rtl' ? 1 - x : x) * dur; };
  wave.addEventListener('pointerdown', e => { dragging = true; wave.setPointerCapture(e.pointerId); seek(at(e)); });
  wave.addEventListener('pointermove', e => { if (dragging) seek(at(e)); });
  const up = () => { dragging = false; };
  wave.addEventListener('pointerup', up); wave.addEventListener('pointercancel', up);
  wave.addEventListener('keydown', e => {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (step) { e.preventDefault(); seek((audio.currentTime || 0) + step); }
    else if (e.key === 'Home') { e.preventDefault(); seek(0); }
    else if (e.key === 'End') { e.preventDefault(); seek(dur - 0.1); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
  });

  /* never keep talking in a hidden tab */
  document.addEventListener('visibilitychange', () => { if (document.hidden && !audio.paused) audio.pause(); });
  addEventListener('pagehide', () => audio.pause());

  render(0);
}
