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
