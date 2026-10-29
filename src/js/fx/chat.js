/* AI Receptionist: a scripted chat preview (English / Arabic). Nothing here talks to a server. */
import { $, $$ } from '../core/env.js';

const TEXT = {
  en: {
    dir: 'ltr',
    hello: ['Hello! 👋', "I'm your 818 AI Receptionist. How can I help you today?"],
    quick: [['info', 'Get Information'], ['book', 'Book an Appointment'], ['quote', 'Request a Quote'], ['team', 'Talk to a Team Member']],
    info: 'Of course! We build AI receptionists, automation, custom software, CRM integrations and websites. Which one are you interested in?',
    book: 'Happy to help. Which time suits you? These are available tomorrow:',
    slots: ['10:00 AM', '2:00 PM', '4:30 PM'],
    booked: t => `Done! You are booked for tomorrow at ${t}. A confirmation is on its way to you.`,
    quote: 'To prepare an accurate quote, please tell me your company name and what you would like to achieve.',
    team: "I'm connecting you with a team member now and sharing this conversation, so you won't need to repeat yourself.",
    free: 'Thank you, I have noted that. A member of our team will follow up shortly.',
    placeholder: 'Type a message…', status: 'Online',
  },
  ar: {
    dir: 'rtl',
    hello: ['مرحباً! 👋', 'أنا موظف الاستقبال الذكي من \u2066818 AI\u2069. كيف يمكنني مساعدتك اليوم؟'],
    quick: [['info', 'الحصول على معلومات'], ['book', 'حجز موعد'], ['quote', 'طلب عرض سعر'], ['team', 'التحدث مع أحد أعضاء الفريق']],
    info: 'بالتأكيد! نحن نقدم حلول الذكاء الاصطناعي والأتمتة وتطوير البرمجيات وربط أنظمة إدارة العملاء وتصميم المواقع. أي خدمة تهمك؟',
    book: 'بكل سرور. أي وقت يناسبك؟ هذه المواعيد المتاحة غداً:',
    slots: ['١٠:٠٠ صباحاً', '٢:٠٠ مساءً', '٤:٣٠ مساءً'],
    booked: t => `تم! موعدك غداً الساعة ${t}. سيصلك تأكيد قريباً.`,
    quote: 'لإعداد عرض سعر دقيق، يرجى إخباري باسم شركتك وما الذي تريد تحقيقه.',
    team: 'سأقوم بتحويلك إلى أحد أعضاء فريقنا الآن مع مشاركة هذه المحادثة حتى لا تضطر إلى تكرار كلامك.',
    free: 'شكراً لك، لقد سجلت ذلك. سيتواصل معك أحد أعضاء فريقنا قريباً.',
    placeholder: 'اكتب رسالة…', status: 'متصل',
  },
};

export function initChat() {
  const root = $('[data-chat]'); if (!root) return;
  const body = $('[data-body]', root), quick = $('[data-quick]', root), form = $('[data-form]', root), input = $('[data-input]', root);
  const status = $('.chat__head small', root);
  let lang = 'en', run = 0, started = false;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const T = () => TEXT[lang];

  function bubble(text, who) {
    const b = document.createElement('div');
    b.className = `msg msg--${who}`; b.textContent = text;
    body.appendChild(b); body.scrollTop = body.scrollHeight; return b;
  }
  async function bot(text, token) {
    const typing = bubble('', 'bot'); typing.classList.add('is-typing'); typing.innerHTML = '<i></i><i></i><i></i>';
    await wait(650 + Math.min(text.length * 9, 900));
    if (token !== run) return;
    typing.classList.remove('is-typing'); typing.textContent = text; body.scrollTop = body.scrollHeight;
  }
  function chips(list, onPick) {
    quick.innerHTML = '';
    list.forEach(([key, label]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      b.addEventListener('click', () => onPick(key, label)); quick.appendChild(b);
    });
  }

  async function reset() {
    const token = ++run;
    root.dir = T().dir; root.lang = lang; body.innerHTML = ''; quick.innerHTML = '';
    input.placeholder = T().placeholder; status.lastChild.textContent = T().status;
    for (const line of T().hello) { await bot(line, token); if (token !== run) return; }
    if (token === run) menu();
  }
  const menu = () => chips(T().quick, choose);

  async function choose(key, label) {
    const token = ++run;
    bubble(label, 'me'); quick.innerHTML = '';
    if (key === 'book') {
      await bot(T().book, token); if (token !== run) return;
      chips(T().slots.map(s => [s, s]), async (slot, text) => {
        const t2 = ++run; bubble(text, 'me'); quick.innerHTML = '';
        await bot(T().booked(slot), t2); if (t2 === run) menu();
      });
      return;
    }
    await bot(T()[key], token);
    if (token === run) menu();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const v = input.value.trim(); if (!v) return;
    input.value = ''; const token = ++run; bubble(v, 'me'); quick.innerHTML = '';
    await bot(T().free, token); if (token === run) menu();
  });
  $$('[data-lang]', root).forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.lang === lang) return;
    lang = btn.dataset.lang;
    $$('[data-lang]', root).forEach(b => b.classList.toggle('is-on', b === btn));
    reset();
  }));

  // start the conversation when the chat scrolls into view
  new IntersectionObserver((en, io) => { if (en[0].isIntersecting && !started) { started = true; io.disconnect(); reset(); } }, { threshold: 0.35 }).observe(root);
}
