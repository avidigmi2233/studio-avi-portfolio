/* ==========================================================
   AVI.STUDIO — מנוע חוויה: רצפי תמונות (Image Sequence)
   כל וידאו פורק לפריימים ומנוגן על גבי Canvas
   ----------------------------------------------------------
   ניווט: 9 עמודים רציפים. שלוש המערכות הנעולות (1–3) מתקדמות
   בכפתורים עם וידאו קולנועי; שישה עמודי הגלילה (4–9) נפתחים
   אחרי השער. סרגל העמודים, התפריט והלוגו קופצים לכל עמוד באופן
   חופשי עם "מצמוץ" שחור קצר — בלי הילוך אחורי בווידאו.
   ----------------------------------------------------------
   שליחת הטופס: אם תמלאו כאן כתובת של שירות טפסים
   (Formspree / Getform / Web3Forms וכו') — הטופס ישלח אליה.
   אם נשאיר ריק — ייפתח מייל מוכן לשליחה במחשב של הגולש.
   ========================================================== */
(() => {
  'use strict';

  const FORM_ENDPOINT = '';                 // ← למשל: https://formspree.io/f/xxxxxxx
  const CONTACT_EMAIL = 'avidigmi14@gmail.com'; // ← כתובת המייל שאליה יגיעו הפניות

  const FPS = 24;
  const SMALL = window.innerWidth < 900;
  const DIR = SMALL ? 'assets/frames-sm' : 'assets/frames';
  const HERO = SMALL ? 'assets/img/hero-sm.webp' : 'assets/img/hero.webp';

  const canvas = document.getElementById('film');
  const ctx = canvas.getContext('2d', { alpha: false });
  const dimmer = document.getElementById('dimmer');
  const progressBar = document.getElementById('progressBar');
  const scrollCue = document.getElementById('scrollCue');
  const story = document.getElementById('story');
  const acts = [...document.querySelectorAll('.act')];
  const skipBtn = document.getElementById('skipBtn');

  const pagerEl    = document.getElementById('pager');
  const pagerNow   = document.getElementById('pagerNow');
  const pageBar    = document.getElementById('pageBar');
  const pbSegs     = [...pageBar.querySelectorAll('.pb-seg')];
  const sideLabel  = document.getElementById('sideLabel');
  const menu       = document.getElementById('menu');
  const menuBtn    = document.getElementById('menuBtn');
  const blinkEl    = document.getElementById('blink');
  const sitePages  = [...document.querySelectorAll('#story [data-page]')];   // 6 עמודי הגלילה (4–9)
  const TOTAL_PAGES = 9;

  let current = null, raf = null, unlocked = false, navEpoch = 0;
  const params = new URLSearchParams(location.search);
  const calmMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.get('calm') === '1';

  /* ---------- מונה העמודים ----------
     עמוד אחד, 1 עד 9, בלי טקסט לוואי ליד המספר: שלוש המערכות הנעולות
     ואחריהן שישה עמודי גלילה חופשית. סרגל תשעה פסים מעל המספר מציג
     את המיקום ומאפשר קפיצה ישירה לכל עמוד. */
  const pad = n => String(n).padStart(2, '0');
  let currentPage = 1, pagerTimer = null;

  function updatePagerUI(n) {
    pbSegs.forEach(b => b.classList.toggle('is-on', +b.dataset.goto === n));
    if (calmMode) {
      pagerNow.textContent = pad(n);
      sideLabel.textContent = `PAGE ${pad(n)} OF ${pad(TOTAL_PAGES)}`;
      return;
    }
    pagerEl.classList.add('swapping');
    clearTimeout(pagerTimer);
    pagerTimer = setTimeout(() => {
      pagerNow.textContent = pad(n);
      sideLabel.textContent = `PAGE ${pad(n)} OF ${pad(TOTAL_PAGES)}`;
      pagerEl.classList.remove('swapping');
    }, 180);
  }
  function setCurrentPage(n) {
    if (n === currentPage) return;
    currentPage = n;
    updatePagerUI(n);
  }
  updatePagerUI(1);   // מצב התחלתי — מדליק את הפס הראשון בסרגל מיד, בלי להמתין לאירוע

  /* ---------- קנבס ---------- */
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    if (current) paint(current);
  }
  function paint(img) {
    if (!img || !img.width) return;
    current = img;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.width, ch / img.height);
    const w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  /* ---------- טעינת רצף ---------- */
  class Sequence {
    constructor(id, count) { this.id = id; this.count = count; this.frames = new Array(count); this.loaded = 0; this.started = false; this._waiters = []; }
    get ready() { return this.loaded === this.count; }
    get pct() { return Math.round(this.loaded / this.count * 100); }
    load(onProgress) {
      if (this.started) { this._waiters.push(onProgress); return this.promise; }
      this.started = true; this._waiters.push(onProgress);
      let next = 0;
      this.promise = new Promise(resolve => {
        const step = () => {
          if (next >= this.count) return;
          const i = next++;
          const img = new Image();
          img.decoding = 'async';
          img.src = `${DIR}/${this.id}/${String(i).padStart(4, '0')}.webp`;
          const done = () => {
            this.frames[i] = img; this.loaded++;
            this._waiters.forEach(cb => cb && cb(this.pct));
            if (this.loaded === this.count) resolve(this); else step();
          };
          img.onload = done; img.onerror = done;
        };
        for (let k = 0; k < 6; k++) step();
      });
      return this.promise;
    }
    frame(i) { return this.frames[Math.max(0, Math.min(this.count - 1, i))]; }
  }

  const seq = {
    s2: new Sequence('s2', 121), s3: new Sequence('s3', 121),
    s4: new Sequence('s4', 121), s5: new Sequence('s5', 121),
    s6: new Sequence('s6', 97)
  };

  /* ---------- נגן ---------- */
  let active = null;   // ההשמעה הנוכחית — נשמרת כדי לחדש אותה אחרי מעבר בין לשוניות

  function tick(now) {
    if (!active) return;
    const { sequence, loop, onProgress, onEnd } = active;
    const dur = sequence.count / FPS * 1000;
    let t = now - active.start;
    active.elapsed = t;
    if (loop) t %= dur;
    const i = Math.floor(t / 1000 * FPS);
    if (!loop && i >= sequence.count - 1) {
      paint(sequence.frame(sequence.count - 1));
      onProgress && onProgress(1);
      active = null;
      onEnd && onEnd();
      return;
    }
    const f = sequence.frame(i);
    if (f) paint(f);
    onProgress && onProgress(Math.min(1, t / dur));
    raf = requestAnimationFrame(tick);
  }

  function play(sequence, { loop = false, onProgress, onEnd } = {}) {
    cancelAnimationFrame(raf);
    active = { sequence, loop, onProgress, onEnd, start: performance.now(), elapsed: 0 };
    const f0 = sequence.frame(0);
    if (f0) paint(f0);   // ציור מיידי של הפריים הראשון, כדי שלא יישאר ריק עד לתקתוק ה-rAF הבא
    raf = requestAnimationFrame(tick);
  }

  // לשונית שחוזרת לפוקוס — ממשיכים מאותה נקודה במקום לקפוץ קדימה
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); return; }
    if (!active) return;
    active.start = performance.now() - (active.elapsed || 0);
    raf = requestAnimationFrame(tick);
  });

  /* ---------- מערכות (Acts) ---------- */
  const hideActs = () => acts.forEach(a => a.classList.remove('act--on'));
  const showAct = n => {
    acts.forEach(a => a.classList.toggle('act--on', +a.dataset.act === n));
    setCurrentPage(n);
  };

  /* כפתורי המערכות נעולים ב-dataset.busy כדי למנוע לחיצה כפולה תוך כדי טעינה.
     בקפיצה אחורה חייבים לשחרר אותם, אחרת הם נשארים נעולים לצמיתות. */
  const ACT_BTN_IDS = ['btn1', 'btn2', 'btn3', 'btnGate'];
  function resetActButtons() {
    ACT_BTN_IDS.forEach(id => {
      const b = document.getElementById(id);
      if (!b) return;
      delete b.dataset.busy;
      b.classList.remove('loading');
      b.style.transform = '';
    });
  }

  function wireButton(btn, loadEl, sequence, onGo) {
    btn.addEventListener('click', () => {
      if (btn.dataset.busy) return;
      btn.dataset.busy = '1';
      const epoch = navEpoch;
      const go = () => { if (epoch !== navEpoch) return; onGo(); };
      if (sequence.ready) { go(); return; }
      btn.classList.add('loading');
      loadEl.textContent = `טוען ${sequence.pct}%`;
      sequence.load(p => { loadEl.textContent = `טוען ${p}%`; })
        .then(() => { btn.classList.remove('loading'); go(); });
    });
  }
  const stageProgress = p => { if (!unlocked) progressBar.style.width = (p * 100) + '%'; };

  /* ---------- מערכה 1 ---------- */
  const btn1 = document.getElementById('btn1');
  const load1 = document.getElementById('load1');
  const hero = new Image();
  hero.onload = () => { if (currentPage === 1 && !active) paint(hero); };
  hero.src = HERO;

  const READY_AT = 45;   // אחוז טעינה שממנו אפשר כבר לצאת לדרך — השאר נטען ברקע
  let opened = false;
  const openGate = () => {
    if (opened) return;
    opened = true;
    btn1.disabled = false;
    btn1.classList.remove('loading');
    if (currentPage === 1 && !active) paint(seq.s2.frame(0));
  };

  btn1.classList.add('loading');
  load1.textContent = 'טוען 0%';
  seq.s2.load(p => {
    load1.textContent = `טוען ${p}%`;
    if (p >= READY_AT) openGate();
  }).then(openGate);

  btn1.addEventListener('click', () => {
    if (btn1.disabled || btn1.dataset.busy) return;
    btn1.dataset.busy = '1';
    const epoch = navEpoch;
    hideActs(); seq.s3.load();
    play(seq.s2, { onProgress: stageProgress, onEnd: () => { if (epoch !== navEpoch) return; showAct(2); } });
  });

  /* ---------- מערכות 2–3 ---------- */
  wireButton(document.getElementById('btn2'), document.getElementById('load2'), seq.s3, () => {
    hideActs(); seq.s4.load();
    const epoch = navEpoch;
    play(seq.s3, { onProgress: stageProgress, onEnd: () => { if (epoch !== navEpoch) return; showAct(3); } });
  });
  wireButton(document.getElementById('btn3'), document.getElementById('load3'), seq.s4, () => {
    hideActs(); seq.s5.load();
    const epoch = navEpoch;
    play(seq.s4, { onProgress: stageProgress, onEnd: () => { if (epoch !== navEpoch) return; openProjectsGate(); } });
  });

  /* ---------- רקע חי: לופ קבוע אחרי הפתיח (סרטון 6) ---------- */
  let bgKey = null, atContact = false;
  function ensureLoop6() {
    const start = () => {
      bgKey = 's6';
      if (!active || active.sequence !== seq.s6) play(seq.s6, { loop: true });
      applyDim();
    };
    if (seq.s6.ready) start(); else seq.s6.load().then(start);
  }

  /* ---------- שער הפרויקטים ----------
     סרטון 4 נעצר על האולם עם שלושת הכנים; מעליו נחשפים שלושת הפרויקטים
     וכפתור שממשיך אל הנפילה (סרטון 5) ומשם אל שאר הדף. */
  function openProjectsGate() {
    document.body.classList.remove('is-locked');
    document.body.classList.add('gate');
    story.classList.add('on');
    story.setAttribute('aria-hidden', 'false');
    skipBtn.classList.add('gone');
    dimmer.style.opacity = 0.3;
    revealIn(document.querySelectorAll('#projects .rv'));
    setCurrentPage(4);
    seq.s6.load();                       // הלופ שאחרי הנפילה — מתחיל להיטען כבר עכשיו
  }

  wireButton(document.getElementById('btnGate'), document.getElementById('loadGate'), seq.s5, () => {
    document.body.classList.remove('gate');
    story.classList.remove('on');
    story.setAttribute('aria-hidden', 'true');
    dimmer.style.opacity = 0;
    const epoch = navEpoch;
    play(seq.s5, { onProgress: stageProgress, onEnd: () => { if (epoch !== navEpoch) return; afterFall(); } });
  });

  /* הפריים האחרון של 5 זהה לראשון של 6 — נכנסים ללופ בלי fade, אחרת נוצר הבזק */
  function afterFall() {
    bgKey = 's6';
    if (seq.s6.ready) play(seq.s6, { loop: true }); else seq.s6.load().then(() => play(seq.s6, { loop: true }));
    unlock();
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-open');
    story.classList.add('on');
    story.setAttribute('aria-hidden', 'false');
    skipBtn.classList.add('gone');
    scrollCue.classList.add('on');
    onScroll(); revealObserver(); contactObserver();
  }

  skipBtn.addEventListener('click', () => jumpTo(4));

  /* ---------- גלילה ---------- */
  function applyDim() {
    const y = window.scrollY;
    let base = Math.min(0.84, y / (window.innerHeight * 0.75) * 0.84);
    if (calmMode) base = Math.max(base, 0.58);   // בלי תנועה — רקע שקט וקריא מהרגע הראשון
    dimmer.style.opacity = atContact ? Math.min(base, 0.55) : base;
  }
  function onScroll() {
    if (!unlocked) return;
    syncPageFromScroll();
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    document.body.classList.toggle('scrolled', y > 40);
    applyDim();
    if (y > 60) scrollCue.classList.remove('on');
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  scrollCue.addEventListener('click', () => {
    window.scrollTo({ top: window.scrollY + window.innerHeight * 0.9, behavior: 'smooth' });
  });

  const revealIn = els => els.forEach(el => el.classList.add('in'));

  // רשת ביטחון: כל מה שכבר נמצא במסך נחשף מיד, בלי להמתין לאירוע גלילה — משמש גם בקפיצות
  function revealInView() {
    document.querySelectorAll('.rv:not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.classList.add('in');
    });
  }

  function revealObserver() {
    const io = new IntersectionObserver(en => {
      en.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
    requestAnimationFrame(revealInView);
  }

  /* ---------- החלפת רקע בכניסה לסקשן הטופס ---------- */
  function contactObserver() {
    const contact = document.getElementById('contact');
    if (!contact) return;
    new IntersectionObserver(en => {
      en.forEach(e => { if (e.isIntersecting) seq.s6.load(); });
    }, { rootMargin: '120% 0px' }).observe(contact);

    // סרטון 6 הוא כבר הרקע הקבוע — כאן רק מרככים את העמעום כדי שהמערבולת תישאר גלויה
    new IntersectionObserver(en => {
      en.forEach(e => { atContact = e.isIntersecting; applyDim(); });
    }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 }).observe(contact);
  }

  /* ---------- מונה העמודים בגלילה ----------
     "העמוד הנוכחי" = הסקשן שחוצה את אמצע המסך. אם אמצע המסך נופל בין
     שני סקשנים ממוספרים (למשל פס המספרים), נבחר הסקשן הקרוב ביותר —
     כך המונה תמיד מצביע על יעד אמיתי מהתפריט ולעולם לא נשאר על ערך שגוי. */
  function syncPageFromScroll() {
    if (!sitePages.length) return;
    const mid = window.innerHeight / 2;
    let best = null, bestDist = Infinity;

    for (const el of sitePages) {
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) { best = el; break; }
      const d = r.top > mid ? r.top - mid : mid - r.bottom;
      if (d < bestDist) { bestDist = d; best = el; }
    }
    if (best) setCurrentPage(+best.dataset.page);
  }

  /* ==========================================================
     ניווט מאוחד — 9 עמודים, קפיצה חופשית עם מצמוץ
     כפתורי המערכות (בעמודים 1–4) מפעילים את הווידאו הקולנועי כרגיל.
     סרגל העמודים, התפריט, הפוטר והלוגו תמיד קופצים ישר לעמוד עם
     הבהוב שחור קצר — בלי הילוך אחורי בווידאו.
     ========================================================== */
  function actStaticFrame(n) {
    if (n === 1) return hero.width ? hero : null;
    const s = n === 2 ? seq.s2 : seq.s3;
    return s.ready ? s.frame(s.count - 1) : null;
  }

  function showActInstant(n) {
    acts.forEach(a => a.classList.toggle('act--on', +a.dataset.act === n));
    const frame = actStaticFrame(n);
    if (frame) { paint(frame); return; }
    const s = n === 2 ? seq.s2 : seq.s3;
    s.load().then(() => { if (currentPage === n) paint(s.frame(s.count - 1)); });
  }

  function doBlink(mid) {
    blinkEl.classList.remove('off'); blinkEl.classList.add('on');
    setTimeout(() => {
      mid();
      // setTimeout ולא rAF: אם הלשונית עוברת לרקע בדיוק כאן, rAF לא היה נורה בכלל
      // עד שהיא חוזרת לפוקוס, והמצמוץ היה נשאר תקוע שחור. setTimeout תמיד יורה.
      setTimeout(() => { blinkEl.classList.remove('on'); blinkEl.classList.add('off'); }, 16);
    }, 150);
  }

  function closeMenuInstant() {
    if (!menuOpen()) return;
    const prev = menu.style.transition;
    menu.style.transition = 'none';
    setMenu(false);
    void menu.offsetHeight;   // כפיית reflow כדי שהביטול-הרגעי של המעבר ייקלט לפני שמחזירים אותו
    requestAnimationFrame(() => { menu.style.transition = prev; });
  }

  function jumpTo(n) {
    n = Math.max(1, Math.min(TOTAL_PAGES, n));
    if (n === currentPage && !menuOpen()) return;
    navEpoch++;
    cancelAnimationFrame(raf); active = null;

    doBlink(() => {
      closeMenuInstant();
      resetActButtons();   // בלי זה הכפתורים בעמודים 1–3 לא מגיבים אחרי חזרה אחורה

      if (n <= 3) {
        unlocked = false;
        document.body.classList.add('is-locked');
        document.body.classList.remove('is-open', 'gate', 'scrolled');
        story.classList.remove('on'); story.setAttribute('aria-hidden', 'true');
        dimmer.style.opacity = 0;
        scrollCue.classList.remove('on');
        showActInstant(n);
      } else {
        hideActs();
        document.body.classList.remove('is-locked', 'gate');
        document.body.classList.add('is-open');
        story.classList.add('on'); story.setAttribute('aria-hidden', 'false');
        skipBtn.classList.add('gone');
        unlocked = true;
        ensureLoop6();
        const target = sitePages.find(p => +p.dataset.page === n);
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 96, behavior: 'auto' });
        revealInView();
      }
      setCurrentPage(n);
      onScroll();
    });
  }

  /* ---------- תפריט העמודים ---------- */
  const menuOpen = () => document.body.classList.contains('menu-open');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { menu.removeAttribute('inert'); menu.querySelector('a')?.focus({ preventScroll: true }); }
    else { menu.setAttribute('inert', ''); }
  }

  menuBtn.addEventListener('click', () => setMenu(!menuOpen()));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen()) { setMenu(false); menuBtn.focus(); }
  });

  pbSegs.forEach(b => b.addEventListener('click', () => jumpTo(+b.dataset.goto)));

  /* קישורי עוגן: תפריט, פוטר, לוגו — כל קישור לעמוד ממוספר קופץ עם מצמוץ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#top') { e.preventDefault(); jumpTo(1); return; }
      const target = document.querySelector(id);
      const n = target && +target.dataset.page;
      if (n) { e.preventDefault(); jumpTo(n); return; }
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
    });
  });

  /* ---------- התחלה מחדש ---------- */
  document.getElementById('againBtn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navEpoch++;
      cancelAnimationFrame(raf); active = null;
      unlocked = false; bgKey = null;
      document.body.classList.add('is-locked');
      document.body.classList.remove('is-open', 'scrolled', 'gate');
      story.classList.remove('on'); story.setAttribute('aria-hidden', 'true');
      skipBtn.classList.remove('gone');
      dimmer.style.opacity = 0; progressBar.style.width = '0%';
      ['btn1', 'btn2', 'btn3', 'btnGate'].forEach(id => delete document.getElementById(id).dataset.busy);
      document.querySelectorAll('.rv').forEach(el => el.classList.remove('in'));
      paint(seq.s2.frame(0)); showAct(1);
    }, 600);
  });

  /* ==========================================================
     טופס השארת פרטים
     ========================================================== */
  const form = document.getElementById('leadForm');
  const formCard = document.getElementById('formCard');
  const okCard = document.getElementById('formOk');

  const err = (field, msg) => {
    const box = form.querySelector(`[data-for="${field}"]`);
    if (box) box.textContent = msg || '';
    const input = form.elements[field];
    if (input) input.classList.toggle('invalid', !!msg);
    return !msg;
  };

  function validate(d) {
    let ok = true;
    ok = err('name', d.name.trim().length < 2 ? 'איך קוראים לכם?' : '') && ok;
    ok = err('phone', /^[0-9+\-\s()]{9,15}$/.test(d.phone.trim()) ? '' : 'מספר טלפון לא תקין') && ok;
    ok = err('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()) ? '' : 'כתובת אימייל לא תקינה') && ok;
    ok = err('type', d.type ? '' : 'בחרו סוג פרויקט') && ok;
    return ok;
  }

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    if (!validate(d)) {
      form.querySelector('.invalid')?.focus();
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.classList.add('loading');

    const body =
      `שם: ${d.name}\nטלפון: ${d.phone}\nאימייל: ${d.email}\n` +
      `סוג פרויקט: ${d.type}\nתקציב: ${d.budget || 'לא צוין'}\n\n${d.message || ''}`;

    try {
      if (FORM_ENDPOINT) {
        await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        });
      } else {
        window.location.href =
          `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('פנייה חדשה מהאתר · ' + d.name)}&body=${encodeURIComponent(body)}`;
      }
    } catch (e) { /* גם אם השליחה נכשלה — הפרטים נשמרים מקומית */ }

    try { localStorage.setItem('avi_lead', JSON.stringify({ ...d, at: Date.now() })); } catch (e) {}

    btn.classList.remove('loading');
    document.getElementById('okName').textContent = d.name.trim().split(' ')[0];
    formCard.classList.add('sent');
    okCard.classList.add('on');
  });

  /* ---------- נגישות: העדפת תנועה מופחתת — ישר לאתר, בלי לופ ---------- */
  if (calmMode) {
    document.body.classList.add('calm');
    hideActs();
    setCurrentPage(4);
    seq.s6.load().then(() => { cancelAnimationFrame(raf); active = null; paint(seq.s6.frame(0)); });
    bgKey = 's6';
    unlock();
  }

  /* ---------- כניסה ישירה לאתר: index.html?site=1 ---------- */
  if (params.get('site') === '1') {
    hideActs();
    setCurrentPage(4);
    ensureLoop6();
    unlock();
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) requestAnimationFrame(() => { target.scrollIntoView(); onScroll(); });
    }
  }

  /* ---------- כפתורים מגנטיים (עכבר בלבד) ---------- */
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.16;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = `translate(${x}px, ${y - 3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
