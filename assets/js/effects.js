/* effects.js — CRT-/Terminal-Effekte für opensystems79.
   Lädt mit `defer` nach theme.js. Konzept & Roadmap: siehe EFFEKTE.md.

   Enthält: gemeinsame Helfer, Effekt 1 (Boot-Splash, Startseite) und
   Effekt 2 (CRT-Flackern, alle Seiten). Der 404-Glitch ist reines CSS,
   der Degauss beim Theme-Wechsel sitzt in theme.js. */
(function () {
  'use strict';

  /* ---- Gemeinsame Helfer ----
     Werkzeugkasten für Effekt 1 & 2. */

  /* Respektiert die Nutzer-Einstellung: Wer `prefers-reduced-motion: reduce`
     gesetzt hat, bekommt keine Bewegungseffekte. */
  function prefersReducedMotion() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* Würfel-Helfer: chance(0.2) ist in ~1 von 5 Fällen true. */
  function chance(probability) {
    return Math.random() < probability;
  }

  /* Zufällige Ganzzahl in [min, max] — beide Grenzen inklusive. */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ---- Effekt 1: Boot-Splash (Startseite) ----
     Läuft nur, wenn das Inline-Script im <head> `html.splash-active`
     gesetzt hat (Startseite, 1-zu-5-Wurf, Reduced-Motion dort bereits
     ausgeschlossen). Ablauf: Cursor blinkt -> Name wird getippt ->
     Cursor blinkt nach -> Overlay blendet weg -> Seite wird freigegeben.
     Abbruch jederzeit per Klick oder Tastendruck. */
  function initBootSplash() {
    var root = document.documentElement;
    if (!root.classList.contains('splash-active')) return;

    var splash = document.getElementById('boot-splash');
    if (!splash) { root.classList.remove('splash-active'); return; }

    var nameEl = splash.querySelector('[data-splash-target]');
    var cursorEl = splash.querySelector('.boot-splash-cursor');
    var target = (nameEl && nameEl.getAttribute('data-splash-target')) || '';

    var timers = [];
    var done = false;

    function later(fn, ms) {
      timers.push(window.setTimeout(fn, ms));
    }

    function reveal() {
      root.classList.remove('splash-active');
    }

    /* Abbruch bzw. regulärer Abschluss: Timer stoppen, Listener lösen,
       Overlay ausblenden und die Seite freigeben. */
    function finish() {
      if (done) return;
      done = true;
      for (var i = 0; i < timers.length; i++) window.clearTimeout(timers[i]);
      document.removeEventListener('keydown', finish);
      splash.removeEventListener('click', finish);
      splash.classList.add('is-leaving');
      splash.addEventListener('transitionend', reveal);
      later(reveal, 800);   /* Fallback, falls transitionend ausbleibt */
    }

    document.addEventListener('keydown', finish);
    splash.addEventListener('click', finish);

    /* Phase 2: Name Zeichen für Zeichen tippen, Cursor steht still. */
    function typeChar(i) {
      if (done) return;
      if (i >= target.length) {
        /* Phase 3: Cursor blinkt noch ein paar Mal, dann ausblenden. */
        if (cursorEl) cursorEl.classList.remove('is-steady');
        later(finish, 3000);
        return;
      }
      nameEl.textContent += target.charAt(i);
      later(function () { typeChar(i + 1); }, randomInt(105, 160));
    }

    /* Phase 1: Cursor blinkt kurz (CSS-Default), bevor das Tippen startet. */
    later(function () {
      if (cursorEl) cursorEl.classList.add('is-steady');
      typeChar(0);
    }, 850);
  }

  initBootSplash();

  /* ---- Effekt 2: CRT-Flackern (alle Seiten) ----
     Selten und überraschend: 1-zu-10-Wurf pro Seitenladen. Bei Treffer
     flackert `.crt-screen` nach einer zufälligen Verzögerung (4–25 s)
     kurz auf — wie ein Röhrenmonitor, der die Synchro verliert. */
  function initCrtGlitch() {
    if (prefersReducedMotion()) return;
    if (!chance(0.1)) return;

    var screen = document.querySelector('.crt-screen');
    if (!screen) return;

    window.setTimeout(function () {
      function onEnd(e) {
        if (e.animationName !== 'crt-glitch') return;
        screen.removeEventListener('animationend', onEnd);
        screen.classList.remove('crt-glitch');
      }
      screen.addEventListener('animationend', onEnd);
      screen.classList.add('crt-glitch');
    }, randomInt(4000, 25000));
  }

  initCrtGlitch();
})();
