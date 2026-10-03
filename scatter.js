/* =====================================================================
   Our work: two tidy rows that slide through.
   The stage stays pinned while the section scrolls past. First a row of
   six pieces slides in from the right (each piece a touch behind the one
   before it, so they fan in like cards being dealt), holds in place, then
   slides away to the left while the second row (the rest of the work)
   slides in after it. The scroll position drives all of it, with a little
   inertia so it glides, and scrolling back up reverses it. Reduced motion
   or no JavaScript shows both rows one under the other, unmoving.
   ===================================================================== */
(() => {
  const sec = document.getElementById('work-stack');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pin = sec.querySelector('.work-pin');
  const sets = [...sec.querySelectorAll('.set')].map(ul => ({ ul, lis: [...ul.children] }));
  if (!pin || sets.length < 2) return;
  const caption = sec.querySelector('.work-caption');
  const intro = sec.querySelector('.work-intro');
  const more = sec.querySelector('.work-more');
  sec.classList.add('is-live');

  /* the timeline, as fractions of the scroll through the section */
  const T = {
    in1: [0.04, 0.30],      /* first row slides in             */
    out1: [0.52, 0.76],     /* first row slides away           */
    in2: [0.52, 0.80],      /* second row slides in behind it  */
    cap: [0.82, 0.95]       /* caption fades up at the end     */
  };
  const STAG = 0.07;        /* how far each piece trails the one before it (fraction of its own slide) */

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const smooth = t => t * t * (3 - 2 * t);
  const span = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);

  let W = 0, H = 0, tgt = 0, cur = 0, raf = null, last = 0;
  const measure = () => { W = innerWidth; H = pin.clientHeight; };

  /* progress of piece i of n inside a window, with each piece trailing the one before */
  const piece = (u, i, n) => {
    const lag = STAG * i / Math.max(1, n - 1);
    return ease(clamp((u - lag) / (1 - STAG), 0, 1));
  };

  const paint = p => {
    const u1 = span(p, T.in1), o1 = span(p, T.out1), u2 = span(p, T.in2);
    sets.forEach((s, k) => {
      const n = s.lis.length;
      s.lis.forEach((li, i) => {
        let x;
        if (k === 0) {
          const inn = piece(u1, i, n), out = piece(o1, i, n);
          x = (1 - inn) * W * 1.15 - out * W * 1.15;
        } else {
          const inn = piece(u2, i, n);
          x = (1 - inn) * W * 1.25;
        }
        li.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      });
    });
    if (intro) { intro.style.opacity = (1 - smooth(clamp(p / 0.2, 0, 1))).toFixed(3); }
    if (caption) { const c = smooth(span(p, T.cap)); caption.style.opacity = c.toFixed(3); caption.style.transform = 'translateY(' + ((1 - c) * 14).toFixed(1) + 'px)'; }
    if (more) more.style.opacity = (1 - smooth(span(p, [0.8, 0.95]))).toFixed(3);
  };

  const read = () => {
    const r = sec.getBoundingClientRect();
    const run = Math.max(1, r.height - pin.offsetHeight);
    tgt = clamp(-r.top / run, 0, 1);
  };
  const loop = now => {
    raf = null;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    cur += (tgt - cur) * (1 - Math.exp(-dt * 9));
    if (Math.abs(tgt - cur) < 0.0004) cur = tgt;
    paint(cur);
    if (cur !== tgt) raf = requestAnimationFrame(loop);
  };
  const kick = () => { read(); if (raf === null) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  const init = () => { measure(); read(); cur = tgt; paint(cur); };
  /* decode every photo up front: ones that start off-screen are otherwise left blank until something repaints them */
  sets.forEach(s => s.lis.forEach(li => { const im = li.querySelector('img'); if (im && im.decode) im.decode().then(() => paint(cur), () => {}); }));
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { measure(); kick(); });
  init();
})();
