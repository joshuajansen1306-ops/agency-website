(() => {
  const video = document.querySelector('.paint-hero-media');
  if (!video || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  video.play().catch(() => {}); // browsers can reject autoplay(); poster frame stays visible either way
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); });
    }, { threshold: 0.05 }).observe(video);
  }
})();

(() => {
  const scroller = document.querySelector('.home-scroll');
  const stack = document.querySelector('.stack');
  if (!scroller || !stack || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Repeat the real posts so the stack has enough depth to travel through.
  const originals = [...stack.querySelectorAll('.stack-card')];
  const SETS = 3;
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

  let target = 0, current = 0, frame = null;
  const render = () => {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.001) current = target;
    stack.style.setProperty('--shift', current.toFixed(4));
    cards.forEach((c, n) => c.classList.toggle('is-past', index[n] - current < -0.6));
    frame = current === target ? null : requestAnimationFrame(render);
  };
  const read = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    const p = range > 0 ? Math.min(Math.max(scrollY / range, 0), 1) : 0;
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
  // Animated mosaic portrait: samples the founder's real photo into a grid
  // of tiles, then plays a wave-style shimmer across them (vignette + bloom).
  const wrap = document.querySelector('.portrait-canvas-wrap');
  if (!wrap) return;
  const canvas = wrap.querySelector('canvas');
  const img = wrap.querySelector('img');
  if (!canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CELL = 16;
  const BRIGHTNESS = 12, CONTRAST = 115, SATURATION = 100, GRAYSCALE = 0;
  const VIGNETTE = 0.38, BLOOM = 0.25;
  const SPEED = 1, INTENSITY = 0.6;

  const sample = document.createElement('canvas');
  const sctx = sample.getContext('2d', { willReadFrequently: true });

  let cells = [], cw = 0, ch = 0, dpr = 1, raf = null, visible = true, ready = false;

  function adjust(r, g, b) {
    r += (BRIGHTNESS / 100) * 128; g += (BRIGHTNESS / 100) * 128; b += (BRIGHTNESS / 100) * 128;
    const c = CONTRAST / 100;
    r = (r - 128) * c + 128; g = (g - 128) * c + 128; b = (b - 128) * c + 128;
    const gray = 0.299 * r + 0.587 * g + 0.114 * b, s = SATURATION / 100;
    r = gray + (r - gray) * s; g = gray + (g - gray) * s; b = gray + (b - gray) * s;
    if (GRAYSCALE > 0) {
      const g2 = 0.299 * r + 0.587 * g + 0.114 * b, k = GRAYSCALE / 100;
      r += (g2 - r) * k; g += (g2 - g) * k; b += (g2 - b) * k;
    }
    const clamp = v => Math.min(255, Math.max(0, v));
    return [clamp(r), clamp(g), clamp(b)];
  }

  function buildGrid() {
    const rect = wrap.getBoundingClientRect();
    cw = Math.max(1, Math.round(rect.width));
    ch = Math.max(1, Math.round(rect.height));
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sample.width = cw; sample.height = ch;
    const iw = img.naturalWidth || 640, ih = img.naturalHeight || 1138;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    sctx.clearRect(0, 0, cw, ch);
    sctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);

    const cols = Math.ceil(cw / CELL), rows = Math.ceil(ch / CELL);
    let data = null;
    try { data = sctx.getImageData(0, 0, cw, ch).data; } catch (e) { /* tainted canvas fallback */ }

    cells = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const x = gx * CELL, y = gy * CELL;
        const w = Math.min(CELL, cw - x), h = Math.min(CELL, ch - y);
        let r = 0, g = 0, b = 0, n = 0;
        if (data) {
          for (let py = 0; py < h; py += 2) {
            for (let px = 0; px < w; px += 2) {
              const i = ((y + py) * cw + (x + px)) * 4;
              r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
            }
          }
        }
        if (n === 0) { r = 40; g = 44; b = 52; n = 1; }
        const [ar, ag, ab] = adjust(r / n, g / n, b / n);
        cells.push({ gx, gy, x: x + w / 2, y: y + h / 2, w, h, r: ar, g: ag, b: ab });
      }
    }
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#0A1826';
    ctx.fillRect(0, 0, cw, ch);

    const speed = t * 0.0016 * SPEED;
    for (const c of cells) {
      let wave = 0, alpha = 1, scale = 1;
      if (!reduceMotion) {
        wave = Math.sin(speed - c.gx * 0.35 + c.gy * 0.12);
        alpha = Math.min(1, 0.55 + 0.45 * ((wave + 1) / 2) * INTENSITY + (1 - INTENSITY) * 0.45);
        scale = 1 + wave * 0.14 * INTENSITY;
      }
      const w = c.w * scale, h = c.h * scale;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${c.r | 0},${c.g | 0},${c.b | 0})`;
      ctx.fillRect(c.x - w / 2, c.y - h / 2 - (reduceMotion ? 0 : wave * 3 * INTENSITY), w, h);
    }
    ctx.globalAlpha = 1;

    if (BLOOM > 0 && 'filter' in ctx) {
      ctx.save();
      ctx.filter = 'blur(6px)';
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = BLOOM * 0.5;
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, cw, ch);
      ctx.restore();
    }

    const grad = ctx.createRadialGradient(cw / 2, ch * 0.42, ch * 0.2, cw / 2, ch * 0.5, ch * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${VIGNETTE})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
  }

  function loop(t) {
    if (!visible) { raf = null; return; }
    drawFrame(t);
    raf = reduceMotion ? null : requestAnimationFrame(loop);
  }

  function start() {
    buildGrid();
    if (!ready) { canvas.classList.add('ready'); ready = true; }
    if (raf) cancelAnimationFrame(raf);
    if (reduceMotion) drawFrame(0);
    else raf = requestAnimationFrame(loop);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        visible = e.isIntersecting;
        if (visible && !raf && ready && !reduceMotion) raf = requestAnimationFrame(loop);
      });
    }, { threshold: 0.05 }).observe(wrap);
  }

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!ready) return;
      buildGrid(); // resets the canvas bitmap, so it must always be followed by a paint
      if (reduceMotion) drawFrame(0);
      else if (!raf && visible) raf = requestAnimationFrame(loop);
    }, 150);
  });

  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
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
