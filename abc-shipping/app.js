(function () {
  'use strict';
  const D = window.ABC_DATA;
  const L = D.LISTS;
  const KEY = 'abc-shipping-demo-v3';
  const CO_KEY = 'abc-shipping-company';
  const VIEWED_KEY = 'abc-shipping-viewed';
  const PAGE_SIZE = 10;

  /* ---------------------------------------------------------------- utils */
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const today = () => { const d = new Date(); return String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + '/' + d.getFullYear(); };
  const store = {
    get(area, k) { try { return window[area].getItem(k); } catch (e) { return null; } },
    set(area, k, v) { try { window[area].setItem(k, v); } catch (e) { /* storage unavailable */ } },
    del(area, k) { try { window[area].removeItem(k); } catch (e) { /* storage unavailable */ } },
  };

  const P = {
    sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    calendar: 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18',
    check: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    truck: 'M1 3h15v13H1z M16 8h4l3 3v5h-7z M3 18.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0 M16 18.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M8 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0',
    box: 'M16.5 9.4l-9-5.2 M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.3 7l8.7 5 8.7-5 M12 22V12',
    home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    card: 'M1 4h22v16H1z M1 10h22',
    sliders: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
    msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    chart: 'M12 20V10 M18 20V4 M6 20v-4',
    clock: 'M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M12 6v6l4 2',
    link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
    rotate: 'M1 4v6h6 M3.5 15a9 9 0 1 0 2.1-9.4L1 10',
    search: 'M3 11a8 8 0 1 0 16 0 8 8 0 1 0-16 0 M21 21l-4.4-4.4',
    save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8',
    chev: 'M9 18l6-6-6-6',
    lleft: 'M11 17l-5-5 5-5 M18 17l-5-5 5-5',
    pencil: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  };
  const ico = (n, c) => '<svg class="i ' + (c || '') + '" viewBox="0 0 24 24"><path d="' + P[n] + '"/></svg>';

  function toast(msg, kind) {
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    $('#toastRoot').appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }

  function modal(o) {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal ' + (o.wide ? 'wide' : '') + '" role="dialog" aria-modal="true"><h3>' + esc(o.title) + '</h3><div class="mb">' + o.body + '</div><div class="mf"></div></div>';
    const mf = $('.mf', bg);
    const close = () => bg.remove();
    (o.buttons || []).forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (b.cls || '');
      btn.textContent = b.label;
      btn.addEventListener('click', () => { if (!b.onClick || b.onClick(bg, close) !== false) close(); });
      mf.appendChild(btn);
    });
    $('#modalRoot').appendChild(bg);
    if (o.onMount) o.onMount(bg, close);
    return close;
  }

  /* ---------------------------------------------------------------- state */
  const bookings = clone(D.bookings);
  bookings.forEach((b) => { b.orig = clone(b.fields); });
  (function restore() {
    let saved = {};
    try { saved = JSON.parse(store.get('localStorage', KEY)) || {}; } catch (e) { saved = {}; }
    bookings.forEach((b) => {
      const s = saved[b.id];
      if (s) { b.fields = s.fields; b.status = s.status; b.reason = s.reason; b.notes = s.notes || []; }
    });
  })();
  function persist() {
    const out = {};
    bookings.forEach((b) => { out[b.id] = { fields: b.fields, status: b.status, reason: b.reason, notes: b.notes }; });
    store.set('localStorage', KEY, JSON.stringify(out));
  }
  let company = store.get('sessionStorage', CO_KEY) || '';
  const find = (id) => bookings.find((b) => b.id.toLowerCase() === String(id).toLowerCase());
  const STATUS_LABEL = { Sent: 'Sent to Origin', Confirmed: 'Confirmed', Declined: 'Declined', Void: 'Void' };

  function getV(f, key) { const p = key.split('.'); return p.length === 2 ? f[p[0]][p[1]] : f[key]; }
  function setV(f, key, v) { const p = key.split('.'); if (p.length === 2) f[p[0]][p[1]] = v; else f[key] = v; }

  function totals(b) {
    const t = { units: 0, cartons: 0, weight: 0, volume: 0, pos: new Set(), items: b.items.length };
    b.items.forEach((i) => { t.units += i.units; t.cartons += i.cartons; t.weight += i.weight; t.volume += i.volume; t.pos.add(i.po); });
    t.volume = Math.round(t.volume * 1000) / 1000;
    t.weight = Math.round(t.weight * 100) / 100;
    return t;
  }

  /* -------------------------------------------------------------- actions */
  function setStuffing(b, name) {
    const s = D.STUFFING.find((x) => x.name === name);
    Object.assign(b.fields, {
      stuffing: s ? s.name : '', stAddr1: s ? s.addr1 : '', stAddr2: s ? s.addr2 : '',
      stCity: s ? s.city : '', stState: s ? s.state : '', stCountry: s ? s.country : '', stPostal: s ? s.postal : '',
    });
  }
  const REQUIRED = [
    ['stuffing', 'Stuffing Location'], ['fobEtd', 'FOB ETD'], ['dischargeEta', 'Discharge Port ETA'], ['finalEta', 'Final Destination ETA'],
    ['siCutoffDate', 'ABC SI Cutoff Date'], ['cargoCutoffDate', 'Cargo Cutoff Date'], ['cargoCutoffTime', 'Cargo Cutoff Time'],
    ['vessel', 'Vessel'], ['voyage', 'Voyage'],
  ];
  function validate(b) {
    return REQUIRED.filter((r) => !String(b.fields[r[0]] || '').trim()).map((r) => ({ key: r[0], label: r[1], msg: r[1] + ' is required.' }));
  }

  /* dates are mm/dd/yyyy; worked in UTC so daylight-saving changes never shift a day */
  function parseDate(s) {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    return m ? new Date(Date.UTC(+m[3], +m[1] - 1, +m[2])) : null;
  }
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
  function subWorkingDays(d, n) {            // step back n days, skipping Saturday and Sunday
    let x = d;
    while (n > 0) { x = addDays(x, -1); const w = x.getUTCDay(); if (w !== 0 && w !== 6) n--; }
    return x;
  }
  const fmtDate = (d) => String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + String(d.getUTCDate()).padStart(2, '0') + '/' + d.getUTCFullYear();
  function computeSchedule(estDelivery) {
    const est = parseDate(estDelivery); if (!est) return null;
    const S = D.RULES.schedule;
    const fob = addDays(est, (S.fobEtdWeekday - est.getUTCDay() + 7) % 7);   // first Monday on or after
    const eta = fmtDate(addDays(fob, S.etaDaysAfterFobEtd));
    return { fobEtd: fmtDate(fob), dischargeEta: eta, finalEta: eta, siCutoffDate: fmtDate(subWorkingDays(fob, S.siCutoffWorkingDaysBefore)), cargoCutoffDate: fmtDate(addDays(fob, -S.cargoCutoffDaysBefore)) };
  }
  function doConfirm(b) { b.status = 'Confirmed'; b.fields.confirmDate = today(); persist(); }
  function doDecline(b, reason) { b.status = 'Declined'; b.reason = reason; persist(); }
  function doVoid(b) { b.status = 'Void'; persist(); }
  /* Fills every rule-driven field. Returns what it filled and what it could not. */
  function autoFill(b) {
    const filled = [], missing = [];
    const name = D.RULES.stuffingByVendor[b.fields.vendorCode];
    if (name) { setStuffing(b, name); filled.push('Stuffing Location'); } else missing.push('Stuffing Location (no rule for vendor ' + b.fields.vendorCode + ')');
    const sch = computeSchedule(b.fields.estDelivery);
    if (sch) { Object.assign(b.fields, sch); filled.push('FOB ETD', 'Discharge Port ETA', 'Final Destination ETA', 'SI Cutoff Date', 'Cargo Cutoff Date'); } else missing.push('dates (Estimated Cargo Delivery Date is missing or invalid)');
    Object.assign(b.fields, D.RULES.constants); filled.push('Cargo Cutoff Time', 'Vessel', 'Voyage');
    persist();
    return { filled, missing, stuffing: name || '' };
  }

  /* ------------------------------------------------------------ shipments */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function longDate(s) { const d = parseDate(s); return d ? d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] : (s || ''); }
  const laneFor = (b) => D.SHIPMENT_LANES.find((l) => l.carrier === b.fields.carrier && String(b.fields.finalDest || '').toLowerCase().indexOf(l.dest.toLowerCase()) === 0);
  /* The ship key depends on the FOB ETD: find the open shipment that sails that day. */
  function suggestShip(b) {
    const lane = laneFor(b);
    if (!lane) return { lane: null, key: '', note: 'No sailing schedule is loaded for ' + (b.fields.carrier || 'this carrier') + ' to ' + (b.fields.finalDest || 'this destination') + '.' };
    const etd = String(b.fields.fobEtd || '').trim();
    if (!etd) return { lane, key: '', note: 'Fill in the FOB ETD first, the ship key depends on it.' };
    const open = lane.shipments.filter((s) => s.etd === etd && !s.closed);
    if (!open.length) return { lane, key: '', note: 'No open shipment sails on ' + etd + ' in the ' + lane.title + ' schedule.' };
    return { lane, key: open[0].key, note: 'FOB ETD ' + etd + ' (' + longDate(etd) + ') sails as ' + open[0].key + (open.length > 1 ? '. ' + open.length + ' shipments sail that day: ' + open.map((s) => s.key).join(', ') + '.' : '.') };
  }
  function moveError(b, key) {
    if (b.status !== 'Confirmed') return 'Only a confirmed booking can be moved to a shipment.';
    if (b.fields.shipKey) return 'This booking is already in shipment ' + b.fields.shipKey + '.';
    key = String(key || '').trim();
    if (!key) return 'Enter a ship key.';
    const sg = suggestShip(b);
    if (!sg.lane) return sg.note;
    const s = sg.lane.shipments.find((x) => x.key.toLowerCase() === key.toLowerCase());
    if (!s) return 'Ship key ' + key + ' is not in the ' + sg.lane.title + ' schedule.';
    if (s.closed) return 'Shipment ' + s.key + ' is closed (containers already booked).';
    const etd = String(b.fields.fobEtd || '').trim();
    if (s.etd !== etd) return 'Ship key ' + s.key + ' sails on ' + longDate(s.etd) + ' but this booking’s FOB ETD is ' + (etd ? longDate(etd) : 'empty') + '.' + (sg.key ? ' Use ' + sg.key + '.' : '');
    return '';
  }
  function doMove(b, key) {
    const s = laneFor(b).shipments.find((x) => x.key.toLowerCase() === String(key).trim().toLowerCase());
    b.fields.shipKey = s.key; b.fields.shipMovedDate = today(); persist();
    return s;
  }
  let lastMoved = '', laneTab = 'NEW YORK';
  const afterMove = (s) => { lastMoved = s.key; location.hash = '#/shipments'; };

  /* The "Move Booking To Shipment" dialog from the ☰ menu. */
  function openMove(b, after) {
    const sg = suggestShip(b);
    modal({
      title: 'Move Booking To Shipment',
      body: '<div class="mv"><label>Select Move Type</label><select id="mvType"><option>Move Booking to Existing Shipment</option></select>' +
        '<label>Select Ship Mode</label><select id="mvMode" disabled><option>' + esc(b.fields.shipMode) + '</option></select>' +
        '<label>Select Carrier</label><select id="mvCarrier" disabled><option></option></select>' +
        '<label>Select Service Contract</label><select id="mvSvc" disabled><option></option></select>' +
        '<label for="mvKey">Enter Ship Key:</label><input id="mvKey" autocomplete="off" spellcheck="false">' +
        '<div class="mv-hint" id="mvHint"></div><div class="err" id="mvErr"></div></div>',
      buttons: [
        {
          label: 'Submit', cls: 'primary', onClick: (bg) => {
            const key = $('#mvKey', bg).value, err = moveError(b, key);
            if (err) { $('#mvErr', bg).textContent = err; return false; }
            const s = doMove(b, key);
            toast('Booking ' + b.id + ' moved to shipment ' + s.key + ' (' + longDate(s.etd) + ')', 'ok');
            if (after) after(s);
          },
        },
        { label: 'Cancel' },
      ],
      onMount: (bg) => {
        const key = $('#mvKey', bg), submit = $$('.mf .btn', bg)[0], hint = $('#mvHint', bg);
        hint.innerHTML = esc(sg.note) + (sg.key ? ' <button type="button" class="linkbtn" id="mvUse">Use this key</button>' : '');
        const sync = () => {
          submit.disabled = !key.value.trim();
          const s = sg.lane && sg.lane.shipments.find((x) => x.key.toLowerCase() === key.value.trim().toLowerCase());
          $('#mvCarrier', bg).innerHTML = '<option>' + esc(s ? sg.lane.carrier : '') + '</option>';
          $('#mvSvc', bg).innerHTML = '<option>' + esc(s ? sg.lane.service : '') + '</option>';
          $('#mvErr', bg).textContent = '';
        };
        key.addEventListener('input', sync);
        key.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submit.disabled) submit.click(); });
        const use = $('#mvUse', bg);
        if (use) use.addEventListener('click', () => { key.value = sg.key; sync(); key.focus(); });
        sync(); key.focus();
      },
    });
  }

  /* -------------------------------------------------------------- sidebar */
  const MENU = [
    ['My Day', 'sun', 'my-day', false], ['My Favorites', 'star', 'favorites', false], ['Order Management', 'file', 'order-management', true],
    ['Booking', 'calendar', 'booking', true], ['Compliance', 'check', 'compliance', true], ['Trucking', 'truck', 'trucking', true],
    ['Carrier Management', 'user', 'carrier-management', true], ['Shipping', 'box', 'shipping', true], ['Warehousing', 'home', 'warehousing', true],
    ['Documentation', 'book', 'documentation', true], ['Billing', 'card', 'billing', true], ['Administration', 'user', 'administration', true],
    ['System Admin', 'sliders', 'system-admin', false], ['Messaging', 'msg', 'messaging', true], ['Reporting', 'chart', 'reporting', true],
    ['SLA Management', 'clock', 'sla-management', true], ['Resources', 'link', 'resources', false],
  ];
  const FLYOUT = [['Booking Overview', '#/booking'], ['Manage Bookings', '#/manage'], ['Amazon Globe New Bookings', '#/module/amazon-globe-new-bookings'], ['Globe Carrier SO Management', '#/module/globe-carrier-so-management']];
  const FLY = { booking: FLYOUT, shipping: [['Shipment Schedule', '#/shipments']] };
  const TITLES = { favorites: 'My Favorites', 'amazon-globe-new-bookings': 'Amazon Globe New Bookings', 'globe-carrier-so-management': 'Globe Carrier SO Management' };
  MENU.forEach((m) => { TITLES[m[2]] = m[0]; });

  function buildSidebar() {
    const sb = $('#sidebar');
    sb.innerHTML = '<button class="collapse" id="sbCollapse" title="Collapse menu" aria-label="Collapse menu">' + ico('lleft') + '</button>' +
      MENU.map((m) => {
        const href = m[2] === 'my-day' ? '#/my-day' : m[2] === 'booking' ? '#/booking' : m[2] === 'shipping' ? '#/shipments' : '#/module/' + m[2];
        const fly = FLY[m[2]]
          ? '<div class="flyout"><h4>Workflow</h4>' + FLY[m[2]].map((f) => '<a href="' + f[1] + '">' + f[0] + '</a>').join('') + '</div>' : '';
        return '<div class="sb-item" data-m="' + m[2] + '"><a class="sb-link" href="' + href + '"><span class="ico">' + ico(m[1]) + '</span><span class="lbl">' + m[0] + '</span>' +
          (m[3] ? '<span class="chev">' + ico('chev') + '</span>' : '') + '</a>' + fly + '</div>';
      }).join('');
    $('#sbCollapse').addEventListener('click', () => sb.classList.toggle('collapsed'));
    /* flyouts are position:fixed (so the sidebar can scroll); place each next to its menu item */
    $$('.sb-item', sb).forEach((it) => {
      const fl = $('.flyout', it); if (!fl) return;
      const place = () => { const r = it.getBoundingClientRect(); fl.style.left = r.right + 'px'; fl.style.top = Math.max(8, Math.min(r.top, window.innerHeight - 240)) + 'px'; };
      it.addEventListener('mouseenter', place); it.addEventListener('focusin', place);
    });
  }
  function setActive(seg, arg) {
    const key = seg === 'manage' || seg === 'booking' ? 'booking' : seg === 'shipments' ? 'shipping' : seg === 'module' ? arg : seg;
    $$('.sb-item').forEach((el) => el.classList.toggle('active', el.dataset.m === key));
  }

  /* --------------------------------------------------------- company gate */
  function askCompany(onOk, onCancel) {
    modal({
      title: 'Enter Company Code',
      body: '<p>Enter the company code to load its bookings.</p><input id="coInput" inputmode="numeric" placeholder="e.g. 981" autocomplete="off"><div class="err" id="coErr"></div>',
      buttons: [
        { label: 'Cancel', onClick: () => { if (onCancel) onCancel(); } },
        {
          label: 'Continue', cls: 'primary', onClick: (bg) => {
            const v = $('#coInput', bg).value.trim();
            if (!D.COMPANIES[v]) { $('#coErr', bg).textContent = v ? 'No company found for code "' + v + '".' : 'Please enter a company code.'; return false; }
            company = v; store.set('sessionStorage', CO_KEY, v);
            if (onOk) onOk();
          },
        },
      ],
      onMount: (bg) => {
        const inp = $('#coInput', bg); inp.focus();
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') $$('.mf .btn', bg)[1].click(); });
      },
    });
  }
  const coLabel = () => company + ' - ' + D.COMPANIES[company];

  /* ------------------------------------------------------------------ grid */
  const COLS = [
    { k: 'id', t: 'BOOKING#', get: (b) => b.id },
    { k: 'kpi', t: 'KPI STATUS', get: (b) => b.kpi },
    { k: 'dg', t: 'DG/CB', get: (b) => (b.fields.dg === 'Yes' ? 'DG' : '') },
    { k: 'chk', t: '', get: () => '' },
    { k: 'co', t: 'COMPANY CODE', get: (b) => b.fields.companyCode },
    { k: 'work', t: 'WORK ID', get: (b) => b.workId },
    { k: 'status', t: 'STATUS', get: (b) => b.status },
    { k: 'mode', t: 'SHIP MODE', get: (b) => b.fields.shipMode },
    { k: 'frt', t: 'FREIGHT TYPE', get: (b) => b.fields.freightType },
    { k: 'vendor', t: 'VENDOR', get: (b) => b.fields.vendorName },
    { k: 'ship', t: 'SHIP KEY', get: (b) => b.fields.shipKey || '' },
    { k: 'reason', t: 'REASON CODE', get: (b) => b.reason },
  ];
  const selectable = (b) => b.status === 'Sent' || (b.status === 'Confirmed' && !b.fields.shipKey);
  const kpiClass = (k) => (k === 'On Time' ? 'ok' : k === 'At Risk' ? 'warn' : 'bad');

  function mountGrid(root, st, getRows, onSel) {
    root.innerHTML = '<div class="group-bar">⋮⋮ Drag here to set row groups</div><div class="grid-wrap"><table class="grid"><thead></thead><tbody></tbody></table></div><div class="grid-foot"></div>';
    const thead = $('thead', root), tbody = $('tbody', root), foot = $('.grid-foot', root);
    let view = [];

    function rows() {
      let r = getRows().filter((b) => COLS.every((c) => !st.cols[c.k] || String(c.get(b)).toLowerCase().includes(st.cols[c.k].toLowerCase())));
      const col = COLS.find((c) => c.k === st.sort.k);
      if (col && col.k !== 'chk') r = r.slice().sort((a, b) => String(col.get(a)).localeCompare(String(col.get(b)), undefined, { numeric: true }) * st.sort.dir);
      return r;
    }
    function drawHead() {
      thead.innerHTML = '<tr>' + COLS.map((c) => c.k === 'chk'
        ? '<th class="nosort"><input type="checkbox" id="selAll" aria-label="Select all"></th>'
        : '<th data-k="' + c.k + '">' + c.t + (st.sort.k === c.k ? (st.sort.dir > 0 ? ' ↑' : ' ↓') : '') + '</th>').join('') + '</tr>' +
        '<tr class="filters">' + COLS.map((c) => c.k === 'chk' ? '<td></td>' : '<td><input data-f="' + c.k + '" value="' + esc(st.cols[c.k] || '') + '" aria-label="Filter ' + c.t + '"></td>').join('') + '</tr>';
    }
    function drawBody() {
      view = rows();
      const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
      if (st.page > pages) st.page = pages;
      const slice = view.slice((st.page - 1) * PAGE_SIZE, st.page * PAGE_SIZE);
      tbody.innerHTML = slice.length ? slice.map((b) => {
        const open = selectable(b);
        return '<tr class="' + (st.sel.has(b.id) ? 'sel' : '') + '"><td><a href="#/booking/' + encodeURIComponent(b.id) + '">' + esc(b.id) + '</a></td>' +
          '<td><span class="pill ' + kpiClass(b.kpi) + '">' + esc(b.kpi) + '</span></td><td>' + esc(COLS[2].get(b)) + '</td>' +
          '<td><input type="checkbox" data-sel="' + esc(b.id) + '" ' + (st.sel.has(b.id) ? 'checked' : '') + ' ' + (open ? '' : 'disabled') + ' aria-label="Select ' + esc(b.id) + '"></td>' +
          '<td>' + esc(b.fields.companyCode) + '</td><td>' + esc(b.workId) + '</td><td><span class="pill st">' + esc(b.status) + '</span></td>' +
          '<td>' + esc(b.fields.shipMode) + '</td><td>' + esc(b.fields.freightType) + '</td><td><a href="#/booking/' + encodeURIComponent(b.id) + '">' + esc(b.fields.vendorName) + '</a></td>' +
          '<td>' + esc(b.fields.shipKey) + '</td><td>' + esc(b.reason) + '</td></tr>';
      }).join('') : '<tr><td colspan="' + COLS.length + '"><div class="empty">No bookings to show.</div></td></tr>';
      const from = view.length ? (st.page - 1) * PAGE_SIZE + 1 : 0, to = Math.min(view.length, st.page * PAGE_SIZE);
      foot.innerHTML = '<span>' + from + ' to ' + to + ' of ' + view.length + '</span>' +
        '<button data-p="first" ' + (st.page <= 1 ? 'disabled' : '') + '>⏮</button><button data-p="prev" ' + (st.page <= 1 ? 'disabled' : '') + '>‹</button>' +
        '<span>Page ' + st.page + ' of ' + pages + '</span><button data-p="next" ' + (st.page >= pages ? 'disabled' : '') + '>›</button><button data-p="last" ' + (st.page >= pages ? 'disabled' : '') + '>⏭</button>';
      const all = $('#selAll', root);
      if (all) { const openRows = view.filter(selectable); all.checked = openRows.length > 0 && openRows.every((b) => st.sel.has(b.id)); all.disabled = !openRows.length; }
      if (onSel) onSel();
    }
    thead.addEventListener('click', (e) => {
      const th = e.target.closest('th[data-k]'); if (!th) return;
      st.sort = { k: th.dataset.k, dir: st.sort.k === th.dataset.k ? -st.sort.dir : 1 };
      drawHead(); drawBody();
    });
    thead.addEventListener('input', (e) => {
      if (e.target.dataset.f) { st.cols[e.target.dataset.f] = e.target.value; st.page = 1; drawBody(); }
      if (e.target.id === 'selAll') {
        view.filter(selectable).forEach((b) => (e.target.checked ? st.sel.add(b.id) : st.sel.delete(b.id)));
        drawBody();
      }
    });
    tbody.addEventListener('change', (e) => {
      const id = e.target.dataset.sel; if (!id) return;
      if (e.target.checked) st.sel.add(id); else st.sel.delete(id);
      drawBody();
    });
    foot.addEventListener('click', (e) => {
      const p = e.target.dataset.p; if (!p) return;
      const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
      st.page = p === 'first' ? 1 : p === 'prev' ? Math.max(1, st.page - 1) : p === 'next' ? Math.min(pages, st.page + 1) : pages;
      drawBody();
    });
    drawHead(); drawBody();
    return { redraw() { drawBody(); }, redrawAll() { drawHead(); drawBody(); } };
  }

  /* ------------------------------------------------------------- overview */
  const ov = { filter: 'open', st: { cols: {}, sort: { k: 'id', dir: 1 }, page: 1, sel: new Set() } };
  const FILTER_LABEL = {
    open: 'All open bookings', ready: 'New bookings – Ready to Process', decline: 'New bookings – Ready to Decline', notready: 'New bookings – Not Ready to Process',
    declined: 'Declined bookings', autoip: 'Auto Confirm – In Progress', autoex: 'Auto Confirm – Exception', moved: 'Confirmed – not yet moved to shipment', all: 'All bookings',
  };
  function filterRows(f) {
    const mine = bookings.filter((b) => b.fields.companyCode === company);
    const open = mine.filter((b) => b.status === 'Sent');
    switch (f) {
      case 'open': return open;
      case 'ready': return open.filter((b) => b.readiness === 'process');
      case 'decline': return open.filter((b) => b.readiness === 'decline');
      case 'notready': return open.filter((b) => b.readiness === 'notready');
      case 'declined': return mine.filter((b) => b.status === 'Declined');
      case 'moved': return mine.filter((b) => b.status === 'Confirmed' && !b.fields.shipKey);
      case 'all': return mine;
      default: return [];
    }
  }
  const cnt = (f) => filterRows(f).length;

  function pageHead(title) {
    return '<div class="page-head"><h1>' + title + '</h1><button class="co-btn" id="coBtn">' + esc(coLabel()) + ' ▾</button></div>';
  }
  function bindCo() { $('#coBtn').addEventListener('click', () => askCompany(() => { ov.st.sel.clear(); route(); })); }

  function viewOverview() {
    const c = $('#content');
    const chip = (f, label, pri) => '<button class="chip ' + (pri ? 'pri ' : '') + (ov.filter === f ? 'on' : '') + '" data-f="' + f + '">' + label + ' (' + cnt(f) + ')</button>';
    c.innerHTML = pageHead('Booking') +
      '<div class="panel tiles">' +
      '<div class="tile"><h3><a data-f="open">New Bookings</a><span class="badge">' + (cnt('ready') + cnt('decline') + cnt('notready')) + '</span></h3><div class="chips">' +
      chip('ready', 'Ready to Process', true) + chip('decline', 'Ready to Decline', true) + chip('notready', 'Not Ready to Process', true) + '</div></div>' +
      '<div class="tile"><h3><a data-f="declined">Declined Bookings</a><span class="badge">' + cnt('declined') + '</span></h3><div class="chips">' + chip('declined', 'All') + '</div></div>' +
      '<div class="tile"><h3><a data-f="autoip">Auto Confirm</a><span class="badge">0</span></h3><div class="chips">' + chip('autoip', 'In Progress') + chip('autoex', 'Exception') + '</div></div>' +
      '<div class="tile"><h3><a data-f="moved">Bookings Not Yet Moved to Shipment</a><span class="badge">' + cnt('moved') + '</span></h3><div class="chips">' + chip('moved', 'All') + '</div></div>' +
      '</div>' +
      '<div class="grid-bar"><span class="left" id="viewLbl"></span>' +
      '<button class="btn auto" id="btnAuto" title="Fills, confirms and moves the selected bookings to their shipment">⚡ Auto-Process Selected (<span id="selN">0</span>)</button>' +
      '<button class="btn" id="btnStd">Standard View ▾</button><button class="btn sq" id="btnFind" title="Search">' + ico('search') + '</button><button class="btn sq" id="btnRefresh" title="Refresh">' + ico('rotate') + '</button></div>' +
      '<div id="gridRoot"></div>';
    bindCo();
    let grid;
    const syncSel = () => { $('#selN').textContent = ov.st.sel.size; $('#btnAuto').disabled = !ov.st.sel.size; };
    const setLbl = () => { $('#viewLbl').textContent = 'Showing: ' + FILTER_LABEL[ov.filter] + ' – ' + cnt(ov.filter) + ' booking(s)'; $$('.chip').forEach((x) => x.classList.toggle('on', x.dataset.f === ov.filter)); };
    grid = mountGrid($('#gridRoot'), ov.st, () => filterRows(ov.filter), syncSel);
    setLbl();
    $$('[data-f]', c).forEach((el) => { if (el.closest('#gridRoot')) return; el.addEventListener('click', () => { ov.filter = el.dataset.f; ov.st.sel.clear(); ov.st.page = 1; setLbl(); grid.redraw(); }); });
    $('#btnRefresh').addEventListener('click', () => { ov.st.cols = {}; ov.st.sel.clear(); ov.filter = 'open'; setLbl(); grid.redrawAll(); toast('Grid refreshed'); });
    $('#btnFind').addEventListener('click', () => { const i = $('tr.filters input[data-f="id"]'); if (i) i.focus(); });
    $('#btnStd').addEventListener('click', () => toast('Standard View is the only layout in this demo'));
    $('#btnAuto').addEventListener('click', () => runAutomation(Array.from(ov.st.sel).map(find), () => { ov.st.sel.clear(); viewOverview(); }));
  }

  function viewManage() {
    const c = $('#content');
    const st = { cols: {}, sort: { k: 'id', dir: 1 }, page: 1, sel: new Set() };
    c.innerHTML = pageHead('Manage Bookings') + '<div class="grid-bar"><span class="left">Every booking for this company, whatever its status.</span></div><div id="gridRoot"></div>';
    bindCo();
    mountGrid($('#gridRoot'), st, () => filterRows('all'));
  }

  /* ----------------------------------------------------------- automation */
  function runAutomation(list, done) {
    list = list.filter(Boolean);
    const li = (b) => '<li class="run" data-id="' + esc(b.id) + '"><span class="t">…</span><span><b>' + esc(b.id) + '</b> – queued</span></li>';
    modal({
      title: 'Auto-Process Bookings', wide: true,
      body: '<p>For each selected booking the automation fills the <b>Stuffing Location</b> (vendor rule), <b>FOB ETD</b>, both <b>ETAs</b>, <b>SI</b> and <b>Cargo cutoff dates</b> (from the Estimated Cargo Delivery Date) and the fixed <b>Vessel</b>, <b>Voyage</b> and <b>Cargo Cutoff Time</b>, then confirms it. Bookings flagged <i>Ready to Decline</i> or <i>Not Ready to Process</i> are skipped for a person to review.</p>' +
        '<label class="optrow"><input type="checkbox" id="optMove" checked> Also move confirmed bookings to their shipment (ship key looked up from the FOB ETD)</label><ul class="log">' + list.map(li).join('') + '</ul>',
      buttons: [
        { label: 'Cancel', onClick: () => { } },
        {
          label: 'Run automation', cls: 'primary', onClick: (bg) => {
            const btns = $$('.mf .btn', bg); btns.forEach((x) => (x.disabled = true));
            const optMove = $('#optMove', bg); const move = optMove.checked; optMove.disabled = true;
            let ok = 0, skipped = 0, i = 0;
            /* returns [kind, message] for one booking */
            const process = (b) => {
              const parts = []; let acted = false;
              if (b.status === 'Sent') {
                if (b.readiness !== 'process') return ['skip', b.readiness === 'decline' ? 'flagged Ready to Decline – needs a person to decide.' : 'flagged Not Ready to Process – needs a person to check.'];
                const r = autoFill(b), left = validate(b);
                if (left.length) return ['skip', 'still missing: ' + esc(r.missing.concat(left.map((x) => x.label)).join(', ')) + '.'];
                doConfirm(b); acted = true;
                parts.push(esc(b.fields.stuffing) + ' · FOB ETD <b>' + esc(b.fields.fobEtd) + '</b> · ETAs ' + esc(b.fields.dischargeEta) + ' · SI ' + esc(b.fields.siCutoffDate) + ' · cargo cutoff ' + esc(b.fields.cargoCutoffDate) + ' ' + esc(b.fields.cargoCutoffTime) + ' · confirmed');
              }
              if (b.status === 'Confirmed' && !b.fields.shipKey) {
                if (!move) { if (!acted) return ['skip', 'already confirmed. Tick “Also move confirmed bookings” to move it to a shipment.']; }
                else {
                  const sg = suggestShip(b), err = sg.key ? moveError(b, sg.key) : sg.note;
                  if (err) parts.push('<i>not moved: ' + esc(err) + '</i>');
                  else { doMove(b, sg.key); acted = true; parts.push('moved to shipment <b>' + sg.key + '</b> (' + longDate(b.fields.fobEtd) + ')'); }
                }
              }
              if (!acted) return ['skip', b.fields.shipKey ? 'already in shipment ' + esc(b.fields.shipKey) + '.' : 'nothing to do.'];
              return ['ok', parts.join('; ') + '.'];
            };
            const step = () => {
              if (i >= list.length) {
                btns[1].textContent = 'Done'; btns[1].disabled = false;
                btns[1].onclick = () => { bg.remove(); toast(ok + ' processed, ' + skipped + ' skipped', ok ? 'ok' : ''); done(); };
                return;
              }
              const b = list[i++]; const row = $('li[data-id="' + b.id + '"]', bg);
              const res = process(b);
              if (res[0] === 'ok') ok++; else skipped++;
              row.className = res[0]; $('.t', row).textContent = res[0] === 'ok' ? 'OK' : 'SKIP'; row.lastChild.innerHTML = '<b>' + esc(b.id) + '</b> – ' + res[1];
              setTimeout(step, 450);
            };
            step();
            return false;
          },
        },
      ],
    });
  }

  /* --------------------------------------------------------- booking view */
  const wsState = { tab: 'header', closed: {} };
  const viewed = () => { try { return JSON.parse(store.get('localStorage', VIEWED_KEY)) || []; } catch (e) { return []; } };
  function addViewed(id) { const v = viewed().filter((x) => x !== id); v.unshift(id); store.set('localStorage', VIEWED_KEY, JSON.stringify(v.slice(0, 10))); }

  function viewWorkspace(id) {
    const b = find(id);
    const c = $('#content');
    if (!b) { c.innerHTML = '<div class="page-head"><h1>Booking not found</h1></div><p>No booking matches “' + esc(id) + '”. <a href="#/booking">Back to Booking Overview</a></p>'; return; }
    if (!company) { company = b.fields.companyCode; store.set('sessionStorage', CO_KEY, company); }
    addViewed(b.id);
    const editable = b.status === 'Sent';

    function F(key, label, span, o) {
      o = o || {};
      const f = b.fields;
      const v = o.val !== undefined ? o.val : getV(f, key);
      const ed = editable && o.ed;
      const chg = ed && JSON.stringify(v) !== JSON.stringify(getV(b.orig, key));
      let ctl;
      if (o.chk) {
        return '<div class="f chk s' + span + '"><input type="checkbox" data-key="' + key + '" ' + (v ? 'checked' : '') + ' ' + (ed ? '' : 'disabled') + ' id="k_' + key + '"><label for="k_' + key + '">' + label + '</label></div>';
      }
      if (o.sel) {
        const opts = [''].concat(o.sel); if (v && opts.indexOf(v) < 0) opts.push(v);
        ctl = '<select data-key="' + key + '" ' + (ed ? '' : 'disabled') + '>' + opts.map((x) => '<option value="' + esc(x) + '" ' + (x === v ? 'selected' : '') + '>' + (x === '' ? 'Select One' : esc(x)) + '</option>').join('') + '</select>';
      } else if (o.area) {
        ctl = '<textarea data-key="' + key + '" readonly>' + esc(v) + '</textarea>';
      } else {
        ctl = '<input type="text" data-key="' + key + '" value="' + esc(v) + '" ' + (ed ? '' : 'readonly') + '>';
        if (o.pencil) ctl = '<div class="row">' + ctl + '<button type="button" class="pencil" data-pencil="' + key + '" title="Edit" ' + (ed ? '' : 'disabled') + '>' + ico('pencil') + '</button></div>';
      }
      return '<div class="f s' + span + (chg ? ' chg' : '') + '" data-wrap="' + key + '"><label>' + label + '</label>' + ctl + '</div>';
    }
    const sec = (key, title, cls) => '<div class="sec-title ' + (cls || '') + (wsState.closed[key] ? ' closed' : '') + '" data-sec="' + key + '">' + title + '</div><div class="sec-body ' + (wsState.closed[key] ? 'closed' : '') + '" data-body="' + key + '">';
    const t = totals(b);
    const E = { ed: true };
    const R = {};
    const f = b.fields;

    const buildHeader = () =>
      sec('basic', 'Basic Information', 'sub') + '<div class="g12">' +
      F('bookingKey', 'Booking Key', 3, R) + F('office', 'ABC Office', 3, R) + F('companyCode', 'Company Code', 3, R) + F('', 'Status', 3, { val: STATUS_LABEL[b.status] }) +
      F('vendorName', 'Main Vendor Code/Name', 6, { val: f.vendorCode + ' - ' + f.vendorName }) + F('vendorContact', 'Main Vendor Contact', 2, R) + F('vendorPhone', 'Main Vendor Phone', 2, R) + F('vendorEmail', 'Main Vendor Email', 2, R) +
      F('subVendor', 'Subvendor Code/Name', 6, R) + F('subContact', 'Subvendor Contact', 2, R) + F('subPhone', 'Subvendor Phone', 2, R) + F('subEmail', 'Subvendor Email', 2, R) +
      F('usVendor', 'US Vendor', 2, R) + F('vendorRef', 'Vendor Reference Number (optional)', 4, E) + F('incoterms', 'Incoterms', 3, R) + F('bookingType', 'Booking Type', 3, R) +
      F('createdDate', 'Booked Created Date', 3, R) + F('receivedDate', 'Booking Received Date', 3, R) + F('confirmDate', 'Booking Confirmation Date', 3, R) + F('shipKey', 'Shipment Key', 3, R) +
      F('contactName', 'Contact Name (optional)', 3, E) + F('contactPhone', 'Contact Phone (optional)', 3, E) + F('contactFax', 'Contact Fax (optional)', 3, E) + F('contactEmail', 'Contact Email', 3, E) +
      '</div></div>' +
      sec('abc', 'ABC Contact', 'sub') + '<div class="g12">' +
      F('opContact', 'Operation Contact', 2, { sel: L.opContacts, ed: true }) + F('opEmail', 'Operation Email', 2, R) + F('opPhone', 'Operation Phone', 2, R) +
      F('defOpContact', 'Default Operation Contact', 2, R) + F('defOpEmail', 'Default Operation Email', 2, R) + F('defOpPhone', 'Default Operation Phone', 2, R) +
      F('docContact', 'Documentation Contact', 2, { sel: L.docContacts, ed: true }) + F('docEmail', 'Documentation Email', 2, R) + F('docPhone', 'Documentation Phone', 2, R) + '<div class="s6"></div>' +
      F('whContact', 'Warehouse Contact', 2, R) + F('whEmail', 'Warehouse Email', 2, R) + F('whPhone', 'Warehouse Phone', 2, R) +
      '</div></div>' +
      sec('fcr', 'FCR Information', 'sub') + '<div class="g12">' +
      F('shipperAddress', 'Shipper Address (Vendor)', 6, { area: true }) + '<div class="s6 g12" style="align-content:start">' + F('shipperName', 'Shipper Name', 12, R) + F('fcrEmail', 'Email address to receive FCR', 12, R) + '</div>' +
      '</div></div>' +
      sec('cargo', 'Cargo', 'sub') + '<div class="g12">' +
      F('originCountry', 'Country/Region of Origin', 3, R) + F('solidWood', 'Solid Wood Packing', 3, R) + F('exportLicense', 'Export License Required', 3, R) + F('dg', 'Contains Dangerous Goods (DG) / Non DG - With Chemical / Battery', 3, R) +
      F('mfrName', 'Manufacturer Name', 6, R) + F('mfrAddr1', 'Manufacturer Address 1', 3, R) + F('mfrAddr2', 'Manufacturer Address 2', 3, R) +
      F('mfrCity', 'Manufacturer City', 3, R) + F('mfrState', 'Manufacturer Province/State', 3, R) + F('mfrCountry', 'Manufacturer Country/Region Code', 3, R) + F('mfrPostal', 'Manufacturer Postal Code', 3, R) +
      F('stuffing', 'Stuffing Location', 6, { sel: D.STUFFING.map((s) => s.name), ed: true }) + F('stAddr1', 'Stuffing Location Address 1', 3, R) + F('stAddr2', 'Stuffing Location Address 2', 3, R) +
      F('stCity', 'Stuffing Location City', 3, R) + F('stState', 'Stuffing Location Province/State', 3, R) + F('stCountry', 'Stuffing Location Country/Region Code', 3, R) + F('stPostal', 'Stuffing Location Postal Code', 3, R) +
      '</div></div>' +
      sec('ports', 'Ports & Schedule', 'sub') + '<div class="g12">' +
      F('fobPort', 'FOB Port', 6, R) + F('fobEtd', 'FOB ETD', 3, E) + '<div class="s3"></div>' +
      F('dischargePort', 'Discharge Port', 6, { sel: L.dischargePorts, ed: true }) + F('dischargeEta', 'Discharge Port ETA', 3, E) + F('dc', 'DC', 3, { sel: L.dc, ed: true }) +
      F('finalDest', 'Final Destination', 6, { sel: L.finalDest, ed: true }) + F('finalEta', 'Final Destination ETA', 3, E) + F('shipTo', 'Ship To Location', 3, { sel: L.shipTo, ed: true }) +
      F('estDelivery', 'Estimated Cargo Delivery Date', 3, R) + F('actualReceived', 'Actual Cargo Received Date', 3, E) + F('siCutoffDate', 'ABC SI Cutoff Date', 3, E) + F('siCutoffTime', 'ABC SI Cutoff Time', 3, E) +
      F('carrier', 'Carrier Name/Code', 6, { sel: L.carriers, ed: true }) + F('carrierSo', 'Carrier SO Number', 3, E) + F('vessel', 'Vessel', 3, { ed: true, pencil: true }) +
      F('voyage', 'Voyage', 3, E) + F('cargoCutoffDate', 'Cargo Cutoff Date', 3, E) + F('cargoCutoffTime', 'Cargo Cutoff Time', 3, E) + F('trucking', 'ABC Trucking Service Required', 3, { chk: true, ed: true }) +
      '</div></div>' +
      sec('info', 'Booking Information', 'sub') + '<div class="g12">' +
      F('shipMode', 'Ship Mode', 3, { sel: L.shipMode, ed: true }) + F('freightType', 'Freight Type', 3, { sel: L.freightType, ed: true }) + F('impacted', 'ABC Impacted', 3, { sel: L.impacted, ed: true }) + F('pallets', 'Number of Pallets', 3, E) +
      F('', 'Total Booked Units', 3, { val: t.units }) + F('', 'Total Booked Cartons', 3, { val: t.cartons }) + F('', 'Total Booked Weight', 3, { val: t.weight }) + F('chargeableWeight', 'Total Chargeable Weight', 3, E) +
      F('', 'Total Booked Volume', 3, { val: t.volume }) + F('', 'Total Booked Number of POs', 3, { val: t.pos.size }) + F('', 'Total Booked Number of Items', 3, { val: t.items }) + '<div class="s3"></div>' +
      '<div class="s5 g12" style="align-content:start">' + [0, 1, 2, 3, 4].map((i) => F('containers.' + i, i ? '' : 'Container Required', 12, E)).join('') + '</div>' +
      '<div class="s7 g12" style="align-content:start">' + [0, 1, 2, 3, 4].map((i) => F('containerTypes.' + i, i ? '' : 'Container Type', 12, { sel: L.containerType, ed: true })).join('') + '</div>' +
      '</div></div>' +
      sec('items', 'Item Detail', '') +
      '<div class="item-grid"><table><thead><tr>' + ['Project', 'Ship Method', 'Item on Hold', 'PO Number', 'Product Number', 'Color', 'Size', 'PO Final Destination', 'PO Type', 'PackType', 'Carrier Item Description', 'Range Key', 'Booked Cartons', 'Booked Units', 'Booked Weight', 'Booked Volume'].map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
      b.items.map((i, n) => '<tr><td>' + (n + 1) + '</td><td>' + esc(i.shipMethod) + '</td><td>' + i.hold + '</td><td>' + i.po + '</td><td>' + i.product + '</td><td>' + esc(i.color) + '</td><td>' + esc(i.size) + '</td><td>' + i.finalDest + '</td><td>' + i.poType + '</td><td>' + i.pack + '</td><td>' + esc(i.desc) + '</td><td>' + i.range + '</td><td>' + i.cartons + '</td><td>' + i.units + '</td><td>' + i.weight + '</td><td>' + i.volume + '</td></tr>').join('') +
      '</tbody><tfoot><tr><td colspan="12">Total</td><td>' + t.cartons + '</td><td>' + t.units + '</td><td>' + t.weight + '</td><td>' + t.volume + '</td></tr></tfoot></table></div></div>';

    function tabBody() {
      if (wsState.tab === 'vibe') {
        return '<div class="ws-head"><h2>VIBE and Certificate Approval</h2></div><div class="item-grid"><table><thead><tr><th>Document</th><th>Required for</th><th>Status</th></tr></thead><tbody>' +
          '<tr><td>Certificate of Origin</td><td>' + esc(f.originCountry) + ' → USA</td><td><span class="pill ok">Approved</span></td></tr>' +
          '<tr><td>VIBE compliance check</td><td>' + esc(f.vendorName) + '</td><td><span class="pill ok">Approved</span></td></tr>' +
          '<tr><td>Packing declaration</td><td>Solid wood packing: ' + esc(f.solidWood) + '</td><td><span class="pill warn">Pending</span></td></tr></tbody></table></div>';
      }
      if (wsState.tab === 'notes') {
        return '<div class="ws-head"><h2>Notes and Messages</h2></div>' +
          (b.notes.length ? b.notes.map((n) => '<div class="note"><small>' + esc(n.by) + ' · ' + esc(n.at) + '</small>' + esc(n.text) + '</div>').join('') : '<p class="legend">No notes yet.</p>') +
          '<div class="f" style="max-width:640px"><label>Add a note</label><textarea id="noteText" placeholder="Type a note for this booking…"></textarea></div><p><button class="btn primary" id="noteAdd">Add Note</button></p>';
      }
      if (wsState.tab === 'print') {
        const s = f.stuffing ? f.stuffing + ' – ' + [f.stAddr1, f.stCity, f.stState, f.stCountry].filter(Boolean).join(', ') : '— not yet assigned —';
        const kv = [['Booking #', b.id], ['Status', STATUS_LABEL[b.status]], ['Vendor', f.vendorCode + ' – ' + f.vendorName], ['Shipper address', f.shipperAddress.replace(/\n/g, ', ')], ['Stuffing location', s],
          ['Route', f.fobPort + ' → ' + f.finalDest], ['FOB ETD / Final ETA', f.fobEtd + ' / ' + f.finalEta], ['Carrier', f.carrier], ['Ship mode / freight', f.shipMode + ' / ' + f.freightType],
          ['Totals', t.cartons + ' cartons · ' + t.units + ' units · ' + t.weight + ' kg · ' + t.volume + ' cbm · ' + t.pos.size + ' PO(s)']];
        return '<div class="ws-head"><h2>Print Booking Confirmation</h2><button class="btn primary" id="btnPrint">Print</button></div><div class="print-doc"><h2>ABC Shipping – Booking Confirmation</h2><div>Company ' + esc(f.companyCode) + ' – ' + esc(D.COMPANIES[f.companyCode] || '') + '</div><table class="kv">' +
          kv.map((r) => '<tr><td>' + r[0] + '</td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table></div>';
      }
      return '<div class="ws-head"><h2>Booking Header Information</h2><span class="legend"><i></i>changed field</span>' +
        '<button class="btn sq" id="btnSave" title="Save draft" ' + (editable ? '' : 'disabled') + '>' + ico('save') + '</button>' +
        '<button class="btn auto" id="btnAutoFill" ' + (editable ? '' : 'disabled') + ' title="Fill Stuffing Location, FOB ETD, ETAs, cutoffs, Vessel, Voyage and Cargo Cutoff Time from the rules">⚡ Auto-Fill</button>' +
        '<button class="btn primary" id="btnConfirm" ' + (editable ? '' : 'disabled') + '>Confirm</button>' +
        '<button class="btn primary" id="btnDecline" ' + (editable ? '' : 'disabled') + '>Decline</button>' +
        '<button class="btn primary" id="btnVoid" ' + (editable ? '' : 'disabled') + '>Void</button>' +
        '<span class="menu-wrap"><button class="btn sq" id="btnMenu" title="More actions" aria-haspopup="true">☰</button><div class="menu" id="menuList">' +
        [['issues', 'Operation Issue Count'], ['move', 'Move Booking to Shipment'], ['message', 'Create Booking Header Message'], ['isf', 'Refresh ISF Data'], ['files', 'View/Upload Files'], ['cbr', 'Create Carrier Booking Request'], ['dg', 'DG Declaration']]
          .map((m) => '<button type="button" data-act="' + m[0] + '">' + m[1] + '</button>').join('') + '</div></span></div>' + buildHeader();
    }

    function paint() {
      c.innerHTML =
        '<div class="qnav"><b>Quick Navigation</b><span>Previously Viewed Bookings:</span><select id="qnViewed"><option value="">Select One</option>' + viewed().map((v) => '<option>' + esc(v) + '</option>').join('') + '</select>' +
        '<span>Booking #:</span><input id="qnId" size="18"><button class="btn primary" id="qnGo" style="padding:5px 10px">Go To Booking</button><span class="ml" id="qnStatus">Booking #: ' + esc(b.id) + ' ' + esc(b.status) + (b.fields.shipKey ? ' · Ship key ' + esc(b.fields.shipKey) : '') + '</span></div>' +
        '<div class="tabs">' + [['header', 'Booking Header'], ['vibe', 'VIBE and Certificate Approval'], ['notes', 'Notes and Messages'], ['print', 'Print Booking Confirmation']].map((x) => '<button class="tab ' + (wsState.tab === x[0] ? 'on' : '') + '" data-tab="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
        '<div class="ws" id="wsBody">' + tabBody() + '</div>';
      wire();
    }

    function refreshKeys(keys) {
      keys.forEach((k) => { const el = $('[data-key="' + k + '"]'); if (el) el.value = getV(b.fields, k); });
    }
    function wire() {
      $$('.tab', c).forEach((x) => x.addEventListener('click', () => { wsState.tab = x.dataset.tab; paint(); }));
      $('#qnViewed').addEventListener('change', (e) => { if (e.target.value) location.hash = '#/booking/' + encodeURIComponent(e.target.value); });
      const go = () => { const x = find($('#qnId').value.trim()); if (x) location.hash = '#/booking/' + encodeURIComponent(x.id); else toast('Booking not found', 'bad'); };
      $('#qnGo').addEventListener('click', go); $('#qnId').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      const body = $('#wsBody');
      body.addEventListener('click', (e) => { const s = e.target.closest('[data-sec]'); if (s) { wsState.closed[s.dataset.sec] = !wsState.closed[s.dataset.sec]; s.classList.toggle('closed'); $('[data-body="' + s.dataset.sec + '"]').classList.toggle('closed'); } });
      const on = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
      on('#btnPrint', () => window.print());
      on('#noteAdd', () => { const v = $('#noteText').value.trim(); if (!v) return; b.notes.push({ by: 'ABC-OPS01', at: new Date().toLocaleString(), text: v }); persist(); paint(); });
      on('#btnSave', () => { persist(); toast('Draft saved', 'ok'); });
      on('#btnMenu', (e) => { e.stopPropagation(); $('#menuList').classList.toggle('open'); });
      const act = {
        issues: () => modal({ title: 'Operation Issue Count', body: '<p>Open operation issues for <b>' + esc(b.id) + '</b>: <b>0</b></p>', buttons: [{ label: 'Close', cls: 'primary' }] }),
        move: () => {
          if (b.fields.shipKey) toast('Already in shipment ' + b.fields.shipKey, 'bad');
          else if (b.status !== 'Confirmed') toast('Confirm the booking before moving it to a shipment.', 'bad');
          else openMove(b, afterMove);
        },
        message: () => { wsState.tab = 'notes'; paint(); },
        isf: () => toast('ISF data refreshed', 'ok'),
        files: () => toast('View/Upload Files is not part of this demo'),
        cbr: () => toast('Carrier booking request comes after the shipment step and is not part of this demo yet'),
        dg: () => toast('DG Declaration is not needed: this booking has no dangerous goods'),
      };
      $$('#menuList [data-act]').forEach((el) => el.addEventListener('click', () => { $('#menuList').classList.remove('open'); act[el.dataset.act](); }));
      on('#btnAutoFill', () => {
        const r = autoFill(b);
        paint();
        if (r.missing.length) toast('Filled what the rules cover. Still needs you: ' + r.missing.join('; '), 'bad');
        else toast('Auto-filled ' + r.filled.length + ' fields from the rules', 'ok');
      });
      on('#btnConfirm', () => {
        const errs = validate(b);
        $$('.f.err').forEach((x) => { x.classList.remove('err'); const h = $('.hint-err', x); if (h) h.remove(); });
        if (errs.length) {
          errs.forEach((er) => { const w = $('[data-wrap="' + er.key + '"]'); if (w) { w.classList.add('err'); w.insertAdjacentHTML('beforeend', '<span class="hint-err">' + er.msg + '</span>'); w.scrollIntoView({ block: 'center', behavior: 'smooth' }); } });
          toast(errs.length === 1 ? errs[0].msg : errs.length + ' required fields are empty: ' + errs.map((x) => x.label).join(', '), 'bad'); return;
        }
        modal({ title: 'Confirm Booking', body: '<p>Confirm booking <b>' + esc(b.id) + '</b> with Stuffing Location <b>' + esc(b.fields.stuffing) + '</b>?</p>', buttons: [{ label: 'Cancel' }, { label: 'Confirm', cls: 'primary', onClick: () => {
          doConfirm(b); toast('Booking ' + b.id + ' confirmed', 'ok');
          const sg = suggestShip(b);
          modal({
            title: 'Booking Confirmed', body: '<p>Booking <b>' + esc(b.id) + '</b> is confirmed.</p><p>Next step: move it to its shipment. ' + esc(sg.note) + '</p>',
            buttons: [{ label: 'Later', onClick: () => { location.hash = '#/booking'; } }, { label: 'Move to Shipment', cls: 'primary', onClick: () => { paint(); openMove(b, afterMove); } }],
          });
        } }] });
      });
      on('#btnDecline', () => {
        modal({
          title: 'Decline Booking', body: '<p>Select a reason code for declining <b>' + esc(b.id) + '</b>.</p><select id="rc"><option value="">Select One</option>' + L.reasonCodes.map((r) => '<option>' + esc(r) + '</option>').join('') + '</select><div class="err" id="rcErr"></div>',
          buttons: [{ label: 'Cancel' }, { label: 'Decline', cls: 'danger', onClick: (bg) => { const v = $('#rc', bg).value; if (!v) { $('#rcErr', bg).textContent = 'A reason code is required.'; return false; } doDecline(b, v); toast('Booking ' + b.id + ' declined'); location.hash = '#/booking'; } }],
        });
      });
      on('#btnVoid', () => modal({ title: 'Void Booking', body: '<p>Void booking <b>' + esc(b.id) + '</b>? It will be removed from the to-do list.</p>', buttons: [{ label: 'Cancel' }, { label: 'Void', cls: 'danger', onClick: () => { doVoid(b); toast('Booking ' + b.id + ' voided'); location.hash = '#/booking'; } }] }));
      body.addEventListener('click', (e) => { const p = e.target.closest('[data-pencil]'); if (p) { const inp = $('[data-key="' + p.dataset.pencil + '"]'); if (inp) inp.focus(); } });

      const onEdit = (e) => {
        const el = e.target; const key = el.dataset && el.dataset.key; if (!key || el.readOnly) return;
        const val = el.type === 'checkbox' ? el.checked : el.value;
        setV(b.fields, key, val);
        if (key === 'stuffing') { setStuffing(b, val); refreshKeys(['stAddr1', 'stAddr2', 'stCity', 'stState', 'stCountry', 'stPostal']); }
        if (key === 'opContact' && D.OPS[val]) { b.fields.opEmail = D.OPS[val][0]; b.fields.opPhone = D.OPS[val][1]; refreshKeys(['opEmail', 'opPhone']); }
        if (key === 'docContact') { const d = D.DOCS[val] || ['', '']; b.fields.docEmail = d[0]; b.fields.docPhone = d[1]; refreshKeys(['docEmail', 'docPhone']); }
        const w = el.closest('.f');
        if (w && w.dataset.wrap) { w.classList.toggle('chg', JSON.stringify(val) !== JSON.stringify(getV(b.orig, key))); if (val && w.classList.contains('err')) { w.classList.remove('err'); const h = $('.hint-err', w); if (h) h.remove(); } }
        persist();
      };
      body.addEventListener('input', onEdit); body.addEventListener('change', onEdit);
    }
    paint();
  }

  /* --------------------------------------------------------- other views */
  function viewMyDay() {
    const c = $('#content');
    const open = bookings.filter((b) => b.status === 'Sent');
    const n = (fn) => bookings.filter(fn).length;
    c.innerHTML = '<div class="page-head"><h1>My Day</h1></div><div class="cards">' +
      '<div class="card"><div class="n">' + open.length + '</div><div class="l">Bookings waiting for action</div></div>' +
      '<div class="card"><div class="n">' + n((b) => b.status === 'Sent' && b.readiness === 'process') + '</div><div class="l">Ready to process</div></div>' +
      '<div class="card"><div class="n">' + n((b) => b.status === 'Sent' && b.readiness !== 'process') + '</div><div class="l">Need attention</div></div>' +
      '<div class="card"><div class="n">' + n((b) => b.status === 'Confirmed' && !b.fields.shipKey) + '</div><div class="l">Confirmed, waiting for a shipment</div></div>' +
      '<div class="card"><div class="n">' + n((b) => !!b.fields.shipKey) + '</div><div class="l">Moved to a shipment</div></div></div>' +
      '<div class="panel todo"><div class="todo-row"><b style="flex:1">Bookings to do</b><a class="btn primary" href="#/booking" style="text-decoration:none">Open Booking Overview →</a></div>' +
      (open.length ? open.map((b) => '<div class="todo-row"><span class="id">' + esc(b.id) + '</span><span class="v">' + esc(b.fields.vendorName) + '</span><span class="pill ' + kpiClass(b.kpi) + '">' + esc(b.kpi) + '</span><a href="#/booking/' + encodeURIComponent(b.id) + '">Open</a></div>').join('') : '<div class="empty">All caught up – nothing waiting.</div>') + '</div>';
  }
  function viewShipments() {
    const c = $('#content');
    const lane = D.SHIPMENT_LANES.find((l) => l.id === laneTab);
    let body;
    if (!lane) body = '<div class="panel empty">No sailing schedule is loaded for ' + esc(laneTab) + ' in this demo.</div>';
    else {
      const rows = lane.shipments.map((s) => {
        const bs = bookings.filter((b) => b.fields.shipKey === s.key);
        const tot = bs.reduce((x, b) => { const t = totals(b); x.c += t.cartons; x.v += t.volume; x.w += t.weight; return x; }, { c: 0, v: 0, w: 0 });
        const ecdd = bs.map((b) => parseDate(b.fields.estDelivery)).filter(Boolean).sort((p, q) => p - q)[0];
        const eta = fmtDate(addDays(parseDate(s.etd), D.RULES.schedule.etaDaysAfterFobEtd));
        return '<tr class="' + (s.closed ? 'closed ' : '') + (s.key === lastMoved ? 'flash' : '') + '"><td><b>' + s.key + '</b></td><td>' + (ecdd ? longDate(fmtDate(ecdd)) : '') + '</td><td>' + longDate(s.etd) + '</td><td>' + longDate(eta) + '</td>' +
          '<td>' + (s.closed ? '<span class="pill ok">Containers booked</span>' : '<span class="pill st">Open</span>') + '</td>' +
          '<td class="keys">' + (bs.length ? bs.map((b) => '<a href="#/booking/' + encodeURIComponent(b.id) + '">' + esc(b.id) + '</a>').join('') : '<span class="muted">–</span>') + '</td>' +
          '<td class="num">' + (bs.length ? tot.c : '') + '</td><td class="num">' + (bs.length ? Math.round(tot.v * 1000) / 1000 : '') + '</td><td class="num">' + (bs.length ? Math.round(tot.w * 100) / 100 : '') + '</td></tr>';
      }).join('');
      const inShip = bookings.filter((b) => b.fields.shipKey).length;
      body = '<div class="lane-band">' + esc(lane.title) + ' · ' + esc(lane.weekday) + '</div>' +
        '<div class="grid-bar"><span class="left">' + inShip + ' booking(s) saved under a shipment. Their booking keys are listed against the ship key so containers can be booked from here later.</span><span class="legend"><i class="g"></i>green = containers already booked</span></div>' +
        '<div class="grid-wrap"><table class="grid ship"><thead><tr><th class="nosort">SHIPMENT KEY</th><th class="nosort">ECDD</th><th class="nosort">ETD</th><th class="nosort">ETA</th><th class="nosort">STATUS</th><th class="nosort">BOOKING KEYS</th><th class="nosort">CARTONS</th><th class="nosort">VOLUME (CBM)</th><th class="nosort">WEIGHT (KG)</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    }
    c.innerHTML = '<div class="page-head"><h1>Shipment Schedule</h1></div><div class="tabs">' + D.LANE_TABS.map((t) => '<button class="tab ' + (t === laneTab ? 'on' : '') + '" data-lane="' + t + '">' + t + '</button>').join('') + '</div><div class="ws">' + body + '</div>';
    $$('[data-lane]', c).forEach((x) => x.addEventListener('click', () => { laneTab = x.dataset.lane; viewShipments(); }));
    lastMoved = '';
  }
  function viewModule(slug) {
    $('#content').innerHTML = '<div class="page-head"><h1>' + esc(TITLES[slug] || 'Module') + '</h1></div><div class="panel empty">This module isn’t part of the demo.<br><br><a class="btn primary" href="#/booking" style="text-decoration:none">Go to Booking</a></div>';
  }

  /* --------------------------------------------------------------- router */
  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || 'my-day').split('/');
    const seg = parts[0], arg = parts[1] ? decodeURIComponent(parts[1]) : '';
    setActive(seg, arg);
    $('#content').scrollTop = 0; window.scrollTo(0, 0);
    if (seg === 'booking' && arg) return viewWorkspace(arg);
    if (seg === 'booking' || seg === 'manage') {
      if (!company) { $('#content').innerHTML = ''; return askCompany(route, () => { location.hash = '#/my-day'; }); }
      return seg === 'booking' ? viewOverview() : viewManage();
    }
    if (seg === 'shipments') return viewShipments();
    if (seg === 'module') return viewModule(arg);
    return viewMyDay();
  }

  /* ----------------------------------------------------------------- init */
  function init() {
    buildSidebar();
    $('#btnReset').innerHTML = ico('rotate'); $('#btnLogout').innerHTML = ico('logout');
    $('#btnReset').addEventListener('click', () => modal({
      title: 'Reset demo data', body: '<p>This restores every booking to its original state (all confirmations, declines and edits are cleared).</p>',
      buttons: [{ label: 'Cancel' }, { label: 'Reset', cls: 'danger', onClick: () => { store.del('localStorage', KEY); store.del('localStorage', VIEWED_KEY); store.del('sessionStorage', CO_KEY); location.hash = '#/my-day'; location.reload(); } }],
    }));
    $('#btnLogout').addEventListener('click', () => { company = ''; store.del('sessionStorage', CO_KEY); toast('Signed out – company code cleared'); location.hash = '#/my-day'; route(); });
    const qs = $('#quickSearch');
    qs.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = qs.value.trim().toLowerCase(); if (!q) return;
      const hit = bookings.find((b) => b.id.toLowerCase() === q) || bookings.find((b) => b.id.toLowerCase().includes(q));
      if (hit) { location.hash = '#/booking/' + encodeURIComponent(hit.id); qs.value = ''; } else toast('No booking matches “' + qs.value + '”', 'bad');
    });
    $('#quickClear').addEventListener('click', () => { qs.value = ''; qs.focus(); });
    document.addEventListener('click', () => { const m = $('#menuList'); if (m) m.classList.remove('open'); });
    window.addEventListener('hashchange', route);
    route();
  }
  init();
})();
