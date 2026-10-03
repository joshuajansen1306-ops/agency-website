/* =====================================================================
   Our work: a cursor trail.
   Move the mouse (or drag a finger) across the stage and photos of our work
   pop up along the path, each tilted a little, stacking on top of one another
   and fading away a moment later. The photos come from the list in the
   markup, in order, and loop. Reduced motion or no JavaScript leaves the
   plain list showing instead.
   ===================================================================== */
(() => {
  const stage = document.getElementById('work-stack');
  if (!stage) return;
  const layer = stage.querySelector('.trail-layer');
  const srcs = [...stage.querySelectorAll('.trail-src img')].map(i => i.currentSrc || i.src);
  if (!layer || !srcs.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stage.classList.add('is-live');

  const MAX = 9;                 /* photos on screen at once          */
  const LIFE = 2600;             /* ms before a photo fades away      */
  let idx = 0, z = 1, lastX = null, lastY = null, moved = false;
  const items = [];

  /* have every image decoded before the first one is needed, so none ever pops up empty */
  let warmed = false;
  const warm = () => {
    if (warmed) return; warmed = true;
    srcs.forEach(s => { const im = new Image(); im.src = s; if (im.decode) im.decode().catch(() => {}); });
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { warm(); o.disconnect(); } }, { rootMargin: '900px 0px' }).observe(stage);
  } else warm();

  const retire = el => {
    const k = items.indexOf(el); if (k < 0) return;
    items.splice(k, 1);
    el.classList.remove('in'); el.classList.add('out');
    setTimeout(() => el.remove(), 480);
  };

  const spawn = (x, y) => {
    const el = document.createElement('div');
    el.className = 'trail-item';
    el.style.left = x.toFixed(1) + 'px';
    el.style.top = y.toFixed(1) + 'px';
    el.style.setProperty('--r', (Math.random() * 24 - 12).toFixed(1) + 'deg');
    el.style.zIndex = ++z;
    const im = new Image(); im.alt = ''; im.decoding = 'async'; im.draggable = false; im.src = srcs[idx++ % srcs.length];
    el.appendChild(im);
    layer.appendChild(el);
    items.push(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    setTimeout(() => retire(el), LIFE);
    while (items.length > MAX) retire(items[0]);
  };

  const stepPx = () => Math.max(80, Math.min(190, innerWidth * 0.1));   /* how far the pointer travels between photos */
  const local = e => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  const handle = (x, y) => {
    warm();
    if (lastX === null || Math.hypot(x - lastX, y - lastY) >= stepPx()) {
      spawn(x, y); lastX = x; lastY = y;
      if (!moved) { moved = true; stage.classList.add('has-moved'); }
    }
  };
  /* mouse and pen */
  stage.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const [x, y] = local(e); handle(x, y);
  }, { passive: true });
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    const [x, y] = local(e); lastX = lastY = null; handle(x, y);
  }, { passive: true });
  /* touch: touch events keep arriving even while the page scrolls, so a diagonal drag still leaves a trail */
  stage.addEventListener('touchstart', e => {
    const t = e.touches[0]; if (!t) return;
    const [x, y] = local(t); lastX = lastY = null; handle(x, y);
  }, { passive: true });
  stage.addEventListener('touchmove', e => {
    const t = e.touches[0]; if (!t) return;
    const [x, y] = local(t); handle(x, y);
  }, { passive: true });
  stage.addEventListener('touchend', () => { lastX = lastY = null; }, { passive: true });
  stage.addEventListener('pointerleave', () => { lastX = lastY = null; });

  /* a little demonstration the first time the stage is on screen, so it is clear what the page does */
  let demoed = false;
  const demo = () => {
    if (demoed || moved) return; demoed = true;
    const w = stage.clientWidth, h = stage.clientHeight;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (moved) return;
        const t = i / 5;
        spawn(w * (0.22 + 0.56 * t), h * (0.5 + 0.14 * Math.sin(t * Math.PI * 1.6)));
      }, 350 + i * 230);
    }
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { warm(); setTimeout(demo, 250); o.disconnect(); } }, { threshold: 0.55 }).observe(stage);
  }
})();
