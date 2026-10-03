/* =====================================================================
   Our work: the sliding effect, in three scroll scenes.
   The stage stays pinned while the section scrolls past. The big word
   slides sideways the whole way through ("Our" out, "work" in) and photos
   of our work glide across at their own speeds, scattered around it.
   They come in three groups: scene 1 slides in from the right and settles,
   then slides away to the left as scene 2 arrives, which gives way to
   scene 3. The scroll position drives everything, with a little inertia so
   it glides, and scrolling back reverses it. Reduced motion or no
   JavaScript shows the last scene as it is, unmoving.
   ===================================================================== */
(() => {
  const sec = document.getElementById('work-stack');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pin = sec.querySelector('.work-pin');
  const track = sec.querySelector('.work-track');
  const w1 = sec.querySelector('.wd1'), w2 = sec.querySelector('.wd2');
  const caption = sec.querySelector('.work-caption');
  const intro = sec.querySelector('.work-intro');
  const more = sec.querySelector('.work-more');
  if (!pin || !track || !w1 || !w2) return;

  /* when each scene slides in and out, as fractions of the scroll through the section */
  const SCENES = [
    { cls: 'g1', in: [0.02, 0.19], out: [0.35, 0.50] },
    { cls: 'g2', in: [0.35, 0.53], out: [0.67, 0.82] },
    { cls: 'g3', in: [0.67, 0.85], out: null }
  ];
  const num = (el, k, d) => { const v = parseFloat(el.dataset[k]); return isNaN(v) ? d : v; };
  const css = (el, k) => parseFloat(getComputedStyle(el).getPropertyValue(k)) || 0;
  const cfg = [];
  SCENES.forEach((sc, s) => {
    const lis = [...sec.querySelectorAll('.scatter li.' + sc.cls)];
    lis.forEach((li, i) => cfg.push({
      li, s, i, n: lis.length, sc,
      x: css(li, '--x') / 100, y: css(li, '--y') / 100, r: css(li, '--r'),
      dr: num(li, 'dr', 12), dy: num(li, 'dy', 0)
    }));
  });
  if (!cfg.length) return;
  sec.classList.add('is-live');

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const smooth = t => t * t * (3 - 2 * t);
  const span = (p, [a, b]) => clamp((p - a) / (b - a), 0, 1);
  const STAG = 0.45;                 /* how far each photo trails the one before it within its scene */

  let W = 0, H = 0, D = 0, x0 = 0, tgt = 0, cur = 0, raf = null, last = 0;
  const measure = () => {
    W = pin.clientWidth; H = pin.clientHeight;
    const c1 = w1.offsetLeft + w1.offsetWidth / 2, c2 = w2.offsetLeft + w2.offsetWidth / 2;
    D = c2 - c1;                      /* "Our" centred -> "work" centred */
    x0 = W / 2 - c1;
  };
  /* progress of one photo within a scene window; photos at the end of the scene start a little later */
  const part = (u, c) => {
    const lag = STAG * (c.n > 1 ? c.i / (c.n - 1) : 0);
    return clamp((u - lag * 0.6) / (1 - lag * 0.6), 0, 1);
  };

  const paint = p => {
    const wp = smooth(clamp((p - 0.04) / 0.88, 0, 1));
    track.style.transform = 'translate3d(' + (x0 - wp * D).toFixed(1) + 'px,-52%,0)';
    cfg.forEach(c => {
      const w = c.li.offsetWidth, h = c.li.offsetHeight;
      const inn = ease(part(span(p, c.sc.in), c));
      const out = c.sc.out ? ease(part(span(p, c.sc.out), c)) : 0;
      const restX = c.x * W, restY = c.y * H;
      /* from off the right edge, to its resting place, to off the left edge */
      const px = restX + (1 - inn) * (W * 1.2 - restX + w) - out * (restX + w * 1.2 + W * 0.1);
      const py = restY + (1 - inn) * c.dy - out * c.dy * 0.6;
      const rot = c.r + (1 - inn) * c.dr - out * c.dr * 0.6;
      c.li.style.transform = 'translate3d(' + (px - w / 2).toFixed(1) + 'px,' + (py - h / 2).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    });
    if (intro) { intro.style.opacity = (1 - smooth(clamp(p / 0.3, 0, 1))).toFixed(3); intro.style.transform = 'translateX(' + (-p * 60).toFixed(1) + 'px)'; }
    if (caption) { const k = smooth(clamp((p - 0.86) / 0.1, 0, 1)); caption.style.opacity = k.toFixed(3); caption.style.transform = 'translateY(' + ((1 - k) * 14).toFixed(1) + 'px)'; }
    if (more) more.style.opacity = (1 - smooth(clamp((p - 0.86) / 0.1, 0, 1))).toFixed(3);
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
  cfg.forEach(c => { const im = c.li.querySelector('img'); if (im && im.decode) im.decode().then(() => paint(cur), () => {}); });
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { measure(); kick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  init();
})();
