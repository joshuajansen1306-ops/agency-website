/* =====================================================================
   Our work: one pinned stage, three sections on a single track.

   Scrolling slides the track sideways, the way the reference pin does:
     1  intro   "Hey, we're Fable&Co", the giant word "Our", and three photos
     2  work    the word slides out and "work" slides in (smaller, higher),
                a ring of photos settles around it and then keeps drifting
                past, with more photos arriving from the right
     3  contact a panel slides in from the right as everything else slides
                out to the left

   Every piece has its own path (position, tilt, scale, opacity) over one
   scroll progress p = 0..1, written as keyframes below. The paths are joined
   with monotone cubic interpolation, so each piece keeps a continuous speed
   through every keyframe: nothing stops and restarts between sections, and
   nothing overshoots. The scroll position drives all of it, with a little
   inertia so it glides, and scrolling back up plays it backwards.

   Reduced motion or no JavaScript leaves the plain page (heading, photos,
   contact panel) from the stylesheet.
   ===================================================================== */
(() => {
  const sec = document.getElementById('work-stack');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pin = sec.querySelector('.work-pin');
  const q = s => sec.querySelector(s);
  const D = { intro: q('.w-intro'), our: q('.w-our'), work: q('.w-work'), para: q('.w-para'), cap: q('.w-cap'), more: q('.w-more'), panel: q('.w-panel') };
  const photos = [...sec.querySelectorAll('.w-photos li')];
  if (!pin || Object.values(D).some(v => !v) || photos.length < 13) return;
  sec.classList.add('is-live');
  /* the giant words are no longer drawn behind the photos; the heading stays for screen readers */
  const hd = q('.w-words');
  if (hd) { hd.querySelectorAll('span').forEach(s => s.setAttribute('aria-hidden', 'true')); const t = document.createElement('span'); t.className = 'visually-hidden'; t.textContent = 'Our work'; hd.appendChild(t); }

  /* ------------------------------------------------ keyframes
     a row is [p, x, y, rotation(deg), scale, opacity]
     x / y are fractions of the stage width / height (the centre of a photo or panel, the
     baseline of a word, the top-left corner of a text block) */
  const R = (p, x, y, r = 0, s = 1, o = 1) => [p, x, y, r, s, o];

  /* photos, in the order they appear in the markup. fw = width as a fraction of the stage width.
     entry = how far out of place the photo is when the section first scrolls into view [dx, dy, scale, rot] */
  const PH = [
    /* 0  intro, lower left: leaves first */
    { fw: .17, entry: [.23, -.006, .15, -12], k: [R(0, .27, .66, -5), R(.10, .05, .68, -9), R(.20, -.20, .70, -13), R(1, -.20, .70, -13)] },
    /* 1  intro, top centre */
    { fw: .18, entry: [.158, .03, .06, -7], k: [R(0, .50, .37, 8), R(.13, .20, .31, 8), R(.25, .07, .30, 6), R(.36, -.14, .28, 3), R(1, -.14, .28, 3)] },
    /* 2  intro, right */
    { fw: .165, entry: [.11, -.06, .2, 19], k: [R(0, .73, .58, -4), R(.13, .42, .57, -2), R(.25, .21, .55, 0), R(.35, -.14, .54, 3), R(1, -.14, .54, 3)] },
    /* 3  ring, lower centre-left (the biggest, most tilted) */
    { fw: .175, k: [R(0, 1.30, .58, 12), R(.07, 1.30, .58, 12), R(.31, .41, .55, 28), R(.58, .03, .57, 31), R(.88, -.78, .59, 36), R(1, -.78, .59, 36)] },
    /* 4  ring, top centre-right */
    { fw: .155, k: [R(0, 1.34, .21, 22), R(.10, 1.34, .21, 22), R(.32, .62, .20, 8), R(.58, .19, .20, 6), R(.88, -.62, .19, 2), R(1, -.62, .19, 2)] },
    /* 5  ring, top left (the smallest) */
    { fw: .125, k: [R(0, 1.12, .18, 10), R(.04, 1.12, .18, 10), R(.31, .38, .20, -6), R(.58, -.06, .19, -8), R(.82, -.55, .20, -10), R(1, -.55, .20, -10)] },
    /* 6  ring, top right */
    { fw: .14, k: [R(0, 1.38, .32, -14), R(.12, 1.38, .32, -14), R(.32, .86, .28, -5), R(.58, .43, .27, -3), R(.90, -.60, .26, 0), R(1, -.60, .26, 0)] },
    /* 7  ring, lower right */
    { fw: .15, k: [R(0, 1.42, .62, 24), R(.12, 1.42, .62, 24), R(.32, .70, .57, 10), R(.58, .31, .58, 8), R(.90, -.62, .57, 4), R(1, -.62, .57, 4)] },
    /* 8  ring, left (strongly tilted) */
    { fw: .145, k: [R(0, 1.24, .50, -6), R(.05, 1.24, .50, -6), R(.30, .19, .45, -30), R(.58, -.20, .44, -32), R(.74, -.50, .46, -34), R(1, -.50, .46, -34)] },
    /* 9-12  arrive from the right while the ring drifts left */
    { fw: .17, k: [R(0, 1.40, .36, -10), R(.30, 1.40, .36, -10), R(.58, .62, .34, 6), R(.92, -.80, .33, 12), R(1, -.80, .33, 12)] },
    { fw: .16, k: [R(0, 1.45, .60, 14), R(.36, 1.45, .60, 14), R(.58, .88, .60, -6), R(.94, -.80, .61, -9), R(1, -.80, .61, -9)] },
    { fw: .15, k: [R(0, 1.40, .66, -16), R(.34, 1.40, .66, -16), R(.58, .55, .66, 9), R(.90, -.90, .66, 12), R(1, -.90, .66, 12)] },
    { fw: .16, k: [R(0, 1.45, .26, 16), R(.42, 1.45, .26, 16), R(.60, .97, .28, -8), R(.94, -.72, .28, -6), R(1, -.72, .28, -6)] }
  ];

  /* the words, texts and panel. landscape = wide stages, portrait = phones */
  const LAYOUT = {
    land: {
      wf: (W, H) => H * .78,
      our: [R(0, .42, .80, 0, 1), R(.31, -.75, .56, 0, .80), R(1, -.75, .56, 0, .80)],
      work: [R(0, 1.78, .80, 0, 1), R(.31, .50, .56, 0, .92), R(.58, .46, .56, 0, .92), R(.92, -1.15, .56, 0, .92), R(1, -1.15, .56, 0, .92)],
      intro: [R(0, .076, .14), R(.31, -.58, .12), R(1, -.58, .12)],
      para: [R(0, .05, .80), R(.31, -.65, .76), R(1, -.65, .76)],
      cap: [R(0, .05, .83, 0, 1, 0), R(.24, .05, .83, 0, 1, 0), R(.33, .05, .79, 0, 1, 1), R(.58, .05, .79, 0, 1, 1), R(.90, -.95, .79, 0, 1, 1), R(1, -.95, .79, 0, 1, 1)],
      panel: [R(0, 1.50, .50), R(.56, 1.50, .50), R(.70, 1.10, .50), R(.90, .50, .50), R(1, .50, .50)],
      pw: (W) => Math.min(W * .58, 820),
      photoY: y => y, photoW: w => w
    },
    port: {
      wf: (W, H) => W * .52,
      our: [R(0, .50, .42, 0, 1), R(.31, -.75, .47, 0, .70), R(1, -.75, .47, 0, .70)],
      work: [R(0, 1.75, .42, 0, 1), R(.31, .50, .47, 0, .70), R(.58, .47, .47, 0, .70), R(.92, -1.1, .47, 0, .70), R(1, -1.1, .47, 0, .70)],
      intro: [R(0, .07, .08), R(.31, -.80, .08), R(1, -.80, .08)],
      para: [R(0, .07, .74), R(.31, -.80, .72), R(1, -.80, .72)],
      cap: [R(0, .07, .78, 0, 1, 0), R(.24, .07, .78, 0, 1, 0), R(.33, .07, .75, 0, 1, 1), R(.58, .07, .75, 0, 1, 1), R(.90, -1.0, .75, 0, 1, 1), R(1, -1.0, .75, 0, 1, 1)],
      panel: [R(0, 1.55, .50), R(.56, 1.55, .50), R(.70, 1.15, .50), R(.90, .50, .50), R(1, .50, .50)],
      pw: (W) => W * .9,
      photoY: y => .56 + (y - .5) * .60, photoW: w => Math.min(w * 1.8, .36)
    }
  };

  /* ------------------------------------------------ monotone cubic interpolation of a keyframe list */
  const track = rows => {
    const n = rows.length, k = rows[0].length - 1;
    const xs = rows.map(r => r[0]);
    const h = [];
    for (let i = 0; i < n - 1; i++) h[i] = xs[i + 1] - xs[i];
    const M = [];
    for (let c = 1; c <= k; c++) {
      const ys = rows.map(r => r[c]);
      const d = [];
      for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / h[i];
      const m = new Array(n);
      m[0] = d[0]; m[n - 1] = d[n - 2];
      for (let i = 1; i < n - 1; i++) {
        if (d[i - 1] * d[i] <= 0) m[i] = 0;
        else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
      }
      M.push({ ys, m });
    }
    const out = new Array(k);
    return p => {
      if (p <= xs[0]) { for (let c = 0; c < k; c++) out[c] = M[c].ys[0]; return out; }
      if (p >= xs[n - 1]) { for (let c = 0; c < k; c++) out[c] = M[c].ys[n - 1]; return out; }
      let i = 0; while (p > xs[i + 1]) i++;
      const t = (p - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
      const a = 2 * t3 - 3 * t2 + 1, b = t3 - 2 * t2 + t, cc = -2 * t3 + 3 * t2, dd = t3 - t2;
      for (let c = 0; c < k; c++) { const { ys, m } = M[c]; out[c] = a * ys[i] + b * h[i] * m[i] + cc * ys[i + 1] + dd * h[i] * m[i + 1]; }
      return out;
    };
  };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);
  const topbar = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 56;

  /* ------------------------------------------------ layout */
  let W = 0, H = 0, mode = 'land', L = LAYOUT.land, T = null, PWPX = 600, base = { our: 0, work: 0 };
  const baselineOf = el => {
    const probe = document.createElement('i');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(probe);
    const off = probe.getBoundingClientRect().top - el.getBoundingClientRect().top;
    probe.remove();
    return off;
  };
  const build = () => {
    T = {
      our: track(L.our), work: track(L.work), intro: track(L.intro), para: track(L.para), cap: track(L.cap), panel: track(L.panel),
      ph: PH.map(ph => track(ph.k.map(r => [r[0], r[1], L.photoY(r[2]), r[3], r[4], r[5]])))
    };
  };
  const layout = () => {
    W = pin.clientWidth; H = pin.clientHeight;
    mode = (W / H < 1.1) ? 'port' : 'land';
    L = LAYOUT[mode];
    pin.style.setProperty('--wf', L.wf(W, H).toFixed(1) + 'px');
    PWPX = L.pw(W);
    pin.style.setProperty('--pw', PWPX.toFixed(1) + 'px');
    [D.our, D.work, D.intro, D.para, D.cap, D.more, D.panel, ...photos].forEach(e => { e.style.transform = 'none'; });
    photos.forEach((li, i) => { const f = PH[i] ? L.photoW(PH[i].fw) : .15; li.style.width = (f * W).toFixed(1) + 'px'; });
    /* "scroll to continue" is fixed at the bottom-right, above the dock */
    const dock = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dock-clearance')) || 112;
    D.more.style.transform = 'translate3d(' + (W - D.more.offsetWidth - W * .035).toFixed(1) + 'px,' + (H - D.more.offsetHeight - dock - 18).toFixed(1) + 'px,0)';
    base.our = baselineOf(D.our); base.work = baselineOf(D.work);
    D.our.style.transformOrigin = (D.our.offsetWidth / 2) + 'px ' + base.our + 'px';
    D.work.style.transformOrigin = (D.work.offsetWidth / 2) + 'px ' + base.work + 'px';
    build();
  };

  /* ------------------------------------------------ painting */
  let tgt = 0, cur = 0, raf = null, last = 0, entry = 1;
  const put = (el, x, y, r, s, o) => {
    el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' + (r ? ' rotate(' + r.toFixed(2) + 'deg)' : '') + (s !== 1 ? ' scale(' + s.toFixed(4) + ')' : '');
    if (o !== undefined) el.style.opacity = o.toFixed(3);
  };
  const paint = p => {
    const k = 1 - entry;                                   /* 1 while the section is still scrolling into view */
    /* the words: x = centre, y = baseline; the pivot is the baseline's centre, so scaling keeps them put */
    let v = T.our(p);  put(D.our, v[0] * W - D.our.offsetWidth / 2, (v[1] + .06 * k) * H - base.our, 0, v[3], 1);
    v = T.work(p);     put(D.work, v[0] * W - D.work.offsetWidth / 2, (v[1] + .06 * k) * H - base.work, 0, v[3], 1);
    v = T.intro(p);    put(D.intro, v[0] * W, v[1] * H, 0, 1, 1);
    v = T.para(p);     put(D.para, v[0] * W, v[1] * H, 0, 1, entry);
    v = T.cap(p);      put(D.cap, v[0] * W, v[1] * H, 0, 1, v[4]);
    /* "scroll to continue" sits bottom-right and goes once the contact panel starts to arrive */
    D.more.style.opacity = (1 - smooth(clamp((p - .50) / .12, 0, 1))).toFixed(3);
    /* the photos */
    photos.forEach((li, i) => {
      const ph = PH[i];
      if (!ph) { li.style.visibility = 'hidden'; return; }
      const f = T.ph[i](p), w = li.offsetWidth, h = li.offsetHeight;
      let x = f[0] * W, y = f[1] * H, r = f[2], s = f[3];
      if (ph.entry && k > 0) { x += ph.entry[0] * W * k; y += ph.entry[1] * H * k; s *= 1 + ph.entry[2] * k; r += ph.entry[3] * k; }
      /* off screen: not painted at all */
      const off = x + w * .8 < 0 || x - w * .8 > W;
      li.style.visibility = off ? 'hidden' : 'visible';
      if (!off) put(li, x - w / 2, y - h / 2, r, s);
    });
    /* the contact panel */
    v = T.panel(p);
    const ph = D.panel.offsetHeight;
    const pOff = v[0] * W - PWPX / 2 > W;
    D.panel.style.visibility = pOff ? 'hidden' : 'visible';
    const dockTop = H - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dock-clearance')) || 112) + 24;
    const py = Math.min(v[1] * H - ph / 2, Math.max(8, dockTop - ph));
    put(D.panel, v[0] * W - PWPX / 2, py, 0, 1);
    const open = p > .74;
    D.panel.toggleAttribute('inert', !open);
    D.panel.style.pointerEvents = open ? 'auto' : 'none';
  };

  const read = () => {
    const r = sec.getBoundingClientRect(), tb = topbar(), vh = innerHeight;
    entry = clamp((vh - r.top) / Math.max(1, vh - tb), 0, 1);
    const run = Math.max(1, r.height - pin.offsetHeight);
    tgt = clamp((tb - r.top) / run, 0, 1);
  };
  const loop = now => {
    raf = null;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    cur += (tgt - cur) * (1 - Math.exp(-dt * 11));
    if (Math.abs(tgt - cur) < 0.0003) cur = tgt;
    paint(cur);
    if (cur !== tgt) raf = requestAnimationFrame(loop);
  };
  const kick = () => { read(); if (raf === null) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  /* decode every photo up front: ones that start off-screen are otherwise left blank until something repaints them */
  photos.forEach(li => { const im = li.querySelector('img'); if (im && im.decode) im.decode().then(() => paint(cur), () => {}); });

  const init = () => { layout(); read(); cur = tgt; paint(cur); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { layout(); kick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  init();

  /* the contact form opens the visitor's own mail app with the message filled in (no server involved) */
  const form = sec.querySelector('.w-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form), name = (f.get('name') || '').toString().trim(), email = (f.get('email') || '').toString().trim(), msg = (f.get('body') || '').toString().trim();
    const subject = 'Hello from ' + (name || 'a visitor');
    const body = msg + '\n\n' + (name ? name : '') + (email ? ' (' + email + ')' : '');
    location.href = 'mailto:fableandco@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.trim());
  });
})();
