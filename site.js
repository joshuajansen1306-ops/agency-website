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
  // The top bar is clear while the sketch hero is under it (so the pattern runs to the top edge), then goes solid.
  const scroller = document.getElementById('work-stack');
  if (!scroller) return;
  const bar_el = document.querySelector('.topbar'), hero = document.querySelector('.sk-hero');
  let queued = false;
  const update = () => {
    queued = false;
    // while the sketch hero is under the bar, the bar is clear; once the hero has scrolled past it, it goes solid again
    if (bar_el && hero) bar_el.classList.toggle('is-clear', hero.getBoundingClientRect().bottom > bar_el.offsetHeight + 1);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
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

(() => {
  // The floating nav: one pill glides under Home / Services / About. Tapping a link slides it there before the page
  // changes, and pressing and dragging it across the bar works like an iPhone tab bar.
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const links = [...dock.querySelectorAll('a')];
  const cur = links.findIndex(a => a.getAttribute('aria-current') === 'page');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pill = document.createElement('span');
  pill.className = 'dock-pill';
  pill.setAttribute('aria-hidden', 'true');
  dock.prepend(pill);
  dock.classList.add('glide');
  links.forEach(a => a.setAttribute('draggable', 'false'));
  dock.addEventListener('dragstart', e => e.preventDefault());
  let under = -1, drag = null, dragged = false;

  const store = i => { try { sessionStorage.setItem('dockIdx', String(i)); } catch (e) {} };
  const load = () => { try { const v = sessionStorage.getItem('dockIdx'); return v === null ? -1 : +v; } catch (e) { return -1; } };
  const setUnder = i => {
    if (i === under) return;
    under = i;
    links.forEach((a, k) => a.classList.toggle('is-under', k === i));
  };
  const put = (x, w, y, h) => {
    pill.style.width = w + 'px'; pill.style.height = h + 'px'; pill.style.top = y + 'px';
    pill.style.transform = 'translateX(' + x + 'px)';
  };
  const to = (i, instant) => {
    const a = links[i];
    if (instant) pill.classList.add('no-anim');
    pill.style.opacity = 1;
    put(a.offsetLeft, a.offsetWidth, a.offsetTop, a.offsetHeight);
    setUnder(i);
    if (instant) { void pill.offsetWidth; pill.classList.remove('no-anim'); }
  };
  const go = i => {
    if (i === cur) { to(cur); return; }
    to(i); store(i);
    setTimeout(() => { location.href = links[i].href; }, still ? 0 : 280);
  };

  // first paint: start where the last page left the pill, then glide to this page's link
  if (cur >= 0) {
    const prev = load();
    if (prev >= 0 && prev < links.length && prev !== cur && !still) {
      to(prev, true);
      requestAnimationFrame(() => requestAnimationFrame(() => to(cur)));
    } else to(cur, true);
    store(cur);
  } else {
    pill.style.opacity = 0;      // privacy, terms, 404: no page highlighted until the visitor picks one
  }
  const settle = () => { if (!drag) { if (cur >= 0) to(under >= 0 ? under : cur, true); } };
  addEventListener('resize', settle);
  addEventListener('pageshow', e => { if (e.persisted && cur >= 0) { to(cur, true); store(cur); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);

  links.forEach((a, i) => a.addEventListener('click', e => {
    if (dragged) { e.preventDefault(); return; }
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (i === cur) return;
    e.preventDefault();
    go(i);
  }));

  const near = cx => {
    let best = 0, d = Infinity;
    links.forEach((a, k) => { const m = Math.abs(a.offsetLeft + a.offsetWidth / 2 - cx); if (m < d) { d = m; best = k; } });
    return best;
  };
  dock.addEventListener('pointerdown', e => {
    if (e.button || (e.pointerType === 'mouse' && e.buttons !== 1)) return;
    const from = under >= 0 ? under : (cur >= 0 ? cur : 0);
    drag = { id: e.pointerId, x0: e.clientX, left: links[from].offsetLeft, w: links[from].offsetWidth, moving: false };
  });
  dock.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    if (!drag.moving) {
      if (Math.abs(dx) < 6) return;
      drag.moving = true; dragged = true;
      try { dock.setPointerCapture(e.pointerId); } catch (err) {}
      pill.classList.add('dragging');
      pill.style.opacity = 1;
    }
    const first = links[0].offsetLeft, last = links[links.length - 1];
    const x = Math.min(Math.max(drag.left + dx, first), last.offsetLeft + last.offsetWidth - drag.w);
    pill.style.transform = 'translateX(' + x + 'px)';
    setUnder(near(x + drag.w / 2));
  });
  const end = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moving;
    drag = null;
    if (!moved) return;
    pill.classList.remove('dragging');
    try { dock.releasePointerCapture(e.pointerId); } catch (err) {}
    setTimeout(() => { dragged = false; }, 0);
    go(e.type === 'pointercancel' ? (cur >= 0 ? cur : under) : under);
  };
  dock.addEventListener('pointerup', end);
  dock.addEventListener('pointercancel', end);
})();
