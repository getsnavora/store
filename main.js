/* Navora for Stores — frontend interactions (no backend; nothing is sent anywhere) */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const icon = (n) => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- year ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- sticky header ---------- */
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  const sheet = $('#mobile-menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { const first = $('a', sheet); first && first.focus(); }
  }
  if (menuBtn && sheet) {
    menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
  }

  /* ---------- reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach((item) => {
    const btn = $('.faq-btn', item);
    const panel = $('.faq-panel', item);
    panel.inert = true;
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      panel.inert = !open;
    });
  });
  // open a FAQ from #hash (e.g. faq.html#fq3)
  if (location.hash && /^#fq\d+$/.test(location.hash)) {
    const b = $(location.hash); b && b.click();
  }

  /* ---------- field validation helpers ---------- */
  const rules = {
    mobile: (v) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')),
    pincode: (v) => /^\d{6}$/.test(v.trim())
  };
  function fieldOf(el) { return el.closest('.field'); }
  function setError(field, msg) {
    if (!field) return;
    field.classList.add('invalid');
    field.classList.remove('valid');
    const err = $('.err', field);
    if (err && msg) err.lastChild.textContent = msg;
    $$('input, select, textarea', field).forEach((i) => i.setAttribute('aria-invalid', 'true'));
  }
  function clearError(field) {
    if (!field) return;
    field.classList.remove('invalid');
    $$('input, select, textarea', field).forEach((i) => i.removeAttribute('aria-invalid'));
  }
  function validateControl(el) {
    const field = fieldOf(el);
    if (!field || el.disabled || el.closest('[hidden]') || el.closest('.reveal-block:not(.show)')) return true;
    if (el.type === 'radio') {
      const group = $$(`input[name="${el.name}"]`, el.form);
      const ok = !el.required || group.some((r) => r.checked);
      ok ? clearError(field) : setError(field, field.dataset.msg || 'Please choose an option.');
      return ok;
    }
    if (el.type === 'checkbox') {
      const ok = !el.required || el.checked;
      ok ? clearError(field) : setError(field, field.dataset.msg || 'Please confirm to continue.');
      return ok;
    }
    const v = el.value.trim();
    if (el.required && !v) { setError(field, el.dataset.req || 'This field is required.'); return false; }
    const type = el.dataset.type;
    if (v && type && rules[type] && !rules[type](v)) { setError(field, el.dataset.bad || 'Please check this value.'); return false; }
    clearError(field);
    if (v && field.querySelector('.ok')) field.classList.add('valid');
    return true;
  }
  function digitsOnly(el, max) {
    el.addEventListener('input', () => { const d = el.value.replace(/\D/g, '').slice(0, max); if (d !== el.value) el.value = d; });
  }

  /* ---------- availability checker (demo) ---------- */
  $$('[data-checker]').forEach((form) => {
    const input = $('input', form);
    const out = form.parentElement.querySelector('[data-check-result]');
    digitsOnly(input, 6);
    input.addEventListener('input', () => clearError(fieldOf(input)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!/^\d{6}$/.test(v)) { setError(fieldOf(input), 'Enter a 6-digit pincode.'); input.focus(); out.className = 'check-result'; out.innerHTML = ''; return; }
      clearError(fieldOf(input));
      let s;
      if (v.startsWith('67612')) s = { c: 'launch', i: 'check', t: 'Launch Area', d: `Pincode ${v} looks like part of Navora’s first launch area around Manjeri. You can apply now.`, cta: true };
      else if (/^(676|679|673)/.test(v)) s = { c: 'soon', i: 'clock', t: 'Coming Soon', d: `Pincode ${v} is in the wider Malappuram region, where Navora plans to expand next. You can still apply and we’ll keep your details for later.`, cta: true };
      else s = { c: 'unknown', i: 'help', t: 'Availability not confirmed yet', d: `We don’t have confirmed plans for pincode ${v} yet. Expansion depends on operational availability.`, cta: false };
      out.className = `check-result show ${s.c}`;
      out.innerHTML = `<span class="ico">${icon(s.i)}</span><div><b>${s.t}</b><p>${s.d}</p>${s.cta ? '<a class="link-arrow" href="partner.html#apply">Start an application ' + icon('arrow-r') + '</a>' : ''}<p class="small muted">Example result — live coverage data is not connected yet.</p></div>`;
    });
  });

  /* ---------- partner application (multi-step, frontend only) ---------- */
  const apply = $('[data-apply]');
  if (apply) {
    const steps = $$('.step', apply);
    const inds = $$('.progress li', apply);
    const back = $('[data-back]', apply);
    const next = $('[data-next]', apply);
    const submit = $('[data-submit]', apply);
    const done = $('[data-done]');
    const panel = apply.closest('.form-panel');
    let cur = 0;
    const KEY = 'navora-partner-draft';

    $$('[data-type="mobile"]', apply).forEach((el) => digitsOnly(el, 10));
    $$('[data-type="pincode"]', apply).forEach((el) => digitsOnly(el, 6));

    // restore draft (this browser tab only)
    const draft = store.get(KEY);
    if (draft) {
      Object.entries(draft).forEach(([k, v]) => {
        const els = $$(`[name="${k}"]`, apply);
        els.forEach((el) => { if (el.type === 'radio') el.checked = el.value === v; else if (el.type === 'checkbox') el.checked = !!v; else el.value = v; });
      });
    }
    function saveDraft() {
      const data = {};
      $$('input, select, textarea', apply).forEach((el) => {
        if (!el.name) return;
        if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
        else if (el.type === 'checkbox') data[el.name] = el.checked;
        else data[el.name] = el.value;
      });
      store.set(KEY, data);
    }

    function syncConditional() {
      $$('[data-if]', apply).forEach((blk) => {
        const [name, val] = blk.dataset.if.split('=');
        const sel = $(`input[name="${name}"]:checked`, apply);
        const show = !!sel && sel.value === val;
        blk.classList.toggle('show', show);
        $$('input, select', blk).forEach((i) => { i.disabled = !show; });
      });
    }
    syncConditional();

    function show(i, focus = true) {
      cur = i;
      steps.forEach((s, n) => s.classList.toggle('active', n === i));
      inds.forEach((li, n) => {
        li.classList.toggle('done', n < i);
        li.classList.toggle('current', n === i);
        if (n === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      back.hidden = i === 0;
      next.hidden = i === steps.length - 1;
      submit.hidden = i !== steps.length - 1;
      if (i === steps.length - 1) renderReview();
      if (focus) {
        const h = $('h3', steps[i]);
        h && h.focus({ preventScroll: true });
        const top = panel.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 16;
        if (panel.getBoundingClientRect().top < 0) window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    function validateStep(i) {
      let firstBad = null;
      const seen = new Set();
      $$('input, select, textarea', steps[i]).forEach((el) => {
        if (el.type === 'radio') { if (seen.has(el.name)) return; seen.add(el.name); }
        if (!validateControl(el) && !firstBad) firstBad = el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }
    function valueOf(name) {
      const el = $(`[name="${name}"]`, apply);
      if (!el) return '';
      if (el.type === 'radio') {
        const c = $(`input[name="${name}"]:checked`, apply);
        return c ? (c.dataset.label || c.value) : '';
      }
      if (el.tagName === 'SELECT') return el.value ? el.options[el.selectedIndex].text : '';
      if (el.dataset.type === 'mobile' && el.value) return '+91 ' + el.value.replace(/(\d{5})(\d{5})/, '$1 $2');
      return el.value.trim();
    }
    function renderReview() {
      const wrap = $('[data-review]', apply);
      const delivers = valueOf('delivers');
      const groups = [
        { step: 0, title: 'Business details', ic: 'store', rows: [['Store name', 'store_name'], ['Owner / contact person', 'owner_name'], ['Mobile number', 'mobile'], ['Business type', 'business_type']] },
        { step: 1, title: 'Location', ic: 'pin', rows: [['Store address', 'address'], ['Area', 'area'], ['City', 'city'], ['Pincode', 'pincode'], ['Preferred service area', 'service_area']] },
        { step: 2, title: 'Delivery', ic: 'scooter', rows: [['Currently provides delivery', 'delivers']].concat(delivers === 'Yes' ? [['Approximate delivery radius', 'radius'], ['Has own riders', 'own_riders']] : []) }
      ];
      wrap.innerHTML = groups.map((g) => `
        <section class="rv" aria-label="${g.title}">
          <div class="rv-head"><h4><span class="ico sm">${icon(g.ic)}</span>${g.title}</h4>
          <button type="button" class="edit-btn" data-goto="${g.step}">${icon('edit')}Edit<span class="sr-only"> ${g.title}</span></button></div>
          <dl>${g.rows.map(([l, n]) => `<dt>${l}</dt><dd>${esc(valueOf(n) || '—')}</dd>`).join('')}</dl>
        </section>`).join('');
    }

    apply.addEventListener('input', (e) => { const f = fieldOf(e.target); if (f && f.classList.contains('invalid')) validateControl(e.target); saveDraft(); });
    apply.addEventListener('change', (e) => {
      if (e.target.type === 'radio') { syncConditional(); validateControl(e.target); }
      saveDraft();
    });
    apply.addEventListener('focusout', (e) => {
      const el = e.target;
      if (el.matches('input:not([type=radio]):not([type=checkbox]), select, textarea') && el.value) validateControl(el);
    });
    apply.addEventListener('click', (e) => {
      const g = e.target.closest('[data-goto]');
      if (g) show(Number(g.dataset.goto));
    });
    next.addEventListener('click', () => { if (validateStep(cur)) show(cur + 1); });
    back.addEventListener('click', () => show(cur - 1));
    apply.addEventListener('submit', (e) => {
      e.preventDefault();
      if (cur !== steps.length - 1) { if (validateStep(cur)) show(cur + 1); return; }
      for (let i = 0; i < steps.length; i++) { if (!validateStep(i)) { show(i); validateStep(i); return; } }
      // Frontend preview only: nothing leaves the browser.
      apply.hidden = true;
      done.classList.add('show');
      $('[data-done-name]', done).textContent = valueOf('store_name');
      const h = $('h3', done); h && h.focus();
      store.del(KEY);
    });
    $('[data-restart]', done) && $('[data-restart]', done).addEventListener('click', () => {
      apply.reset();
      syncConditional();
      $$('.field', apply).forEach(clearError);
      done.classList.remove('show');
      apply.hidden = false;
      show(0);
    });
    show(0, false);
  }

  /* ---------- store login (UI demonstration) ---------- */
  const login = $('[data-login]');
  if (login) {
    const s1 = $('[data-lstep="phone"]', login);
    const s2 = $('[data-lstep="otp"]', login);
    const s3 = $('[data-lstep="done"]', login);
    const mobile = $('#login-mobile', login);
    const boxes = $$('.otp input', login);
    const resendBtn = $('[data-resend]', login);
    const timerEl = $('[data-timer]', login);
    let timer = null;
    digitsOnly(mobile, 10);
    const go = (el) => { [s1, s2, s3].forEach((s) => s.classList.toggle('active', s === el)); const h = $('h2, h3, label', el); };
    function startTimer() {
      let left = 30;
      resendBtn.disabled = true;
      clearInterval(timer);
      const tick = () => { timerEl.textContent = left > 0 ? ` in 0:${String(left).padStart(2, '0')}` : ''; if (left <= 0) { clearInterval(timer); resendBtn.disabled = false; } left--; };
      tick();
      timer = setInterval(tick, 1000);
    }
    $('form', s1).addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateControl(mobile)) { mobile.focus(); return; }
      $('[data-sent-to]', login).textContent = '+91 ' + mobile.value.replace(/(\d{5})(\d{5})/, '$1 $2');
      boxes.forEach((b) => { b.value = ''; });
      clearError(fieldOf(boxes[0]));
      go(s2);
      boxes[0].focus();
      startTimer();
    });
    mobile.addEventListener('input', () => { if (fieldOf(mobile).classList.contains('invalid')) validateControl(mobile); });
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => {
        b.value = b.value.replace(/\D/g, '').slice(-1);
        if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
        clearError(fieldOf(b));
      });
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !b.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; e.preventDefault(); }
        if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
        if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
      });
      b.addEventListener('paste', (e) => {
        const d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, boxes.length);
        if (!d) return;
        e.preventDefault();
        d.split('').forEach((ch, k) => { if (boxes[k]) boxes[k].value = ch; });
        (boxes[d.length] || boxes[boxes.length - 1]).focus();
      });
    });
    $('[data-change]', login).addEventListener('click', () => { clearInterval(timer); go(s1); mobile.focus(); });
    resendBtn.addEventListener('click', () => { boxes.forEach((b) => { b.value = ''; }); boxes[0].focus(); startTimer(); $('[data-resent]', login).hidden = false; });
    $('form', s2).addEventListener('submit', (e) => {
      e.preventDefault();
      const code = boxes.map((b) => b.value).join('');
      if (code.length !== boxes.length) { setError(fieldOf(boxes[0]), 'Enter all 6 digits of the code.'); boxes.find((b) => !b.value).focus(); return; }
      clearInterval(timer);
      go(s3);
      const h = $('h2', s3); h && h.focus();
    });
    $('[data-login-restart]', login).addEventListener('click', () => { mobile.value = ''; go(s1); mobile.focus(); });
  }

  /* ---------- support modal ---------- */
  const modal = $('#support-modal');
  if (modal && typeof modal.showModal === 'function') {
    const title = $('[data-modal-title]', modal);
    const topicInput = $('[name="topic"]', modal);
    const form = $('form', modal);
    const result = $('[data-msg-result]', modal);
    let lastTrigger = null;
    $$('[data-support]').forEach((btn) => btn.addEventListener('click', () => {
      lastTrigger = btn;
      title.textContent = btn.dataset.support;
      topicInput.value = btn.dataset.support;
      form.hidden = false; result.hidden = true; form.reset(); topicInput.value = btn.dataset.support;
      $$('.field', form).forEach(clearError);
      modal.showModal();
    }));
    $$('[data-close]', modal).forEach((b) => b.addEventListener('click', () => modal.close()));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
    modal.addEventListener('close', () => { lastTrigger && lastTrigger.focus(); });
    $$('[data-type="mobile"]', form).forEach((el) => digitsOnly(el, 10));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      $$('input, textarea', form).forEach((el) => { if (el.type !== 'hidden' && !validateControl(el)) ok = false; });
      if (!ok) { const bad = $('.invalid input, .invalid textarea', form); bad && bad.focus(); return; }
      form.hidden = true; result.hidden = false; $('b', result).focus();
    });
  }
})();
