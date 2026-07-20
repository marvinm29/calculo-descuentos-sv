#!/bin/bash
set -e

# ============================================================
# Setup script for Calculadora de Descuentos droplet
# Corre como root en Ubuntu 24.04
#
# REQUIERE variables de entorno (pasalas inline):
#
#   CLERK_SECRET_KEY=sk_... \
#   SENTRY_DSN=https://...  \
#   DD_API_KEY=xxxxxxxxxx    \
#   bash < setup-droplet.sh
#
# O creá /opt/calculo-descuentos/apps/api/.env manualmente
# despues de correr el script.
# ============================================================

export DEBIAN_FRONTEND=noninteractive

echo "=== 1. Actualizando sistema ==="
apt-get update -qq
apt-get upgrade -y -qq

echo "=== 2. Instalando dependencias del sistema ==="
apt-get install -y -qq curl git build-essential

echo "=== 3. Instalando Node.js 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs
node -v
npm -v

echo "=== 4. Instalando pnpm ==="
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v

echo "=== 5. Instalando Caddy (binario directo) ==="
curl -fsSL 'https://caddyserver.com/api/download?os=linux&arch=amd64' -o /usr/bin/caddy
chmod +x /usr/bin/caddy
groupadd --system caddy 2>/dev/null || true
useradd --system --gid caddy --create-home --home-dir /var/lib/caddy --shell /usr/sbin/nologin --comment "Caddy web server" caddy 2>/dev/null || true
curl -fsSL 'https://raw.githubusercontent.com/caddyserver/dist/master/init/caddy.service' -o /etc/systemd/system/caddy.service
systemctl daemon-reload
systemctl enable caddy

echo "=== 6. Instalando PM2 globalmente ==="
npm install -g pm2

echo "=== 7. Creando directorio de la app ==="
mkdir -p /opt/calculo-descuentos
cd /opt/calculo-descuentos

echo "=== 8. Clonando/actualizando repositorio ==="
if [ -d .git ]; then
  git fetch origin
  git reset --hard origin/main
else
  git clone https://github.com/marvinm29/calculo-descuentos-sv.git .
fi

echo "=== 9. Creando archivo .env ==="
cat > /opt/calculo-descuentos/apps/api/.env << EOF
# Obligatorio
CLERK_SECRET_KEY=${CLERK_SECRET_KEY:-}
DATABASE_PATH=./data/calculos.db
PORT=3001
NODE_ENV=production

# Opcional — Sentry
SENTRY_DSN=${SENTRY_DSN:-}

# Opcional — Datadog
DD_API_KEY=${DD_API_KEY:-}
DD_SITE=${DD_SITE:-datadoghq.com}
EOF

echo "=== 10. Instalando dependencias ==="
pnpm install --frozen-lockfile

echo "=== 11. Construyendo shared ==="
pnpm --filter=@calc/shared build

echo "=== 12. Construyendo api ==="
pnpm --filter=@calc/api build

echo "=== 13. Creando directorio data ==="
mkdir -p /opt/calculo-descuentos/apps/api/data

echo "=== 14. Iniciando API con PM2 ==="
cd /opt/calculo-descuentos/apps/api
pm2 start dist/index.js --name calculo-api

echo "=== 15. Guardando configuración de PM2 ==="
pm2 save
pm2 startup systemd -u root --hp /root --no-daemon 2>/dev/null || true

echo "=== 16. Configurando Caddy ==="
cat > /etc/caddy/Caddyfile << 'CADDYEOF'
api.marvinmelendez.engineer {
    reverse_proxy localhost:3001
    header Access-Control-Allow-Origin *
    header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

    @options {
        method OPTIONS
    }
    handle @options {
        respond 204
    }
}
CADDYEOF

systemctl restart caddy

echo ""
echo "============================================"
echo "  Setup completado"
echo "============================================"
echo ""
echo "  API corriendo en: http://localhost:3001"
echo "  Caddy reverse proxy listo para api.marvinmelendez.engineer"
echo ""
echo "  Proximos pasos:"
echo "  1. Verificar que DNS apunte: api.marvinmelendez.engineer -> <IP_droplet>"
echo "  2. En Clerk Dashboard, cambiar URLs de test a produccion"
echo "  3. Verificar Sentry capturando errores (si configuraste SENTRY_DSN)"
echo "  4. Verificar Datadog APM (si configuraste DD_API_KEY)"
echo ""
pm2 status
caddy version
