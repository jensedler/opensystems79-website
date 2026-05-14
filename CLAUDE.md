# CLAUDE.md — Projekt-Briefing für Claude

Notizen für Claude, damit zukünftige Sessions sofort den Kontext haben.
Dieses Dokument ist **nicht** Teil des Deployments (in `_config.yml`
unter `exclude`).

## Was ist das?

`opensystems79-website` ist Jens' persönliches Blog.
Domain: <https://opensystems79.de>.
Untertitel: *"Diarrhea of a Madman"*.
Single-Author (Jens), DE/EN gemischt, keine Kategorien, keine Kommentare,
kein Tracking, keine externen Dependencies zur Laufzeit.

## Stack

- **Jekyll 4.3.4** (siehe `Gemfile`) — *nicht* `github-pages` Gem, weil das
  alte Jekyll-Versionen pinnt. Stattdessen GitHub-Actions-Build (siehe
  unten), das gibt uns die volle Kontrolle und Server-Portabilität.
- **Ruby 3.3** (siehe `.ruby-version`)
- **Kramdown + Rouge** für Markdown & Syntax-Highlighting
- Plugins: `jekyll-sitemap`, `jekyll-seo-tag`, `jekyll-paginate`
- Eigener **RSS-Feed** in `feed.xml` (kein `jekyll-feed`, da limit-Steuerung
  gewollt war)

## Wichtige Konventionen

### Posts
- Liegen in `_posts/`, Namensschema `YYYY-MM-DD-slug.md`
- Permalink: `/:year/:month/:day/:title/` (in `_config.yml` global gesetzt)
- Front-Matter: `title`, `date` (mit Zeitzone `+0200`/`+0100`), optional
  `description` (wird auch im RSS-`<description>` verwendet)
- `layout: post` und `author: Jens` kommen automatisch über `defaults`
- **Future-Posts** sind erlaubt und erwünscht — `future: false` im
  Produktivbuild blendet sie aus, der tägliche Cron-Build veröffentlicht
  sie pünktlich.

### Pages
- Liegen im Repo-Root als `.md`-Dateien mit `permalink: /xyz/`
- Automatisch `layout: page` über `defaults`
- Aktuell: `about.md`, `impressum.md`, `datenschutz.md`

### Layouts & Includes
- `_layouts/default.html` — HTML-Skelett, lädt CSS/JS, rendert Header/Footer.
  Enthält zusätzlich das `#boot-splash`-Overlay als erstes Body-Kind (nur
  auf der Startseite, siehe `EFFEKTE.md`)
- `_layouts/post.html`, `_layouts/page.html` — extenden `default`
- `_includes/head.html` — `<head>`, inkl. Theme-Pre-Hydration-Script
  (verhindert FOUC beim Dark-Mode)
- `_includes/header.html` — Site-Titel mit `~/`-Prompt, Subtitle mit Cursor,
  Nav `[posts] [about] [rss]` + Theme-Toggle
- `_includes/footer.html` — © + Impressum/Datenschutz/RSS
- `_includes/theme-toggle.html` — Button für `assets/js/theme.js`

### CSS-Design-System (in `assets/css/main.scss`)
- **Fonts (lokal!)**: **JetBrains Mono** für ALLES — UI, Fließtext, Code,
  Headings. Voll-Mono-Setup (Terminal-Ästhetik). Wenn das später zu
  uniform wird, ist iA Writer Quattro die nächste Wahl als Body-Pairing.
  Niemals Google Fonts oder ein CDN einbinden — harte Anforderung
  (Privacy, Offline-Resilienz). Fonts liegen in `assets/fonts/` als
  woff2, werden via `<link rel="preload">` priorisiert. Gewichte 400 /
  400-italic / 700 / 800.
- **Lizenz**: JetBrains Mono ist SIL OFL 1.1 — Verwendung in
  `datenschutz.md` namentlich aufgeführt und verlinkt. Bei Font-Wechsel
  dort mitziehen.
- **Themes**: `data-theme="light"` und `data-theme="dark"` auf `<html>`.
  Ohne Attribut → System-Präferenz via `@media (prefers-color-scheme)`.
- **Farben** (CSS-Variablen):
  - Light: warmes Papier (`#fbfaf6`), Rust-Akzent (`#b85c00`)
  - Dark: fast-schwarz (`#0e0e0d`), Terminal-Amber (`#ffb454`)
- **Layout**: einspaltig, `--measure: 38rem`, viel Whitespace
- **Cursor**: `.cursor` Span, CSS-`@keyframes blink`, respektiert
  `prefers-reduced-motion`
