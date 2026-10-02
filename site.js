(() => {
  // Hero video: starts playing as soon as the page opens and loops forever.
  // It is muted (required for autoplay), pauses while off screen to save
  // battery, and picks a phone-sized file on upright phones. The poster (the
  // video's own first frame) is all that shows when motion is reduced (even if
  // that is switched on later), when the visitor is on a data-saving / very
  // slow connection, or while autoplay is blocked.
  const video = document.querySelector('.paint-hero-media');
  if (!video) return;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)'); // also honoured if switched on while the page is open

  video.muted = video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;

  const phone = matchMedia('(max-width: 640px) and (orientation: portrait)');
  let loaded = '', onScreen = true, armed = false;

  const play = () => {
    if (reduce.matches || !loaded || !onScreen || document.hidden) return;
    const p = video.play();
    if (p && p.catch) p.catch(err => { if (err && err.name === 'NotAllowedError') armRetry(); });
  };

  // Some browsers (e.g. iOS in Low Power Mode) refuse autoplay until the
  // visitor touches the page; start on their first tap/key instead.
  const armRetry = () => {
    if (armed) return;
    armed = true;
    const go = () => {
      armed = false;
      ['touchend', 'click', 'keydown'].forEach(t => removeEventListener(t, go, true));
      play();
    };
    ['touchend', 'click', 'keydown'].forEach(t => addEventListener(t, go, true));
  };

  const load = () => {
    if (reduce.matches) return;
    const src = phone.matches ? video.dataset.srcMobile : video.dataset.src;
    if (src === loaded) return;
    const resumeAt = loaded ? video.currentTime : 0; // keep the place after a rotation
    loaded = src;
    video.classList.remove('is-ready');
    video.preload = 'auto';
    video.src = src;
    if (resumeAt) video.addEventListener('loadedmetadata', () => { video.currentTime = resumeAt % video.duration; }, { once: true });
    play();
  };

  const onReduce = () => {
    if (reduce.matches) { video.pause(); video.classList.remove('is-ready'); } // back to the still poster
    else { load(); play(); }
  };

  video.addEventListener('playing', () => video.classList.add('is-ready'));
  video.addEventListener('error', () => video.classList.remove('is-ready'));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      onScreen = entries[entries.length - 1].isIntersecting;
      if (onScreen) play(); else video.pause();
    }, { threshold: 0.01 }).observe(video);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
  if (phone.addEventListener) { phone.addEventListener('change', load); reduce.addEventListener('change', onReduce); }
  else { phone.addListener(load); reduce.addListener(onReduce); }
  load();
})();

(() => {
  const scroller = document.querySelector('.home-scroll');
  const stack = document.querySelector('.stack');
  if (!scroller || !stack || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Repeat the real posts so the stack has enough depth to travel through.
  const originals = [...stack.querySelectorAll('.stack-card')];
  const SETS = matchMedia('(max-width: 640px)').matches ? 2 : 3;
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

  const culled = cards.map(() => false);
  let target = 0, current = 0, frame = null;
  const render = () => {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.001) current = target;
    stack.style.setProperty('--shift', current.toFixed(4));
    cards.forEach((c, n) => {
      const d = index[n] - current;
      c.classList.toggle('is-past', d < -0.6);
      const cull = d < -1.2 || d > 8.5; // fully transparent or off-screen: drop from the render tree
      if (cull !== culled[n]) { culled[n] = cull; c.classList.toggle('is-culled', cull); }
    });
    frame = current === target ? null : requestAnimationFrame(render);
  };
  const read = () => {
    const total = scroller.offsetHeight - innerHeight;
    const scrolled = Math.min(Math.max(-scroller.getBoundingClientRect().top, 0), total);
    const p = total > 0 ? scrolled / total : 0;
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
