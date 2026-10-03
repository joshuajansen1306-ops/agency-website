/* =====================================================================
   Our work: the sliding effect.
   The stage stays pinned while the section scrolls past. As you scroll,
   the big word slides sideways ("Our" out, "work" in) and the photos glide
   across at their own speeds: the first three start in view and slide off
   to the left, the rest sweep in from the right and settle in a loose arc
   around "work". The scroll position drives all of it, with a little
   inertia so it glides, and scrolling back up reverses it. Reduced motion
   or no JavaScript leaves the finished arrangement showing, unmoving.
   ===================================================================== */
(() => {
  const sec = document.getElementById('work-stack');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pin = sec.querySelector('.work-pin');
  const track = sec.querySelector('.work-track');
  const w1 = sec.querySelector('.wd1'), w2 = sec.querySelector('.wd2');
  const lis = [...sec.querySelectorAll('.scatter li')];
  const caption = sec.querySelector('.work-caption');
  const intro = sec.querySelector('.work-intro');
  const more = sec.querySelector('.work-more');
  if (!pin || !track || !w1 || !w2 || !lis.length) return;
  sec.classList.add('is-live');

  const HOLD = 0.9;                     /* the whole move is done after this much of the scroll; the rest holds still */
  const num = (el, k, d) => { const v = parseFloat(el.dataset[k]); return isNaN(v) ? d : v; };
  const cfg = lis.map(li => ({
    li, isA: li.classList.contains('a'),
    x: num(li, 'x', 50) / 100, y: num(li, 'y', 50) / 100, r: num(li, 'r', 0),
    t: num(li, 't', 1.3), s: num(li, 's', 0), dr: num(li, 'dr', 12), dy: num(li, 'dy', 0)
  }));

  let W = 0, H = 0, D = 0, x0 = 0, tgt = 0, cur = 0, raf = null, last = 0;
  const measure = () => {
    W = pin.clientWidth; H = pin.clientHeight;
    const c1 = w1.offsetLeft + w1.offsetWidth / 2, c2 = w2.offsetLeft + w2.offsetWidth / 2;
    D = c2 - c1;                        /* how far the heading slides: "Our" centred -> "work" centred */
    x0 = W / 2 - c1;
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);

  const paint = p => {
    track.style.transform = 'translate3d(' + (x0 - p * D).toFixed(1) + 'px,-52%,0)';
    cfg.forEach(c => {
      const w = c.li.offsetWidth;
      let px, py = c.y * H + (1 - p) * c.dy;
      if (c.isA) px = c.x * W - p * c.t * W;                                  /* starts in view, slides off to the left   */
      else px = c.x * W + (1 - p) * ((1.15 + c.s) * W - c.x * W + w / 2);     /* starts off the right edge, settles at x  */
      const rot = c.r + (c.isA ? p : (1 - p)) * c.dr;
      c.li.style.transform = 'translate3d(' + (px - w / 2).toFixed(1) + 'px,' + (py - c.li.offsetHeight / 2).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    });
    /* the small texts: the intro slides away with the first words, the caption arrives once "work" has landed */
    if (intro) { intro.style.opacity = (1 - smooth(clamp(p / 0.35, 0, 1))).toFixed(3); intro.style.transform = 'translateX(' + (-p * 60).toFixed(1) + 'px)'; }
    if (caption) { const k = smooth(clamp((p - 0.72) / 0.2, 0, 1)); caption.style.opacity = k.toFixed(3); caption.style.transform = 'translateY(' + ((1 - k) * 14).toFixed(1) + 'px)'; }
    if (more) more.style.opacity = (1 - smooth(clamp((p - 0.75) / 0.2, 0, 1))).toFixed(3);
  };

  const read = () => {
    const r = sec.getBoundingClientRect();
    const run = Math.max(1, r.height - pin.offsetHeight);
    tgt = clamp(-r.top / run / HOLD, 0, 1);
  };
  const loop = now => {
    raf = null;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    cur += (tgt - cur) * (1 - Math.exp(-dt * 9));            /* a little inertia, so it glides */
    if (Math.abs(tgt - cur) < 0.0004) cur = tgt;
    paint(cur);
    if (cur !== tgt) raf = requestAnimationFrame(loop);
  };
  const kick = () => { read(); if (raf === null) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  const init = () => { measure(); read(); cur = tgt; paint(cur); };
  /* decode every photo up front: ones that start off-screen are otherwise left blank until something repaints them */
  lis.forEach(li => { const im = li.querySelector('img'); if (im && im.decode) im.decode().then(() => paint(cur), () => {}); });
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { measure(); kick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  init();
})();
