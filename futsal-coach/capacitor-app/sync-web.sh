#!/usr/bin/env bash
# Copies the single-file futsal app into the Capacitor web asset folder.
# Run before every native build so the APK matches the latest futsal.html.
set -euo pipefail
cd "$(dirname "$0")"
cp ../futsal.html www/index.html
echo "Synced ../futsal.html -> www/index.html"
