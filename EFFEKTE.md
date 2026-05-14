# EFFEKTE.md — Konzept & To-Do für die CRT-/Terminal-Effekte

Planungsdokument für die „delightful" Effekte auf opensystems79.de.
**Kein** Teil des Deployments (in `_config.yml` unter `exclude`).
Stand: 2026-05-14 — alle 4 Effekte umgesetzt und abgenommen (Boot-Splash,
CRT-Flackern, 404-Glitch, Degauss). Phase 3 (Politur & QA) im Code
abgeschlossen; es bleiben die Browser-Checks (Light/Dark, Mobile,
reduced-motion) für Jens. Detaillierter Fortschritt: siehe To-Do unten.

## Ziel & Haltung

Die Seite soll sich gelegentlich wie ein echter Röhrenmonitor-Terminal
verhalten: kleine Überraschungen, die selten genug kommen, um zu erfreuen,
statt zu nerven. Spielerisch, aber nie im Weg.

## Grundprinzipien (gelten für alle Effekte)

- **`prefers-reduced-motion`**: Wer das gesetzt hat, bekommt **keine**
  Bewegungseffekte. Splash wird übersprungen, Flackern wird übersprungen.
  (Präzedenzfall: `.cursor` in `main.scss` macht das schon.)
- **Kein Build-Tooling, kein CDN, keine Dependency.** Reines CSS + Vanilla-JS,
  so wie der Rest des Projekts.
- **FOUC-frei.** Was vor dem ersten Paint sichtbar sein muss (Splash-Overlay),
  wird über ein Inline-Script im `<head>` entschieden — analog zum
  Theme-Pre-Hydration-Script in `_includes/head.html`.
- **Fail-safe.** Wenn JS fehlschlägt oder deaktiviert ist, sieht der Besucher
  einfach die normale Seite. Kein Effekt darf die Seite „verschlucken".
- **Performance.** Animationen nur über `transform`, `opacity`, `filter` —
  nichts, was Layout-Reflow auslöst.
- **Barrierefreiheit.** Overlays sind `aria-hidden`, per Tastendruck/Klick
  abbrechbar, fangen keinen Fokus ein.

## Architektur

| Baustein | Ort | Zweck |
|---|---|---|
| Inline-Splash-Entscheider | `_includes/head.html` (nur wenn `page.url == "/"`) | Würfelt vor dem Paint, ob der Splash kommt; setzt ggf. `html.splash-active` |
| Splash-Markup | `_layouts/default.html` (erstes Body-Kind, nur auf `/`) | Statisches `<div id="boot-splash" hidden>` — wird per CSS sichtbar, wenn `html.splash-active`. Bewusst als erstes Body-Kind statt in `index.html`, damit es vor dem Seiteninhalt paintet (FOUC-frei). |
| `assets/js/effects.js` | neu, `defer` geladen in `_layouts/default.html` | Tipp-Animation des Splash + CRT-Flacker-Logik |
| Effekt-CSS | `assets/css/main.scss` | Overlay-, Cursor-, Glitch-Keyframes |

**Konventions-Entscheidung:** Das Projekt hatte bisher „genau eine JS-Datei"
(`theme.js`). Die Effekte kommen bewusst in eine **zweite** Datei
(`effects.js`), damit die Theme-Logik schlank bleibt. `CLAUDE.md` muss bei
der Umsetzung entsprechend aktualisiert werden (neue Datei + Inline-Script
dokumentieren).

---

## Effekt 1 — Boot-Splash (Startseite)

**Idee:** Gelegentlich erscheint beim Aufruf der Startseite zuerst ein
leerer Bildschirm in Hintergrundfarbe. Mittig blinkt der Cursor, dann wird
`opensystems79` Zeichen für Zeichen getippt, der Cursor blinkt noch ein paar
Mal — danach blendet das Overlay weg und gibt die echte Seite frei.

**Entschiedene Parameter:**

- **Scope:** Nur die Startseite (`/`). Posts/About sind nie betroffen.
- **Häufigkeit:** Zufällige 1-zu-5-Chance pro Startseiten-Aufruf — **aber**
  sobald der Splash in einer Browser-Session einmal lief, kommt er in dieser
  Session nicht wieder (`sessionStorage`-Flag `os79:splash`).
