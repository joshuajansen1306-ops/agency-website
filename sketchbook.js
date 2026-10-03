/* =====================================================================
   Sketchbook hero: the opening of the book.
   Adapted from the "Sketchbook" landing page (ThreeUI). The leaf that turns
   is a real curved surface: a chain of nested strips whose tangent sweeps
   through an arc, so the page bends the way paper bends instead of pivoting
   like a flat door. On load the book riffles through its pages, then rests
   open on its last spread. Reduced motion, data-saver and very slow
   connections skip the riffle and show that spread straight away.
   ===================================================================== */
(() => {
  const wrap = document.getElementById('sbWrap');
  if (!wrap) return;
  const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* always open at the top so the book's opening is what you see. Browsers
     otherwise restore the scroll position from the last visit, and a leftover
     #section in the address bar would jump straight past the hero. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  scrollTo(0, 0);
  /* the browser can still apply a scroll after load; undo it unless the visitor has already started scrolling */
  let userScrolled = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(t => addEventListener(t, () => { userScrolled = true; }, { once: true, passive: true }));
  addEventListener('load', () => { if (!userScrolled && scrollY) scrollTo(0, 0); });

  /* the scroll cue glides down without writing a #hash into the URL */
  const cue = document.querySelector('.sk-down');
  if (cue) cue.addEventListener('click', e => {
    const target = document.getElementById('about-us');
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
  });

  const sb3d = document.getElementById('sb3d');
  const book = document.getElementById('sbBook');

  const DIR = 'images/sketchbook/';
  /* one spread per spot in the riffle, so no page is ever shown twice */
  const PAGES = Array.from({ length: 16 }, (_, i) => ({ url: DIR + 'spread-' + String(i + 1).padStart(2, '0') + '.webp?v=9' }));
  const M = PAGES.length, LAND = M - 1;
  const LOOP_REST_MS = 4500;     /* how long the book rests open on its last spread before it turns again */

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection;
  const STILL = REDUCED || !!(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));

  /* the footer is pinned to the bottom of the viewport, so give it dark ink
     while the cream hero is what sits behind it */
  let ticking = false;
  const paperSections = document.querySelectorAll('.sk-hero, .sk-paper');
  const paperUnderFooter = () => {
    ticking = false;
    const onPaper = [...paperSections].some(el => {
      const r = el.getBoundingClientRect();
      return r.top < innerHeight - 20 && r.bottom > innerHeight - 56;
    });
    document.body.classList.toggle('on-paper', onPaper);
  };
  const queueFooter = () => { if (!ticking) { ticking = true; requestAnimationFrame(paperUnderFooter); } };
  addEventListener('scroll', queueFooter, { passive: true });
  addEventListener('resize', queueFooter);
  paperUnderFooter();

  /* ------------------------------------------------ the turning leaf */
  let N = 18;              /* strips: enough for a smooth curve (fewer on a slow screen) */
  const SPAN = 0.449;      /* gutter to outer page edge, as a fraction   */
  const BETA = 0.60;       /* peak curl of the arc, radians              */
  let idx = 0, turn = null; /* turn = {dir, from, to, t}                 */
  let strips = [];         /* the chain, kept for per-frame lighting     */

  function el(t, c) { const e = document.createElement(t); if (c) e.className = c; return e; }
  function imgEl(i, side) {
    const im = new Image(); im.className = 'sb-half-img ' + side;
    im.draggable = false; im.alt = ''; im.src = PAGES[i].url; return im;
  }
  function halfEl(pos, i) {
    const d = el('div', 'sb-half ' + pos);
    d.appendChild(imgEl(i, pos));
    d.appendChild(el('div', 'gutter-shade ' + pos));
    return d;
  }
  /* build the strip chain once per turn; background offsets are pure
     geometry, so they never need touching again while it animates */
  function buildCurl(dir, from, to) {
    strips = [];
    const c = el('div', 'curl ' + dir);
    c.style.setProperty('--n', N);
    c.style.setProperty('--span', SPAN);
    let host = c;
    for (let i = 0; i < N; i++) {
      const s = el('div', 'strip');
      s.style.setProperty('--i', i);
      const gut = 'calc(var(--bw) * 0.5)';
      const sw = 'calc(var(--bw) * ' + SPAN + ' / ' + N + ')';
      const A = 'calc(-1 * (' + gut + ' + ' + i + ' * ' + sw + '))';   /* faces the from-page */
      const B = 'calc(' + (i + 1) + ' * ' + sw + ' - ' + gut + ')';    /* faces the to-page   */
      const f = el('div', 'face front'), b = el('div', 'face back');
      const dress = (e, url, px) => {
        e.style.backgroundImage = 'url(' + url + ')';
        e.style.backgroundPositionX = px;
      };
      dress(f, PAGES[from].url, dir === 'next' ? A : B);
      dress(b, PAGES[to].url, dir === 'next' ? B : A);
      f.appendChild(el('div', 'sh')); f.appendChild(el('div', 'gl'));
      b.appendChild(el('div', 'sh')); b.appendChild(el('div', 'gl'));
      s.appendChild(f); s.appendChild(b);
      if (i === N - 1) s.classList.add('edge');
      host.appendChild(s); host = s;
      strips.push(s);
    }
    return c;
  }
  function applyTurn(t) {
    const th = Math.PI * t;                       /* how far the leaf has swung */
    const beta = BETA * Math.sin(Math.PI * t);    /* it is flat at both ends    */
    const D = 180 / Math.PI;
    const tt = th + beta, td = 2 * beta / N;
    sb3d.style.setProperty('--tt', (tt * D).toFixed(2) + 'deg');
    sb3d.style.setProperty('--td', (td * D).toFixed(3) + 'deg');
    sb3d.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3));
    for (let i = 0; i < strips.length; i++) {
      const l1 = Math.abs(Math.cos(tt - i * td));        /* facing at this strip's near edge */
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td));  /* ...and at its far edge           */
      const st = strips[i].style;
      st.setProperty('--lit', l1.toFixed(3));
      st.setProperty('--a1', ((1 - l1) * .62).toFixed(3));
      st.setProperty('--a2', ((1 - l2) * .62).toFixed(3));
    }
  }
  function paint() {
    book.textContent = '';
    if (!turn) {
      const f = el('div', 'sb-full');
      const im = new Image(); im.src = PAGES[idx].url; im.alt = '';
      im.draggable = false;
      f.appendChild(im); book.appendChild(f);
      sb3d.style.setProperty('--shade', '0');
    } else {
      const next = turn.dir === 'next';
      book.appendChild(halfEl('left', next ? turn.from : turn.to));
      book.appendChild(halfEl('right', next ? turn.to : turn.from));
      book.appendChild(buildCurl(turn.dir, turn.from, turn.to));
      applyTurn(turn.t);
    }
    layout();
    if (!introOn) syncZoomLayer();   /* no magnified copy while the pages are flying: it doubles the work */
    placeLoupe();
  }
  function layout() { sb3d.style.setProperty('--bw', book.clientWidth + 'px'); }
  addEventListener('resize', layout);

  /* ------------------------------------------------------ tween loop */
  /* the riffle wants a fixed tempo, not a spring settling time */
  let spring = null;
  function tweenTo(target, dur, onDone) {
    spring = { from: turn ? turn.t : 0, target: target, dur: dur, t0: performance.now(), done: onDone };
    kick();
  }
  let raf = null, last = 0;
  function tick(now) {
    raf = null;
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016); last = now;
    if (spring && turn) {
      const s = spring;
      /* measured on the clock, not frame by frame: a slow or battery-saving screen drops frames
         but the page still turns in the same time, instead of crawling */
      const k = Math.min(1, (performance.now() - s.t0) / (s.dur * 1000));
      turn.t = s.from + (s.target - s.from) * k;
      applyTurn(turn.t);
      if (k >= 1) { spring = null; const d = s.done; d && d(); }
    }
    viewSpring();
    /* kick() may already have queued the next frame from a done-callback */
    if ((spring || viewActive) && raf === null) raf = requestAnimationFrame(tick);
  }
  function kick() { if (raf === null) { last = performance.now(); raf = requestAnimationFrame(tick); } }

  /* ------------------------------------------------ tilt of the book */
  const TILT_X = 4.5, TILT_Y = 7;      /* degrees: deliberately restrained */
  const view = { rx: 0, ry: 0, trx: 0, try_: 0 };
  let viewActive = false;
  function applyView() {
    sb3d.style.setProperty('--rx', view.rx.toFixed(2) + 'deg');
    sb3d.style.setProperty('--ry', view.ry.toFixed(2) + 'deg');
  }
  function viewSpring() {
    const e = 0.14;
    let moved = false;
    for (const [k, t] of [['rx', 'trx'], ['ry', 'try_']]) {
      const d = view[t] - view[k];
      if (Math.abs(d) > 0.0006) { view[k] += d * e; moved = true; }
      else view[k] = view[t];
    }
    if (moved) applyView();
    viewActive = moved;
    return moved;
  }
  function setView(rx, ry) {
    view.trx = Math.max(-TILT_X, Math.min(TILT_X, rx));
    view.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry));
    viewActive = true; kick();
  }
  /* the book leans toward the cursor: no dragging, and never far */
  function tiltTo(cx, cy) {
    const r = book.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
    const nx = Math.max(-1, Math.min(1, (cx - (r.left + r.width / 2)) / (r.width * 0.62)));
    const ny = Math.max(-1, Math.min(1, (cy - (r.top + r.height / 2)) / (r.height * 0.9)));
    setView(-ny * TILT_X, nx * TILT_Y);
  }
  if (!STILL) {
    addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      tiltTo(e.clientX, e.clientY);
    }, { passive: true });
    addEventListener('pointerout', e => { if (!e.relatedTarget) setView(0, 0); });
    addEventListener('blur', () => setView(0, 0));
  }

  /* --------------------------------------------------------- the loupe */
  const loupe = document.getElementById('loupe');
  const zoomWrap = document.getElementById('zoomWrap');
  const zoomInner = document.getElementById('zoomInner');
  const MAG = 1.8;     /* the page art is only so sharp: more than this just enlarges blur */
  let lx = null, ly = null;

  function loupeSize() { return Math.round(Math.max(110, Math.min(262, book.clientWidth * 0.235))); }
  /* the loupe's own coordinate space: pixels of the book's untransformed frame */
  function bookBox() { return { x: 0, y: 0, w: book.clientWidth, h: book.clientHeight }; }
  const restX = () => 0.82;      /* the same spot on every screen size: lower right of the book */
  const restY = 0.7;      /* over the waterline and reflections, lower right of the book */
  /* park it on the desk at the lower right, half off the book */
  function restLoupe() {
    const b = bookBox();
    lx = b.x + b.w * restX(); ly = b.y + b.h * restY;
    placeLoupe();
  }
  /* mirror whatever the book is currently showing into the magnified copy */
  function syncZoomLayer() {
    zoomInner.textContent = '';
    for (const c of book.children) zoomInner.appendChild(c.cloneNode(true));
  }
  function placeLoupe() {
    if (lx === null) return;
    const B = bookBox(), bw = B.w, bh = B.h;
    if (!bw) return;
    const R = loupeSize() / 2, bez = R * 2 * 0.058;
    loupe.style.setProperty('--lr', R * 2 + 'px');
    loupe.style.transform = 'translate3d(' + (lx - R).toFixed(1) + 'px,' + (ly - R).toFixed(1) + 'px,0)';
    loupe.classList.add('on');
    if (introOn) { zoomWrap.style.opacity = '0'; return; }

    /* where the paper's edges actually land */
    const cx = bw / 2, cy = bh / 2;
    const x0 = bw * .051, x1 = bw * .949, y0 = bh * .218, y1 = bh * .782;
    /* How far the glass's own centre is inside the paper. The copy fades out as it
       wanders off the sheet, so you are left looking through plain glass rather than
       at a sliver of page on flat desk. */
    const nx = Math.max(x0, Math.min(lx, x1));
    const ny = Math.max(y0, Math.min(ly, y1));
    const inside = (lx > x0 && lx < x1 && ly > y0 && ly < y1)
      ? Math.min(lx - x0, x1 - lx, ly - y0, y1 - ly)
      : -Math.hypot(lx - nx, ly - ny);
    const k = Math.max(0, Math.min(1, (inside + R * 0.30) / (R * 0.55)));

    zoomWrap.style.opacity = k.toFixed(3);
    if (k <= 0.002) return;
    const r = (R - bez).toFixed(1);
    const mask = 'radial-gradient(circle ' + r + 'px at ' + lx.toFixed(1) + 'px ' + ly.toFixed(1) + 'px,'
      + '#000 calc(100% - 1px),transparent 100%)';
    zoomWrap.style.webkitMaskImage = mask;
    zoomWrap.style.maskImage = mask;
    /* the page point beneath the glass, magnified about that same spot so the
       lens keeps showing MAG times whatever is on screen */
    const px = lx, py = ly, s = MAG;
    zoomInner.style.transform = 'translate(' + (lx - px * s).toFixed(1) + 'px,' + (ly - py * s).toFixed(1) + 'px) '
      + 'scale(' + s.toFixed(4) + ')';
  }
  addEventListener('resize', () => { lx = null; restLoupe(); });

  /* ------------------------------------------------------ turn control */
  function startTurn(dir, t) {
    spring = null;
    if (turn) { idx = turn.to; turn = null; }      /* settle anything still in flight */
    const from = idx;
    turn = { dir: dir, from: from, to: dir === 'next' ? (from + 1) % M : (from - 1 + M) % M, t: t || 0 };
    paint();
  }

  /* ---------------------------------------------------------- the riffle */
  let riffle = null, riffleAt = 0, introOn = false;
  function endIntro() {
    introOn = false; wrap.classList.remove('intro', 'b2');
  }
  /* each turn waits for its own page, so the riffle can start before every spread has arrived;
     on a slow link it simply pauses on the current page until the next one is in */
  const pageOk = PAGES.map(() => false);
  const pageReady = [];
  let startPage = i => Promise.resolve(false);
  function riffleStep() {
    const s = riffle[riffleAt];
    const next = (idx + 1) % M;
    const go = () => {
      wrap.classList.add('intro');
      wrap.classList.toggle('b2', s.bell > 0.55);
      startTurn('next', 0);
      tweenTo(1, s.dur, () => {
        idx = turn.to; turn = null;
        riffleAt++;
        if (introOn && riffleAt < riffle.length) { paint(); riffleStep(); }
        else { endIntro(); paint(); scheduleLoop(); }
      });
    };
    if (pageOk[next]) { go(); return; }
    wrap.classList.remove('intro', 'b2');                       /* no blur while waiting on a page */
    within(startPage(next), 6000).then(ok => {
      if (ok && introOn) go();
      else { endIntro(); idx = LAND; paint(); }  /* a page never arrived: settle on the last spread */
    });
  }
  /* keep it going: rest on the last spread for a few seconds, then turn through the whole book again.
     It only plays while the hero is on screen and the tab is in front, so it costs nothing in the background. */
  let heroOn = true, loopTimer = null;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { heroOn = es[es.length - 1].isIntersecting; if (heroOn) queueLoop(); }, { threshold: 0.25 })
      .observe(document.querySelector('.sk-hero'));
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) queueLoop(); });
  let loopDue = false;
  function scheduleLoop() {
    if (STILL) return;
    clearTimeout(loopTimer);
    loopTimer = setTimeout(() => { loopDue = true; queueLoop(); }, LOOP_REST_MS);
  }
  function queueLoop() {
    if (!loopDue || introOn || document.hidden || !heroOn) return;
    loopDue = false;
    startIntro();
  }
  function startIntro() {
    const steps = idx === 0 ? LAND : M;   /* first play: one turn per spot after the first; later plays start from the last spread and come round through the first */
    riffle = [];
    for (let r = 0; r < steps; r++) {
      const bell = Math.sin(Math.PI * (r / (steps - 1)));
      riffle.push({ bell: bell, dur: 0.26 - 0.19 * bell });
    }
    riffleAt = 0; introOn = true; wrap.classList.add('intro');
    riffleStep();
  }

  /* ------------------------------------------------------------- boot */
  /* decode one image; if the browser's decode() balks (some do for large WebPs) but the image did load, that still counts */
  const decodeOne = u => {
    const im = new Image(); im.src = u;
    const viaLoad = () => (im.complete && im.naturalWidth > 0) ? true
      : new Promise(r => { im.onload = () => r(true); im.onerror = () => r(false); });
    return im.decode ? im.decode().then(() => true, viaLoad) : viaLoad();
  };
  const decode = urls => Promise.all(urls.map(decodeOne)).then(r => r.every(Boolean));
  const within = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(false), ms))]);

  /* ---- loading screen ---- */
  const loader = document.getElementById('skLoader');
  const fill = document.getElementById('skLoaderFill');
  const root = document.documentElement;
  const MIN_MS = 900, CAP_MS = 4500, HARD_MS = 9000;   /* never a blink; normally never a wait; never stuck */
  const t0 = performance.now();
  let loaded = 0;
  const progress = n => { loaded = n; if (fill) fill.style.transform = 'scaleX(' + Math.max(.04, n / PAGES.length).toFixed(3) + ')'; };
  let hidden = false;
  const hideLoader = () => {
    if (hidden) return;
    hidden = true;
    root.classList.remove('sk-loading');
    if (!loader) return;
    loader.classList.add('is-done');
    loader.setAttribute('aria-hidden', 'true');
    setTimeout(() => { loader.style.display = 'none'; }, 500);
  };
  setTimeout(hideLoader, Math.max(0, HARD_MS - performance.now()));   /* absolute last resort, counted from navigation start */
  const holdLoader = () => new Promise(r => setTimeout(r, Math.max(0, MIN_MS - (performance.now() - t0))));
  const untilCap = () => new Promise(r => setTimeout(r, Math.max(0, CAP_MS - performance.now())));

  /* what the hero needs to look right the moment the loading screen leaves:
     the painted ground, the corner plants and the first (or, with no riffle, the last) spread.
     The screen never lifts before these are in, so a slow connection can't show a half-built page. */
  const essentials = decode([
    'images/sketchbook/bg-wash-b.jpg', 'images/sketchbook/botany-left.webp', 'images/sketchbook/botany-right.webp',
    PAGES[STILL ? LAND : 0].url
  ]);

  /* how fast does this screen really draw? On a slow one (battery saver, old laptop) the page turns
     with fewer strips and without the sideways blur, so it still moves smoothly */
  const sampleFrames = () => new Promise(r => {
    const ts = [];
    const f = t => {
      ts.push(t);
      if (ts.length < 14) { requestAnimationFrame(f); return; }
      const d = []; for (let i = 1; i < ts.length; i++) d.push(ts[i] - ts[i - 1]);
      d.sort((a, b) => a - b); r(d[Math.floor(d.length / 2)]);
    };
    requestAnimationFrame(f);
  });

  (async function boot() {
    if (STILL) {
      idx = LAND; paint(); applyView(); restLoupe();
      await within(essentials, HARD_MS);
      await holdLoader(); hideLoader();
      return;
    }
    idx = 0; paint(); applyView(); restLoupe();
    sampleFrames().then(ms => { if (ms > 36) { N = 9; wrap.classList.add('lite'); } });
    /* every spread starts loading at once; the riffle needs the first few to begin and the rest as it goes */
    /* the first four load first, with the whole connection to themselves; the rest follow straight after */
    startPage = i => pageReady[i] || (pageReady[i] = decodeOne(PAGES[i].url).then(ok => { if (ok) { pageOk[i] = true; progress(loaded + 1); } return ok; }));
    const firstFew = Promise.all([0, 1, 2, 3].map(startPage)).then(r => r.every(Boolean));
    firstFew.then(() => { for (let i = 4; i < M; i++) startPage(i); });
    await within(essentials, HARD_MS);
    await Promise.race([firstFew, untilCap()]);   /* normally both are done; a slow link is let in at the cap */
    await holdLoader();
    hideLoader();
    const ready = await within(firstFew, 12000);
    if (!ready) { await within(decodeOne(PAGES[LAND].url), 8000); idx = LAND; paint(); return; }
    if (document.fonts && document.fonts.ready) await within(document.fonts.ready.then(() => true, () => true), 1500);
    if (document.hidden) await new Promise(r => document.addEventListener('visibilitychange', function f() {
      if (!document.hidden) { document.removeEventListener('visibilitychange', f); r(); }
    }));
    setTimeout(startIntro, 350);          /* the screen is fading as the first page turns */
  })();
})();
