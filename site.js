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