- **Technik:** Overlay über der echten Seite, kein zweiter HTTP-Request,
  keine `/splash/`-Seite. Entscheidung fällt FOUC-frei im `<head>`.

**Ablauf:**

1. Inline-Script im `<head>` (nur auf `/`): `prefers-reduced-motion`? →
   nichts tun. Sonst: `sessionStorage`-Flag gesetzt? → nichts tun. Sonst:
   `Math.random() < 0.2`? → Flag setzen, `html.splash-active` setzen.
2. CSS zeigt sofort das Vollflächen-Overlay in `--bg`, deckt `.wrap` ab.
3. `effects.js` sieht `html.splash-active`, startet: Cursor blinkt ~600 ms,
   dann Tippen (~70–110 ms/Zeichen, leicht variabel), dann Cursor blinkt
   noch ~3–4×.
4. Overlay blendet per `opacity`-Transition aus (~400 ms),
   `html.splash-active` wird entfernt.
5. **Abbruch jederzeit:** Klick / beliebige Taste / `Esc` → sofort ausblenden.
6. **Safety-Timeout:** Falls `effects.js` nicht lädt, blendet das Overlay
   nach spätestens ~4 s per reiner CSS-Animation von selbst weg.

**Optik:** Mono-Schrift, Größe ~ Site-Titel oder etwas größer, `~/`-Prompt in
`--accent` davor (konsistent mit dem Header). Cursor wiederverwendet den
vorhandenen `.cursor`-Look inkl. CRT-Glow.

---

## Effekt 2 — CRT-Flackern (alle Seiten)

**Idee:** Selten, mitten im Lesen, „flackert" der Bildschirm kurz — ein
kleines Wackeln/Zucken wie bei einem Röhrenmonitor, der kurz die Synchro
verliert. Kommt nicht sofort beim Laden, sondern nach einer zufälligen
Verzögerung „einfach so" rein.

**Geplante Parameter:**

- **Scope:** Alle Seiten (Startseite, Posts, Pages).
- **Häufigkeit:** 1-zu-10-Chance pro Seitenladen.
- **Verzögerung:** Bei Treffer zufällig **4–25 s** nach `DOMContentLoaded`,
  dann der Effekt.
- **Dauer:** Kurz, ~0,6–1,2 s. Optional 1× wiederholt nach kurzer Pause.
- `prefers-reduced-motion` → kompletter Skip.

**Ablauf:**

1. `effects.js` würfelt bei `DOMContentLoaded`.
2. Bei Treffer: `setTimeout` mit zufälligem Delay.
3. Danach Klasse `crt-glitch` auf den `.crt-screen`-Wrapper (umschließt
   `.wrap`, transparent — so zeigt der Jitter keine Randlücke).
4. CSS-Keyframe-Animation (`@keyframes crt-glitch`, 0,85 s, zwei Schübe),
   kombiniert aus:
   - horizontalem Jitter (`translateX`, bis ±6 px),
   - vertikalem Stauchen (`scaleY`, ±3 %) und Verkanten (`skewX`),
   - kräftigem Helligkeits-/Kontrast-Puls (`filter`),
   - chromatischer Aberration (`text-shadow`, rot/cyan-Versatz).
5. Nach `animationend` Klasse wieder entfernen.

**Umgesetzt:** Erste Werte waren bewusst sehr dezent — auf Jens' Wunsch
dann deutlich verstärkt, damit das Flackern klar als Absicht durchgeht
und nicht wie ein Rendering-Bug wirkt. Immer noch kurz (0,85 s).

---

## Weitere Ideen (Backlog)

