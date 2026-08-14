/* ==========================================================================
   Olga Sherer — Psychotherapy
   Language switch (he/ru + rtl/ltr), mobile nav, WhatsApp text localisation
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'os-lang';
  var WA_NUMBER = '972543675633';

  var META = {
    he: {
      dir: 'rtl',
      title: 'אולגה שרר | פסיכותרפיה – זמן ומקום לעצמך',
      description: 'אולגה שרר, פסיכותרפיסטית בגישה אקזיסטנציאליסטית. טיפול פסיכולוגי במבוגרים וצעירים – זמן ומקום לעצמך. שיחת היכרות ללא עלות. 054-3675633',
      ogLocale: 'he_IL',
      navLabel: 'תפריט',
      // "שלום אולגה, אשמח לקבל פרטים על טיפול"
      wa: '%D7%A9%D7%9C%D7%95%D7%9D%20%D7%90%D7%95%D7%9C%D7%92%D7%94%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A7%D7%91%D7%9C%20%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20%D7%98%D7%99%D7%A4%D7%95%D7%9C'
    },
    ru: {
      dir: 'ltr',
      title: 'Ольга Шерер | Психотерапия – время и место для себя',
      description: 'Ольга Шерер — психотерапевт, экзистенциальный подход. Психологическая терапия для взрослых и молодых людей. Ознакомительная беседа бесплатно. 054-3675633',
      ogLocale: 'ru_RU',
      navLabel: 'Меню',
      // "Здравствуйте, Ольга! Хочу узнать подробнее о терапии"
      wa: '%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D0%9E%D0%BB%D1%8C%D0%B3%D0%B0%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C%20%D0%BF%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5%20%D0%BE%20%D1%82%D0%B5%D1%80%D0%B0%D0%BF%D0%B8%D0%B8'
    }
  };

  var html = document.documentElement;
  var navEl = document.getElementById('site-nav');
  var toggle = document.querySelector('.nav-toggle');

  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function applyLang(lang) {
    var cfg = META[lang] || META.he;

    html.setAttribute('lang', lang);
    html.setAttribute('dir', cfg.dir);
    document.title = cfg.title;

    setMeta('meta[name="description"]', 'content', cfg.description);
    setMeta('meta[property="og:title"]', 'content', cfg.title);
    setMeta('meta[property="og:description"]', 'content', cfg.description);
    setMeta('meta[property="og:locale"]', 'content', cfg.ogLocale);
    setMeta('meta[name="twitter:title"]', 'content', cfg.title);
    setMeta('meta[name="twitter:description"]', 'content', cfg.description);

    // WhatsApp greeting in the visitor's language
    var waHref = 'https://wa.me/' + WA_NUMBER + '?text=' + cfg.wa;
    Array.prototype.forEach.call(document.querySelectorAll('[data-wa]'), function (a) {
      a.setAttribute('href', waHref);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-set-lang]'), function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-lang') === lang));
    });

    if (toggle) toggle.setAttribute('aria-label', cfg.navLabel);
  }

  function closeNav() {
    if (!navEl || !toggle) return;
    navEl.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  /* ---------- initial language ------------------------------------------- */
  /* The inline head script already resolved it before first paint; trust that
     so we never re-flow the page. The chain below is only a fallback. */
  function detectLang() {
    if (html.hasAttribute('data-lang-resolved')) {
      var resolved = html.getAttribute('lang');
      if (META[resolved]) return resolved;
    }

    var q = new URLSearchParams(window.location.search).get('lang');
    if (META[q]) return q;

    var hash = window.location.hash.replace('#', '');
    if (META[hash]) return hash;

    var saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
    if (META[saved]) return saved;

    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('ru') === 0 || nav.indexOf('uk') === 0) return 'ru';
    return 'he';
  }

  applyLang(detectLang());

  /* ---------- keep the address bar in sync -------------------------------- */
  /* So the visitor can just copy the URL and whoever opens it lands on the
     same language. replaceState, not pushState: Back should leave the site
     rather than undo a toggle. Called only on an explicit switch — a URL
     without ?lang= keeps auto-detection working for the recipient. */
  function syncUrl(lang) {
    if (!window.history || !history.replaceState) return;
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      // the legacy #he/#ru form would now contradict ?lang=, so drop it —
      // but never touch a section anchor like #about
      if (META[url.hash.replace('#', '')]) url.hash = '';
      history.replaceState(history.state, '', url.toString());
    } catch (e) {
      /* file:// origins reject replaceState — harmless, language still switches */
    }
  }

  /* ---------- language buttons ------------------------------------------- */
  function setLang(lang) {
    applyLang(lang);
    syncUrl(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
    closeNav();
  }

  /* desktop: two-button pill */
  Array.prototype.forEach.call(document.querySelectorAll('[data-set-lang]'), function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-set-lang'));
    });
  });

  /* mobile: single toggle in the header — flips to the other language */
  Array.prototype.forEach.call(document.querySelectorAll('[data-toggle-lang]'), function (btn) {
    btn.addEventListener('click', function () {
      setLang(html.getAttribute('lang') === 'ru' ? 'he' : 'ru');
    });
  });

  /* ---------- mobile navigation ------------------------------------------ */
  if (toggle && navEl) {
    toggle.addEventListener('click', function () {
      var open = navEl.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    navEl.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 780) closeNav();
    });
  }

  /* ---------- current year in the footer --------------------------------- */
  var year = String(new Date().getFullYear());
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = year;
  });
})();
