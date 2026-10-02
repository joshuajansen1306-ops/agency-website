(() => {
  const scroller = document.querySelector('.home-scroll');
  const stack = document.querySelector('.stack');
  if (!scroller || !stack || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Repeat the real posts so the stack has enough depth to travel through.
  const originals = [...stack.querySelectorAll('.stack-card')];
  const SETS = matchMedia('(max-width: 640px)').matches ? 2 : 3;
  for (let s = 1; s < SETS; s++) {
    originals.forEach((card, k) => {
      const clone = card.cloneNode(true);
      clone.style.setProperty('--i', s * originals.length + k);
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      stack.append(clone);
    });
  }
  const cards = [...stack.querySelectorAll('.stack-card')];
  const index = cards.map(c => parseFloat(c.style.getPropertyValue('--i')));
  const maxShift = cards.length - originals.length;
  scroller.style.height = `calc(${maxShift * 42}vh + 100svh - var(--topbar-h))`;

  const culled = cards.map(() => false);
  let target = 0, current = 0, frame = null;
  const render = () => {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.001) current = target;
    stack.style.setProperty('--shift', current.toFixed(4));
    cards.forEach((c, n) => {
      const d = index[n] - current;
      c.classList.toggle('is-past', d < -0.6);
      const cull = d < -1.2 || d > 8.5; // fully transparent or off-screen: drop from the render tree
      if (cull !== culled[n]) { culled[n] = cull; c.classList.toggle('is-culled', cull); }
    });
    frame = current === target ? null : requestAnimationFrame(render);
  };
  const read = () => {
    const total = scroller.offsetHeight - innerHeight;
    const scrolled = Math.min(Math.max(-scroller.getBoundingClientRect().top, 0), total);
    const p = total > 0 ? scrolled / total : 0;
    target = p * maxShift;
    if (!frame) frame = requestAnimationFrame(render);
  };
  addEventListener('scroll', read, { passive: true });
  addEventListener('resize', read);
  read();
})();

(() => {
  const now = document.querySelector('.stack-now');
  if (!now) return;
  const show = card => {
    now.innerHTML = '';
    now.append(card.dataset.title);
    const who = document.createElement('span');
    who.textContent = card.dataset.client;
    now.append(who);
    now.classList.add('on');
  };
  const hide = () => now.classList.remove('on');
  document.querySelectorAll('.stack-card').forEach(card => {
    card.addEventListener('mouseenter', () => show(card));
    card.addEventListener('focus', () => show(card));
    card.addEventListener('mouseleave', hide);
    card.addEventListener('blur', hide);
  });
})();

(() => {
  const el = document.querySelector('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' });
  const tick = () => {
    const now = new Date();
    el.textContent = fmt.format(now);
    el.dateTime = now.toISOString();
  };
  tick();
  setInterval(tick, 15000);
})();

(() => {
  // The page below About us starts as the same icy blue, so there is no colour edge, and then
  // turns to #0F1E3D as you scroll into it. It follows the scroll position (not a timer).
  // The text colours flip at the halfway point so nothing sits in muddy mid-tones.
  const scroller = document.querySelector('.home-scroll');
  if (!scroller) return;
  const from = [214, 236, 250], to = [15, 30, 61];    // #D6ECFA -> #0F1E3D
  const bar = [212, 231, 247];                         // the top bar's icy blue, #D4E7F7
  const root = document.documentElement;
  let queued = false;
  const update = () => {
    queued = false;
    const top = scroller.getBoundingClientRect().top;
    const start = innerHeight * 0.6, end = -innerHeight * 0.4;   // from just entering view to a little way in
    const p = Math.min(1, Math.max(0, (start - top) / (start - end)));
    const e = p * p * (3 - 2 * p);                                // gentle ease in and out
    root.style.setProperty('--bg', 'rgb(' + from.map((v, i) => Math.round(v + (to[i] - v) * e)).join(' ') + ')');
    // The icy-blue top bar follows the same scroll: its fill moves to the same navy, and its
    // text flips to light at the halfway point, so it never sits in muddy mid-tones.
    root.style.setProperty('--topbar-bg', 'rgb(' + bar.map((v, i) => Math.round(v + (to[i] - v) * e)).join(' ') + ')');
    root.style.setProperty('--topbar-line', 'rgb(238 244 250 / ' + (0.14 * e).toFixed(3) + ')');
    const dark = e > 0.5;
    root.style.setProperty('--text', dark ? '#EEF4FA' : '#0A1826');
    root.style.setProperty('--text-muted', dark ? 'rgb(238 244 250 / .6)' : 'rgb(10 24 38 / .66)');
    root.style.setProperty('--line', dark ? 'rgb(238 244 250 / .14)' : 'rgb(10 24 38 / .16)');
    root.style.setProperty('--topbar-text', dark ? '#EEF4FA' : '#0A1826');
    root.style.setProperty('--topbar-muted', dark ? 'rgb(238 244 250 / .7)' : 'rgb(10 24 38 / .72)');
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
})();

(() => {
  // Proof in numbers: each figure counts up once, the first time it scrolls into view.
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if (!nums.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fmt = (el, v) => {
    const d = +el.dataset.decimals || 0;
    return (el.dataset.prefix || '') + v.toFixed(d) + (el.dataset.suffix || '');
  };
  nums.forEach(el => { el.textContent = fmt(el, 0); });
  const run = el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(el, end * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { io.unobserve(en.target); run(en.target); }
  }), { threshold: 0.6 });
  nums.forEach(el => io.observe(el));
})();
