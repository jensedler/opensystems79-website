/* effects.js — CRT-/Terminal-Effekte für opensystems79.
   Lädt mit `defer` nach theme.js. Konzept & Roadmap: siehe EFFEKTE.md.

   Phase 0 (dieser Stand): nur das Fundament — gemeinsame Helfer.
   Phase 1: Boot-Splash (Startseite).
   Phase 2: CRT-Flackern (alle Seiten).
   Beide Effekte werden unten in dieser IIFE registriert. */
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

  /* ---- Effekt-Registrierung ----
     Effekt 1 (Boot-Splash) und Effekt 2 (CRT-Flackern) folgen hier in
     Phase 1 bzw. 2 und greifen auf die Helfer oben zu. Bis dahin tut
     diese Datei bewusst nichts. */
})();
