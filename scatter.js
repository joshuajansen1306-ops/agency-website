/* =====================================================================
   Our work: scattered as you scroll.
   The heading stays pinned while the section scrolls past, and our photos
   arrive one by one, landing at their own spots around it. The scroll
   position drives everything (nothing plays by itself), so scrolling back
   up takes them away again. Reduced motion or no JavaScript shows them all
   at once, scattered around the heading.
   ===================================================================== */
(() => {
  const sec = document.getElementById('work-stack');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pin = sec.querySelector('.work-pin');
  const items = [...sec.querySelectorAll('.scatter li')];
  if (!pin || !items.length) return;
  sec.classList.add('is-live');

  const N = items.length;
  const SPREAD = 0.82;                 /* the photos have all arrived by this much of the way through */
  const ease = t => 1 - Math.pow(1 - t, 3);
  const cfg = items.map((li, i) => ({
    li,
    start: (i / N) * SPREAD,
    dur: 0.075,
    rise: 70 + (i % 4) * 22,           /* how far below its spot it starts (px)                   */
    drift: -(18 + (i * 7) % 26),       /* slow parallax drift once it has landed (px over the run) */
    spin: (i % 2 ? 1 : -1) * (6 + (i * 5) % 9)   /* extra tilt it settles out of (deg)              */
  }));
  const rotOf = li => parseFloat(getComputedStyle(li).getPropertyValue('--r')) || 0;
  const base = items.map(rotOf);

  let queued = false;
  const update = () => {
    queued = false;
    const r = sec.getBoundingClientRect();
    const run = Math.max(1, r.height - pin.offsetHeight);
    const p = Math.min(1, Math.max(0, -r.top / run));
    cfg.forEach((c, i) => {
      const t = Math.min(1, Math.max(0, (p - c.start) / c.dur));
      const e = ease(t);
      const y = (1 - e) * c.rise + (t >= 1 ? (p - c.start - c.dur) * c.drift * 3 : 0);
      c.li.style.opacity = e.toFixed(3);
      c.li.style.visibility = t <= 0 ? 'hidden' : 'visible';
      c.li.style.transform = 'translate(-50%,-50%) translateY(' + y.toFixed(1) + 'px) rotate(' + (base[i] + (1 - e) * c.spin).toFixed(2) + 'deg) scale(' + (0.45 + 0.55 * e).toFixed(3) + ')';
    });
    if (p > 0.02) sec.classList.add('has-scrolled'); else sec.classList.remove('has-scrolled');
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
})();