| Idee | Beschreibung | Aufwand / Risiko | Status |
|---|---|---|---|
| **404-Glitch** | Der ganze Inhaltsbereich der terminal-gestylten 404-Seite (`.error-page`, ohne Header) glitcht alle paar Sekunden kurz auf. | klein / niedrig | ✅ umgesetzt |
| **Degauss beim Theme-Wechsel** | Beim Umschalten Light/Dark ein kurzes Wackeln + Helligkeitsblitz, wie „Kanal umschalten". Klinkt sich direkt in `theme.js` ein. | klein / niedrig | ✅ umgesetzt |
| **Scanline-/Vignette-Layer** | Sehr dezente, dauerhafte Scanlines + Vignette als Overlay (evtl. nur Dark-Mode, evtl. per Toggle). | klein / mittel — kann schnell „zu viel" wirken | offen |
| **Title-Decode** | Post-Titel „entschlüsseln" sich beim Laden aus Zufallsglyphen zum echten Text (Matrix-Style), einmalig, schnell. | mittel / niedrig | offen |
| **CRT-Power-off** | Beim Verlassen/Klick auf externe Links die klassische „Zusammenfall-zu-Punkt"-Animation. | mittel / hoch — kann Navigation träge wirken lassen | offen |
| **Idle-Screensaver** | Nach X Minuten ohne Aktivität ein hüpfendes `~/`-Logo oder Sternenfeld. | mittel / niedrig | offen |
| **Konami-Code-Easteregg** | Geheime Tastenfolge schaltet „Phosphor-Grün-Modus" oder Matrix-Regen frei. | mittel / niedrig | offen |

---

## To-Do-Liste

Abzuarbeiten von oben nach unten. Phase 0 ist Voraussetzung für 1 & 2.

### Phase 0 — Fundament ✅

- [x] `assets/js/effects.js` anlegen, in `_layouts/default.html` mit `defer`
      einbinden (nach `theme.js`)
- [x] Gemeinsame Helfer in `effects.js`: `prefersReducedMotion()`-Check,
      Würfel-Helfer
- [x] CSS-Abschnitt „Effekte" in `main.scss` vorbereiten (Kommentar-Block,
      Struktur)
