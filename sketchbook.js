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
  const sb3d = document.getElementById('sb3d');
  const book = document.getElementById('sbBook');

  const DIR = 'images/sketchbook/';
  const PAGES = Array.from({ length: 9 }, (_, i) => ({ url: DIR + 'spread-0' + (i + 1) + '.webp?v=2' }));
  const M = PAGES.length, LAND = 6;

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection;
  const STILL = REDUCED || !!(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));

  /* the footer is pinned to the bottom of the viewport, so give it dark ink
     while the cream hero is what sits behind it */
  const hero = document.querySelector('.sk-hero');
  let ticking = false;
  const paperUnderFooter = () => {
    ticking = false;
    document.body.classList.toggle('on-paper', hero.getBoundingClientRect().bottom > innerHeight - 56);
  };
  const queueFooter = () => { if (!ticking) { ticking = true; requestAnimationFrame(paperUnderFooter); } };
  addEventListener('scroll', queueFooter, { passive: true });
  addEventListener('resize', queueFooter);
  paperUnderFooter();

  /* ------------------------------------------------ the turning leaf */
  const N = 18;            /* strips: enough for a smooth curve          */
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
  }
  function layout() { sb3d.style.setProperty('--bw', book.clientWidth + 'px'); }
  addEventListener('resize', layout);

  /* ------------------------------------------------------ tween loop */
  /* the riffle wants a fixed tempo, not a spring settling time */
  let spring = null;
  function tweenTo(target, dur, onDone) {
    spring = { from: turn ? turn.t : 0, target: target, dur: dur, e: 0, done: onDone };
    kick();
  }
  let raf = null, last = 0;
  function tick(now) {
    raf = null;
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016); last = now;
    if (spring && turn) {
      const s = spring;
      s.e += dt;
      const k = Math.min(1, s.e / s.dur);
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
  function riffleStep() {
    const s = riffle[riffleAt];
    wrap.classList.toggle('b2', s.bell > 0.55);
    startTurn('next', 0);
    tweenTo(1, s.dur, () => {
      idx = turn.to; turn = null;
      riffleAt++;
      if (introOn && riffleAt < riffle.length) { paint(); riffleStep(); }
      else { endIntro(); paint(); }
    });
  }
  function startIntro() {
    const steps = M + LAND;
    riffle = [];
    for (let r = 0; r < steps; r++) {
      const bell = Math.sin(Math.PI * (r / (steps - 1)));
      riffle.push({ bell: bell, dur: 0.26 - 0.19 * bell });
    }
    riffleAt = 0; introOn = true; wrap.classList.add('intro');
    riffleStep();
  }

  /* ------------------------------------------------------------- boot */
  const decode = urls => Promise.all(urls.map(u => {
    const im = new Image(); im.src = u;
    return im.decode ? im.decode().then(() => true, () => false)
      : new Promise(r => { im.onload = () => r(true); im.onerror = () => r(false); });
  })).then(r => r.every(Boolean));
  const within = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(false), ms))]);

  (async function boot() {
    if (STILL) {
      await within(decode([PAGES[LAND].url]), 8000);
      idx = LAND; paint(); applyView();
      return;
    }
    idx = 0; paint(); applyView();
    /* every spread has to be ready before the riffle, or a page would flash
       empty; on a connection too slow for that, just rest on the last one */
    const ready = await within(decode(PAGES.map(p => p.url)), 7000);
    if (!ready) { idx = LAND; paint(); return; }
    if (document.fonts && document.fonts.ready) await within(document.fonts.ready.then(() => true, () => true), 1500);
    if (document.hidden) await new Promise(r => document.addEventListener('visibilitychange', function f() {
      if (!document.hidden) { document.removeEventListener('visibilitychange', f); r(); }
    }));
    setTimeout(startIntro, 220);
  })();
})();
