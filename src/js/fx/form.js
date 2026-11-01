/* Contact page: validation, character counter, copy-email buttons and sending.
   - If site.formKey is set (see src/data/site.js) the enquiry is sent through Web3Forms to your mailbox.
   - Else, if site.formEndpoint is set, the enquiry is POSTed to that form service.
   - Otherwise the visitor's email app opens with the message already written. */
import { $, $$ } from '../core/env.js';

export function initForm() {
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = 'Copied'; }
    catch { btn.textContent = 'Ctrl+C'; }
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  }));

  const form = $('#enquiryForm'); if (!form) return;
  const status = $('[data-status]', form), legal = $('[data-legal]', form), count = $('[data-count]', form);
  const key = form.dataset.key, email = form.dataset.email;
  const endpoint = key ? 'https://api.web3forms.com/submit' : (form.dataset.endpoint || '');
  legal.textContent = endpoint ? 'Your details are used only to reply to this enquiry.' : 'Sending opens your email app with your message ready to send.';

  const ps = new URLSearchParams(location.search).get('service');          // ?service=ai-receptionist pre-selects the service
  if (ps) { const opt = $(`#f-service option[value="${CSS.escape(ps)}"]`, form); if (opt) opt.selected = true; }

  const msg = $('#f-msg', form);
  msg.addEventListener('input', () => { count.textContent = `${msg.value.length} characters`; });

  const rules = {
    name: v => v.trim().length >= 2 || 'Please enter your name.',
    email: v => /^\S+@\S+\.\S+$/.test(v.trim()) || 'Please enter a valid email address.',
    service: v => !!v || 'Please choose what you need.',
    message: v => v.trim().length >= 10 || 'Please write at least a short sentence.',
  };
  const fieldOf = n => form.elements[n].closest('.field');
  function setError(name, text) {
    const f = fieldOf(name); f.classList.toggle('field--error', !!text);
    let p = $('.field__err', f);
    if (text) { if (!p) { p = document.createElement('p'); p.className = 'field__err'; p.setAttribute('role', 'alert'); f.appendChild(p); } p.textContent = text; }
    else if (p) p.remove();
  }
  Object.keys(rules).forEach(n => form.elements[n].addEventListener('input', () => setError(n, '')));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let bad = null;
    for (const [n, check] of Object.entries(rules)) {
      const r = check(form.elements[n].value);
      setError(n, r === true ? '' : r);
      if (r !== true && !bad) bad = n;
    }
    if (bad) { form.elements[bad].focus(); status.textContent = ''; return; }
    if (form.elements.website.value) return;                                // honeypot: bots fill this, people never see it

    const d = Object.fromEntries(new FormData(form));
    const service = form.elements.service.selectedOptions[0].textContent;
    const btn = $('button[type=submit]', form);

    if (endpoint) {
      btn.disabled = true; status.className = 'form__status'; status.textContent = 'Sending…';
      try {
        const { website, ...fields } = d;                                  // the hidden anti-spam field is not sent
        const data = key ? { access_key: key, subject: `New website enquiry: ${service}`, ...fields, service } : { ...fields, service };
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.success === false) throw new Error(String(res.status));
        form.reset(); count.textContent = '0 characters';
        status.className = 'form__status is-ok'; status.textContent = 'Thank you. We have your enquiry and will reply by email soon.';
      } catch {
        status.className = 'form__status is-bad'; status.textContent = `Something went wrong. Please email us at ${email}.`;
      } finally { btn.disabled = false; }
      return;
    }

    const body = `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company || '-'}\nService: ${service}\nBudget: ${d.budget || '-'}\n\n${d.message}`;
    location.href = `mailto:${email}?subject=${encodeURIComponent('Project enquiry: ' + service)}&body=${encodeURIComponent(body)}`;
    status.className = 'form__status is-ok';
    status.textContent = `Your email app should open now. If it did not, write to us at ${email}.`;
  });
}