- [x] `CLAUDE.md` aktualisieren: zweite JS-Datei + Inline-Splash-Script
      dokumentieren (JS-Konvention war vorher „genau eine Datei")

### Phase 1 — Boot-Splash ✅

- [x] Inline-Entscheider-Script in `_includes/head.html`, nur für
      `page.url == "/"`: reduced-motion- & `sessionStorage`-Check, 1-zu-5-Wurf,
      `html.splash-active` + Flag `os79:splash` setzen
- [x] Splash-Markup `<div id="boot-splash" hidden>` als erstes Body-Kind in
      `_layouts/default.html` (nur auf `/`; Prompt `~/`, Ziel-Name, Cursor-Span)
- [x] CSS: Overlay-Layout (fixed, vollflächig, opakes `--bg`), sichtbar bei
      `html.splash-active` — deckt den Seiteninhalt durch volle Deckkraft ab
      (kein separates `.wrap`-Verstecken nötig)
- [x] CSS: zentrierte Tipp-Zeile, Cursor-Look (CRT-Glow wie `.cursor`,
      blinkt per Default, `.is-steady` pausiert beim Tippen)
- [x] CSS: Ausblend-Transition (`.is-leaving`) + CSS-Failsafe-Auto-Fade nach
      7 s, falls `effects.js` nicht lädt
- [x] `effects.js`: Tipp-Animation (Cursor-Blink → tippen → Blink →
      ausblenden → `splash-active` entfernen)
- [x] `effects.js`: Abbruch per Klick / Taste
- [x] Test im Browser: Animation, Tempo, Abbruch, beide Themes — von Jens
      abgenommen (Tempo auf seinen Wunsch entschleunigt)

### Phase 2 — CRT-Flackern ✅

- [x] Entscheidung: neuer transparenter `.crt-screen`-Wrapper um `.wrap` in
      `_layouts/default.html` — transparent, damit der Jitter keine Randlücke
      zeigt
- [x] CSS: `@keyframes crt-glitch` (zwei Zuck-Schübe: Jitter, scaleY-Stauchen,
      Helligkeits-/Kontrastpuls, chromatische Aberration via `text-shadow`),
      Klasse `.crt-screen.crt-glitch`, `@media`-Guard für reduced-motion
- [x] `effects.js`: `initCrtGlitch()` — reduced-motion-Skip, 1-zu-10-Wurf,
      `setTimeout` mit Zufalls-Delay 4–25 s, Klasse setzen, nach
      `animationend` entfernen
- [x] reduced-motion-Skip doppelt abgesichert (JS-Gate + CSS-`@media`)
- [x] Test im Browser: von Jens abgenommen — Flacker-Stärke auf seinen
      Wunsch deutlich verstärkt (größerer Jitter, kräftigerer Helligkeits-
      puls, neu: `skewX`-Verkanten), damit es klar als Absicht durchgeht

### Effekt 3 — 404-Glitch ✅

- [x] `[ERROR]`-Text in `404.html` in `span.glitch-text` mit `data-text` packen
- [x] CSS (`main.scss`): `.glitch-text`-Bänder via `::before`/`::after`
      (clip-path, `translateX`, rot/cyan), `@media`-Guard
- [x] Auf Jens' Rückmeldung: Glitch betrifft jetzt den **ganzen
      Inhaltsbereich** (`.error-page`, ohne Header) — Block-Ruckeln +
      chromatischer Versatz + Helligkeitspuls, synchron (gleiche 4,2-s-
      Periode) zu den Bändern der `[ERROR]`-Zeile
- [x] `jekyll build --trace` sauber, Glitch-Markup im `_site/404.html`
- [ ] Test im Browser: von Jens abzunehmen

### Effekt 4 — Degauss beim Theme-Wechsel ✅

- [x] `theme.js`: beim Toggle-Klick `degauss()` — setzt `.theme-degauss`
      auf `.crt-screen` (mit Reflow-Neustart bei schnellem Mehrfachklick),
      reduced-motion-Skip, entfernt die Klasse nach `animationend`
- [x] CSS (`main.scss`): `@keyframes theme-degauss` — gedämpfte Schwingung
      (scale/skewX-Wackeln + Helligkeitspuls + Hauch chromatischer Versatz),
      `@media`-Guard für reduced-motion
- [x] Rebuild sauber (LiveReload-Server)
- [ ] Test im Browser: von Jens abzunehmen

### Phase 3 — Politur & QA

Im Code erledigt:

- [x] `bundle exec jekyll build --trace` ohne Errors/Warnings
- [x] Deployment-Hygiene: `effects.js` wird ausgeliefert, `EFFEKTE.md` ist
      `exclude`d, keine `[TEMP-TEST]`-Reste, alle 4 Effekte im `_site`
      verdrahtet
- [x] reduced-motion bei allen 4 Effekten abgesichert: Splash (JS-Gate im
      `<head>`), CRT-Flackern (JS-Gate + CSS-`@media`), 404-Glitch
      (CSS-`@media`), Degauss (JS-Gate + CSS-`@media`)
- [x] Theme-Tauglichkeit im Code geprüft: Splash nutzt Theme-Variablen;
      Glitch-/Degauss-Effekte feste rot/cyan-Werte (bewusst — wirken auf
      beiden Hintergründen)
- [x] Politur: stale Kommentar-Header in `effects.js` aktualisiert,
      `screen` → `crtScreen` umbenannt (verschattete `window.screen`)

Browser-Checks (von Jens, am besten vor dem Merge):

- [ ] Alle 4 Effekte in Light **und** Dark gegenchecken
- [ ] Mobile (≤ 32rem): Splash zentriert, Flackern/Degauss unauffällig,
      404-Glitch-Zeile läuft nicht aus dem Kasten
- [ ] `prefers-reduced-motion` aktiv: kein Splash, kein Flackern, kein
      Degauss; 404-Seite ohne Bewegung (statischer Versatz darf bleiben)

Bekannte Kleinigkeit:

- Die `[ERROR]`-Zeile (`.glitch-text`, `white-space: nowrap`) kann auf sehr
  schmalen Viewports (< ~322 px) minimal aus dem `.error-code`-Kasten
  ragen. Betrifft nur die 404-Seite auf sehr kleinen/alten Geräten — bei
  Bedarf später fixen (z. B. `overflow-x: auto` auf `.error-code`).

### Backlog — weitere Ideen

- [ ] Restliche Ideen aus der Tabelle oben bei Bedarf einzeln planen
      (Scanline-/Vignette-Layer, Title-Decode, CRT-Power-off,
      Idle-Screensaver, Konami-Code-Easteregg)
