#!/usr/bin/env bash
# Lädt die lokal gehosteten Fonts herunter (JetBrains Mono + Source Serif 4).
# Nur einmalig nötig — die WOFF2-Dateien werden ins Repo committet.
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p assets/fonts
cd assets/fonts

echo "→ JetBrains Mono v2.304 (SIL OFL 1.1)"
JBM_BASE="https://github.com/JetBrains/JetBrainsMono/raw/v2.304/fonts/webfonts"
curl -fsSL -o JetBrainsMono-Regular.woff2    "$JBM_BASE/JetBrainsMono-Regular.woff2"
curl -fsSL -o JetBrainsMono-Italic.woff2     "$JBM_BASE/JetBrainsMono-Italic.woff2"
curl -fsSL -o JetBrainsMono-Bold.woff2       "$JBM_BASE/JetBrainsMono-Bold.woff2"
curl -fsSL -o JetBrainsMono-ExtraBold.woff2  "$JBM_BASE/JetBrainsMono-ExtraBold.woff2"

echo "✓ Fonts in assets/fonts/ gespeichert."
ls -lh
