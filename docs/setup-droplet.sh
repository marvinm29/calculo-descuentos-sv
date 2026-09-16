#!/bin/bash
set -euo pipefail

# ============================================================
# Setup/Deploy hardening — Calculadora de Descuentos (API)
# Ubuntu 24.04, corre como root para el provisioning inicial.
#
#   * Binarios desde repositorios oficiales y versiones fijadas
#     (Node 22 LTS, pnpm 9.15.9, Caddy desde su repo apt).
#   * App y PM2 corren con usuario de servicio `calculo` sin shell.
#   * .env vive FUERA del checkout: /etc/calculo-descuentos/api.env
#   * Despliegue versionado (tag o commit) — sin git reset --hard.
#     Backup del commit anterior en .last-deploy para rollback.
#   * Express sólo en loopback (127.0.0.1); Caddy hace el TLS.
#   * Sin headers CORS en Caddy: CORS vive únicamente en Express.
#
# USO:
#   SENTRY_DSN=... bash docs/setup-droplet.sh <tag-o-commit>
#   (default: la versión en VERSION_PIN si existe, si no origin/main)
#
# ROLLBACK:
#   cd /opt/calculo-descuentos
#   git checkout "$(cat .last-deploy)"
#   pnpm install --frozen-lockfile && pnpm build
#   sudo -u calculo pm2 reload calculo-api
# ============================================================

DEPLOY_VERSION="${1:-}"
APP_DIR="/opt/calculo-descuentos"
ENV_DIR="/etc/calculo-descuentos"
ENV_FILE="$ENV_DIR/api.env"
SERVICE_USER="calculo"
PNPM_VERSION="9.15.9"
NODE_MAJOR="22"

export DEBIAN_FRONTEND=noninteractive

echo "=== 1. Sistema actualizado ==="
apt-get update -qq
apt-get upgrade -y -qq

echo "=== 2. Dependencias base ==="
apt-get install -y -qq curl git build-essential ca-certificates gnupg

echo "=== 3. Node.js ${NODE_MAJOR} LTS (repositorio oficial NodeSource) ==="
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
apt-get install -y -qq nodejs
node -v

echo "=== 4. pnpm ${PNPM_VERSION} (versión fijada, no @latest) ==="
corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate
pnpm -v

echo "=== 5. Caddy desde repositorio apt oficial (versionado) ==="
apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --batch --yes --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -qq
apt-get install -y -qq caddy
caddy version

echo "=== 6. PM2 global ==="
npm install -g pm2

echo "=== 7. Usuario de servicio ${SERVICE_USER} (sin login) ==="
id -u "$SERVICE_USER" &>/dev/null || useradd --system --create-home \
  --home-dir "$APP_DIR" --shell /usr/sbin/nologin --comment "Calculadora API" "$SERVICE_USER"

echo "=== 8. Directorio de la app ==="
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo "=== 9. Despliegue VERSIONADO (sin reset --hard) ==="
if [ ! -d .git ]; then
  git clone https://github.com/marvinm29/calculo-descuentos-sv.git .
fi
git fetch origin --tags --force

if [ -z "$DEPLOY_VERSION" ] && [ -f VERSION_PIN ]; then
  DEPLOY_VERSION="$(cat VERSION_PIN)"
fi
if [ -z "$DEPLOY_VERSION" ]; then
  DEPLOY_VERSION="origin/main"
fi

if [ -f .last-deploy ]; then
  echo "   Deploy anterior ($(cat .last-deploy)) respaldado en .last-deploy"
fi
git rev-parse HEAD > .last-deploy 2>/dev/null || true

# El checkout debe quedar limpio: el código desplegado es exactamente $DEPLOY_VERSION.
git checkout -- . 2>/dev/null || true
git clean -fdq --exclude=.last-deploy --exclude=VERSION_PIN
git checkout "$DEPLOY_VERSION"
echo "   Desplegado: $DEPLOY_VERSION ($(git rev-parse --short HEAD))"

echo "=== 10. .env FUERA del checkout ($ENV_FILE) ==="
mkdir -p "$ENV_DIR"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" << EOF
# Configuración de la API — propiedad root, permisos 600.
# Fuera del checkout a propósito: los secretos nunca viven en el repo.
PORT=3001
HOST=127.0.0.1
NODE_ENV=production
CORS_ORIGIN=https://marvinmelendez.engineer
TRUST_PROXY=1

# Opcional — Sentry
# SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Opcional — Datadog
# DD_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# DD_SITE=datadoghq.com
EOF
fi
chown root:root "$ENV_FILE"
chmod 600 "$ENV_FILE"
chown -R root:root "$ENV_DIR"
chmod 755 "$ENV_DIR"

echo "=== 11. Dependencias congeladas + build ==="
pnpm install --frozen-lockfile
pnpm build

echo "=== 12. PM2 bajo el usuario de servicio ==="
sudo -u "$SERVICE_USER" pm2 start apps/api/ecosystem.config.cjs --name calculo-api 2>/dev/null \
  || sudo -u "$SERVICE_USER" pm2 reload calculo-api
sudo -u "$SERVICE_USER" pm2 save

# PM2 arranca con systemd usando el usuario de servicio (no root).
pm2 startup systemd -u "$SERVICE_USER" --hp "/home/$SERVICE_USER" 2>/dev/null || true

echo "=== 13. Caddy: proxy sin headers CORS (CORS sólo en Express) ==="
cat > /etc/caddy/Caddyfile << 'CADDYEOF'
api.marvinmelendez.engineer {
    # Express escucha sólo en 127.0.0.1: TRUST_PROXY=1 contabiliza
    # el rate limit por IP real (X-Forwarded-For que Caddy añade).
    reverse_proxy 127.0.0.1:3001
}
CADDYEOF
caddy validate --config /etc/caddy/Caddyfile
systemctl enable caddy
systemctl restart caddy

echo ""
echo "============================================"
echo "  Setup completado"
echo "============================================"
echo "  API: 127.0.0.1:3001 (loopback) bajo usuario $SERVICE_USER"
echo "  Proxy: api.marvinmelendez.engineer (Caddy, TLS automático)"
echo "  Env: $ENV_FILE (600, root)"
echo ""
echo "  Verificación post-deploy:"
echo "    curl -s -o /dev/null -w '%{http_code}' -X POST https://api.marvinmelendez.engineer/api/calcular \\"
echo "      -H 'Content-Type: application/json' -H 'Origin: https://marvinmelendez.engineer' \\"
echo "      -d '{\"salarioBase\":800,\"tipoPago\":\"mensual\",\"fechaInicio\":\"2026-09-01\",\"fechaFin\":\"2026-09-15\",\"antiguedad\":\"1_a_3\",\"fechaIngreso\":\"2020-01-01\",\"segmentos\":[]}'"
echo "    # esperado: 200 con CORS_ORIGIN correcto, 400/403 fuera del allowlist"
echo ""
echo "  Rollback:"
echo "    cd $APP_DIR && git checkout \"\$(cat .last-deploy)\" && pnpm install --frozen-lockfile && pnpm build"
echo "    sudo -u $SERVICE_USER pm2 reload calculo-api"
echo ""
pm2 status
caddy version
