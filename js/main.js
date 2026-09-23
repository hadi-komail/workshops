/* ==========================================================================
   Parti-Scouts — shared behaviour
   Language switching, mobile nav, active-link highlighting, scroll reveal.
   No build step: plain script included on every page after i18n.js.
   ========================================================================== */

(function () {
  "use strict";

  var DEFAULT_LANG = "de";

  function getStoredLang() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromUrl = params.get("lang");
      if (fromUrl && I18N[fromUrl]) return fromUrl;
      var fromStorage = window.localStorage.getItem("ps-lang");
      if (fromStorage && I18N[fromStorage]) return fromStorage;
    } catch (e) { /* storage may be unavailable in sandboxed previews */ }
    return DEFAULT_LANG;
  }

  function storeLang(code) {
    try { window.localStorage.setItem("ps-lang", code); } catch (e) { /* no-op */ }
  }

  function applyLanguage(code) {
    var dict = I18N[code] || I18N[DEFAULT_LANG];
    var meta = LANGUAGES.find(function (l) { return l.code === code; }) || LANGUAGES[0];

    document.documentElement.lang = code;
    document.documentElement.dir = meta.dir;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === code);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === code ? "true" : "false");
    });

    storeLang(code);
  }

  function initLangBar() {
    document.querySelectorAll(".lang-bar").forEach(function (bar) {
      LANGUAGES.forEach(function (lang) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lang-btn";
        btn.setAttribute("data-lang", lang.code);
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = lang.label;
        btn.addEventListener("click", function () { applyLanguage(lang.code); });
        bar.appendChild(btn);
      });
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    var nav = document.querySelector(".main-nav");
    if (!header) return;
    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      var navOpen = nav && nav.classList.contains("open");
      if (!navOpen) {
        if (y > lastY && y > 80) {
          header.classList.add("header-hidden");
        } else {
          header.classList.remove("header-hidden");
        }
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  function markActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a, .footer-nav a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLangBar();
    initMobileNav();
    initHeaderScroll();
    markActiveNav();
    initReveal();
    applyLanguage(getStoredLang());
  });
})();
