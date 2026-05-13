# opensystems79

Persönliches Blog von Jens — *Diarrhea of a Madman*.
Statisch generiert mit [Jekyll](https://jekyllrb.com/), gehostet unter
<https://opensystems79.de>.

---

## Inhalt

- [Schnellstart](#schnellstart)
- [Posts schreiben](#posts-schreiben)
- [Future-Posts: terminierte Veröffentlichung](#future-posts-terminierte-veröffentlichung)
- [Seiten anlegen](#seiten-anlegen)
- [Design & Anpassung](#design--anpassung)
- [Deployment](#deployment)
- [Verzeichnisstruktur](#verzeichnisstruktur)
- [Fonts](#fonts)
- [Wartung & Updates](#wartung--updates)
- [Troubleshooting](#troubleshooting)

---

## Schnellstart

Voraussetzungen: **Ruby 3.3+** und **Bundler**.

```bash
git clone git@github.com:<dein-user>/opensystems79-website.git
cd opensystems79-website
bundle install
bundle exec jekyll serve --livereload --future
```

Seite läuft dann auf <http://localhost:4000>. Live-Reload aktiv —
Änderungen an Posts/Layouts/CSS werden sofort angezeigt.

> `--future` zeigt auch Posts mit zukünftigem Datum. Produktiv werden
> die automatisch ausgeblendet, bis ihr Datum erreicht ist.

---

## Posts schreiben

Posts liegen in `_posts/` und heißen `YYYY-MM-DD-slug.md`.

```markdown
---
title: "Mein Post-Titel"
date: 2026-05-15 09:30:00 +0200
description: "Kurze Zusammenfassung — landet im RSS-Feed und in Meta-Tags."
---

Inhalt in **Markdown**.

## Eine Section

Headings werden automatisch mit `//` geprefixt (Terminal-Look).

> Zitate sehen so aus.

```python
def hallo():
    print("welt")
```
```

**Front-Matter-Felder:**

| Feld          | Pflicht | Beschreibung                                              |
|---------------|---------|-----------------------------------------------------------|
| `title`       | ja      | Post-Titel                                                |
| `date`        | ja      | Datum + Uhrzeit + Zeitzone (z. B. `+0200`)                |
| `description` | nein    | Kurzbeschreibung für RSS & Meta-Tags (sonst Auto-Excerpt) |
| `subtitle`    | nein    | Optionaler Untertitel                                     |
| `lang`        | nein    | `de` (Standard) oder `en`, falls Post auf Englisch ist    |

Autor (`Jens`) und Layout werden automatisch gesetzt — keine Angabe
nötig.

### Permalink
Posts landen unter `/JAHR/MONAT/TAG/slug/`, also z. B.
`https://opensystems79.de/2026/05/15/mein-post-titel/`.

### Code-Blöcke
Dreifach-Backticks mit Sprache, z. B. `` ```bash ``. Rouge erledigt das
Syntax-Highlighting für beide Themes.

---

## Future-Posts: terminierte Veröffentlichung

Datiere einen Post einfach in die Zukunft:

```markdown
---
title: "Erscheint nächsten Montag"
date: 2026-06-01 08:00:00 +0200
---
```

- **Lokal** (mit `--future`) ist der Post sofort sichtbar.
- **Produktiv** wird er erst sichtbar, sobald das Datum erreicht ist.
- Ein **täglicher GitHub-Actions-Build um 06:00 UTC** (07:00 MEZ /
  08:00 MESZ) deployed ihn dann automatisch — du musst nichts pushen.

Manuell anstoßen geht jederzeit über GitHub: *Actions → Build & Deploy
→ Run workflow*.

---

## Seiten anlegen

Statische Seiten (z. B. `/kontakt/`) als `.md` im Repo-Root:

```markdown
---
title: Kontakt
permalink: /kontakt/
---

E-Mail: …
```

Layout (`page`) wird automatisch gesetzt. Falls die Seite in der
Hauptnavigation auftauchen soll, ergänze sie in
`_includes/header.html`.

---

## Design & Anpassung

### Farben & Themes
Alle Farben sind CSS-Variablen in `assets/css/main.scss` unter
`:root[data-theme="light"]` bzw. `dark`. Beispiel:

```scss
:root[data-theme="dark"] {
  --bg: #0e0e0d;
  --fg: #e8e6df;
  --accent: #ffb454;   /* Terminal-Amber */
  /* ... */
}
```

Theme-Modi: **auto / light / dark** (Button oben rechts). Auto folgt dem
System; die Wahl wird in `localStorage` gespeichert.

### Typografie
- **Alles**: JetBrains Mono (lokal, woff2, Gewichte 400/700/800)
- Zentrale Variablen: `--font-mono`, `--fs-base`, `--measure`

### Cursor-Animation
Wo immer du `<span class="cursor"></span>` einfügst, erscheint ein
blinkender Block. Respektiert `prefers-reduced-motion`.

### Section-Marker
H2-Überschriften in Posts/Pages bekommen automatisch ein `// ` als
Prefix in Mono — fühlt sich an wie Kommentare im Code.

---

## Deployment

### Option A: GitHub Pages (Standard)

1. Repo zu GitHub pushen
2. **Settings → Pages**: *Source* auf **„GitHub Actions"** stellen
3. **Settings → Pages**: *Custom domain* auf `opensystems79.de` setzen
   (CNAME ist bereits im Repo)
4. DNS: `opensystems79.de` → `185.199.108.153`, `…109.153`, `…110.153`,
   `…111.153` (GitHub Pages IPs). Für `www`-Subdomain ein `CNAME`-Record
   auf `<dein-user>.github.io.`
5. Fertig. Push auf `main` → Deploy. Cron läuft täglich.

Workflow-Datei: `.github/workflows/deploy.yml`.

### Option B: Eigener Webserver

```bash
JEKYLL_ENV=production bundle exec jekyll build
rsync -avz --delete _site/ user@server:/var/www/opensystems79/
```

`_site/` ist reines HTML/CSS/JS — keine GitHub-Pages-Magie nötig. Du
kannst auch einen Docker-Container o. ä. drumherum bauen.

Für tägliche Future-Post-Veröffentlichung auf eigenem Server: einfachen
Cron einrichten, der `git pull && bundle exec jekyll build && rsync …`
ausführt.

---

## Verzeichnisstruktur

```
opensystems79-website/
├── _config.yml              Jekyll-Konfiguration
├── Gemfile                  Ruby-Dependencies
├── CNAME                    Custom-Domain für GitHub Pages
├── .github/workflows/
│   └── deploy.yml           CI/CD: Push + täglicher Cron + manuell
├── _layouts/                HTML-Vorlagen (default, post, page)
├── _includes/               Header, Footer, Head, Theme-Toggle
├── _posts/                  Blog-Posts (YYYY-MM-DD-slug.md)
├── assets/
│   ├── css/main.scss        Stylesheet (Themes, Layout, Typo)
│   ├── js/theme.js          Theme-Toggle-Logik
│   ├── fonts/               JetBrains Mono + Source Serif 4 (woff2)
│   └── img/                 Favicon etc.
├── scripts/
│   └── fetch-fonts.sh       Lädt die lokalen Fonts neu
├── index.html               Startseite (Intro + Post-Liste)
├── 404.html                 Fehlerseite
├── feed.xml                 RSS-Feed (20 neueste, date desc)
├── robots.txt
├── about.md                 /about/
├── impressum.md             /impressum/  ← Adresse ergänzen!
├── datenschutz.md           /datenschutz/
├── CLAUDE.md                Briefing für Claude (nicht deployed)
└── README.md                Diese Datei (nicht deployed)
```

`_site/`, `vendor/`, `.bundle/`, `.jekyll-cache/` werden generiert und
sind via `.gitignore` ausgeschlossen.

---

## Fonts

Lokal in `assets/fonts/`:

- **JetBrains Mono** — SIL OFL 1.1, © JetBrains s.r.o.
  <https://github.com/JetBrains/JetBrainsMono>

Neu beziehen (z. B. nach Update):

```bash
./scripts/fetch-fonts.sh
```

Quelle: JetBrains GitHub Release. Die WOFF2-Dateien liegen im Repo und
werden lokal ausgeliefert — kein Google Fonts, kein CDN zur Laufzeit.

> Beim Hinzufügen oder Wechseln einer Schriftart auch
> `datenschutz.md` aktualisieren — die SIL-OFL-Lizenz verlangt die
> Nennung von Urheber und Lizenz.

---

## Wartung & Updates

### Jekyll & Gems aktualisieren

```bash
bundle update
bundle exec jekyll --version
git commit -am "deps: bundle update"
```

### Posts massenhaft re-validieren

```bash
bundle exec jekyll build --trace
```

zeigt Warnungen für defekte Front-Matter oder ungültige Markdown-Strukturen.

### CI manuell triggern
GitHub UI: *Actions → Build & Deploy → Run workflow → main*.

---

## Troubleshooting

**`bundle install` schlägt fehl mit Native-Extensions-Fehlern**
Stelle sicher, dass Xcode-CLI-Tools installiert sind:
`xcode-select --install`.

**Theme flackert beim Seitenladen (FOUC)**
Sollte nicht passieren — das Inline-Script in `_includes/head.html`
setzt das Theme synchron vor dem ersten Paint. Wenn doch: prüfen, ob
das Script nicht aus Versehen verschoben oder mit `defer` versehen wurde.

**Future-Post erscheint nicht produktiv, obwohl Datum erreicht ist**
Der Cron läuft 06:00 UTC. Solange der nicht durch ist, ist der Post
nicht deployed. Manuell triggern in *Actions → Run workflow*.

**Fonts laden nicht**
`./scripts/fetch-fonts.sh` neu ausführen, dann `bundle exec jekyll
build` und im Build-Output `_site/assets/fonts/` checken. Die
`@font-face`-Pfade in `main.scss` müssen mit den Dateinamen
übereinstimmen.

**RSS-Feed leer**
Posts werden nur in den Feed aufgenommen, wenn `date <= site.time`. Bei
Zeitzonen-Drift: `timezone: Europe/Berlin` in `_config.yml` prüfen.

---

## Lizenz

Code: MIT (oder nach Wahl) — Blog-Inhalte: alle Rechte vorbehalten,
sofern nicht anders ausgewiesen.

---

*Made with Markdown, Jekyll, und einem blinkenden Cursor.*
