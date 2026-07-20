#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "═══════════════════════════════════════════════"
echo "  Iniciando frontend (:5173) + API (:3001)"
echo "═══════════════════════════════════════════════"
echo "  Presioná Ctrl+C para detener ambos."
echo ""

pnpm dev
