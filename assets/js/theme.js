/* Theme-Toggle — Light / Dark / System.
   Persistiert die Wahl in localStorage. */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var label = toggle ? toggle.querySelector('[data-theme-label]') : null;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var crtScreen = document.querySelector('.crt-screen');

  function currentMode() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    return stored || 'auto';
  }

  function applyTheme(mode) {
    if (mode === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
    try {
      if (mode === 'auto') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}
    updateLabel(mode);
  }

  function updateLabel(mode) {
    if (!label) return;
    var sym;
    if (mode === 'dark')      sym = 'dark';
    else if (mode === 'light') sym = 'light';
    else                       sym = 'auto';
    label.textContent = sym;
    if (toggle) toggle.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
  }

  function cycle() {
    var modes = ['auto', 'light', 'dark'];
    var idx = modes.indexOf(currentMode());
    var next = modes[(idx + 1) % modes.length];
    applyTheme(next);
    degauss();
  }

  /* Degauss: beim aktiven Umschalten den .crt-screen-Wrapper kurz wackeln
     lassen — wie ein CRT, der sich nach dem "Kanalwechsel" neu
     synchronisiert. Reduced-Motion wird respektiert. */
  function degauss() {
    if (!crtScreen) return;
    if (window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    crtScreen.classList.remove('theme-degauss');
    void crtScreen.offsetWidth;   /* Reflow erzwingen → Neustart bei schnellem Mehrfachklick */
    crtScreen.classList.add('theme-degauss');
  }

  if (toggle) {
    toggle.addEventListener('click', cycle);
    updateLabel(currentMode());
  }

  if (crtScreen) {
    crtScreen.addEventListener('animationend', function (e) {
      if (e.animationName === 'theme-degauss') {
        crtScreen.classList.remove('theme-degauss');
      }
    });
  }

  mq.addEventListener && mq.addEventListener('change', function () {
    if (currentMode() === 'auto') {
      root.removeAttribute('data-theme');
    }
  });
})();
