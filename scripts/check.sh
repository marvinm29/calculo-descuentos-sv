#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0

pass() { PASS=$((PASS+1)); }
fail() { FAIL=$((FAIL+1)); echo "  ✗ $1"; }

section() {
  echo ""
  echo "═══════════════════════════════════════════════"
  echo "  $1"
  echo "═══════════════════════════════════════════════"
}

section "1. Instalando dependencias"
pnpm install --frozen-lockfile 2>&1 | tail -1 && pass "pnpm install" || fail "pnpm install"

section "2. Buildeando shared (necesario para otros paquetes)"
pnpm --filter=@calc/shared build 2>&1 | tail -5 && pass "build shared" || fail "build shared"

section "3. Lint"
pnpm lint 2>&1 | tail -5 && pass "lint" || fail "lint"

section "4. TypeScript check"
pnpm check-types 2>&1 | tail -10 && pass "check-types" || fail "check-types"

section "5. Tests (con coverage)"
pnpm test -- --coverage 2>&1 | tail -20 && pass "test" || fail "test"

section "6. Build completo (todos los paquetes)"
pnpm build 2>&1 | tail -10 && pass "build" || fail "build"

echo ""
echo "═══════════════════════════════════════════════"
echo "  RESULTADO: $PASS pasaron, $FAIL fallaron"
echo "═══════════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "⚠️  Algunas verificaciones fallaron. Revisá los logs arriba."
  exit 1
else
  echo "✅ Todo en orden." | tee /dev/null
fi
