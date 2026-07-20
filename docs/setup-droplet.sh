#!/bin/bash
set -e

# ============================================================
# Setup script for Calculadora de Descuentos droplet
# Corre como root en Ubuntu 24.04
# ============================================================

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

echo "=== 5. Instalando Caddy ==="
apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -qq
apt-get install -y -qq caddy

echo "=== 6. Instalando PM2 globalmente ==="
npm install -g pm2

echo "=== 7. Creando directorio de la app ==="
mkdir -p /opt/calculo-descuentos
cd /opt/calculo-descuentos

echo "=== 8. Clonando repositorio ==="
git clone https://github.com/marvinm29/calculo-descuentos-sv.git .
# Si el repo es privado o quieres usar SSH, descomenta la línea de abajo
# y comenta la de arriba:
# git clone git@github.com:marvinm29/calculo-descuentos-sv.git .

echo "=== 9. Creando archivo .env ==="
cat > /opt/calculo-descuentos/apps/api/.env << 'EOF'
CLERK_SECRET_KEY=sk_test_GK2dwWTODf0aSE2wQjWz6vhepnkVgJNzgiQdKrcEvV
DATABASE_PATH=./data/calculos.db
PORT=3001
NODE_ENV=production
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
pm2 startup systemd -u root --hp /root

echo "=== 16. Configurando Caddy ==="
cat > /etc/caddy/Caddyfile << 'CADDYEOF'
api.marvinmelendez.engineer {
    reverse_proxy localhost:3001
    header Access-Control-Allow-Origin *
    header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization"

    @options {
        method OPTIONS
    }
    handle @options {
        respond 204
    }
}

marvinmelendez.engineer {
    redir https://marvinm29.github.io/calculo-descuentos-sv{uri} permanent
}
CADDYEOF

systemctl restart caddy

echo ""
echo "============================================"
echo "  ✅ Setup completado"
echo "============================================"
echo ""
echo "  API corriendo en: http://localhost:3001"
echo "  Caddy reverse proxy listo para api.marvinmelendez.engineer"
echo ""
echo "  Próximos pasos:"
echo "  1. Configurar DNS: api.marvinmelendez.engineer → 159.223.146.165"
echo "  2. Agregar dominio marvinmelendez.engineer en GitHub Pages Settings"
echo "  3. En Clerk Dashboard, cambiar URLs a producción"
echo ""
pm2 status
caddy version