- **Section-Marker**: `h2` in Posts wird mit `// ` (Mono, muted) geprefixt
- **Code**: dezentes Rouge-Theme inline in `main.scss`, sowohl für Light
  als auch Dark

### JavaScript
- **Zwei JS-Dateien**, beide `defer` in `_layouts/default.html`:
  - `assets/js/theme.js` — Theme-Toggle (Auto → Light → Dark), persistiert
    in `localStorage` (Key: `theme`).
  - `assets/js/effects.js` — CRT-/Terminal-Effekte. Konzept, Roadmap &
    To-Do: `EFFEKTE.md` (im Build `exclude`d). Stand: Phasen 1 & 2
    erledigt — Boot-Splash der Startseite (`initBootSplash()`: Cursor
    blinkt → Name wird getippt → blinkt nach → Overlay blendet weg) und
    gelegentliches CRT-Flackern auf allen Seiten (`initCrtGlitch()`:
    1-zu-10-Wurf, nach 4–25 s ein kurzes Zucken des `.crt-screen`-Wrappers).
- Dazu gibt es **zwei Inline-Scripts** im `<head>` (`_includes/head.html`):
  die Theme-Pre-Hydration (verhindert FOUC) und — nur auf der Startseite —
  der Boot-Splash-Entscheider (würfelt 1-zu-5, max. 1× pro Browser-Session
  via `sessionStorage`-Key `os79:splash`, setzt vor dem Paint
  `html.splash-active`). Details: `EFFEKTE.md`.
- **Bitte keine** Build-Tools (kein Node, kein npm). Jekyll baut Sass
  direkt; JS ist plain ES5/6 ohne Transpilation.

## Build- & Deployment-Pipeline

### Lokal
```bash
bundle install
bundle exec jekyll serve --livereload --future --drafts
```
- `--future` zeigt zukünftig datierte Posts (im Produktivbuild ausgeblendet)
- `--drafts` zeigt `_drafts/` (existiert noch nicht)

### Produktiv: GitHub Pages via Actions
- Workflow: `.github/workflows/deploy.yml`
- Trigger: `push` auf `main`, **täglicher Cron `0 6 * * *`** (06:00 UTC),
  und manuell via `workflow_dispatch`
- Ruby 3.3, `bundle exec jekyll build` mit `JEKYLL_ENV=production`,
  `TZ=Europe/Berlin`
- Deployment via `actions/deploy-pages@v4` → CNAME aktiv

### Produktiv: Eigener Webserver
- `bundle exec jekyll build` erzeugt `_site/`
- `_site/` enthält reines HTML/CSS/JS — keine GitHub-Pages-spezifischen
  Abhängigkeiten. Per `rsync` oder Container deploybar.

## Was *nicht* tun

- **Keine** Google Fonts, kein CDN, kein Analytics, kein Tracking-Pixel —
  Hard Constraint. Auch nicht „nur für die Performance".
- **Keine** Build-Tools jenseits von Jekyll/Sass (kein npm, kein Webpack,
  kein PostCSS). Das Projekt soll mit `bundle install && bundle exec
  jekyll serve` starten, ohne Node.
- **Keine** Kategorien/Tags-UI bauen, bis Jens das explizit will — er hat
  sie bewusst weggelassen.
- **Keine** Kommentar-Systeme einbinden (Disqus, utterances, …).
- **Keine** Mehrautoren-Logik einführen — single-author Setup, `author:
  Jens` ist Default.
- **Keine** dem README/CLAUDE.md ähnlichen Dateien ins `_site/` kippen
  lassen — `exclude` in `_config.yml` ist die Wahrheit. Wenn du neue
  Doku-Files anlegst, ergänze dort den Eintrag.
- `future: true` darf **nicht** im Produktivbuild stehen — das würde die
  ganze Cron-Mechanik aushebeln.

## Bei Änderungen prüfen

- `bundle exec jekyll build --trace` läuft ohne Errors/Warnings
- `_site/feed.xml` enthält max. 20 Items, sortiert `pubDate` desc
- Theme-Toggle funktioniert im Browser, kein FOUC beim Reload
- Dark/Light: Rouge-Highlighting bleibt lesbar in beiden Modi
- Mobile (≤ 32rem): Post-Liste bricht in 2 Zeilen um, Padding stimmt

## Memory-Notiz
Die User-Sprache ist Deutsch (Du-Form), siehe `~/.claude/CLAUDE.md`.
Untertitel und einzelne Inhalte können englisch sein, die Repo-Doku ist
deutsch.
