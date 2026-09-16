// Configuración PM2 de la API.
// El .env vive FUERA del checkout (/etc/calculo-descuentos/api.env, root:600);
// este archivo lo lee y lo inyecta como variables de proceso.
// Ver docs/setup-droplet.sh y ADR-011 en specs/architecture.md.
const fs = require('node:fs');

const RUTA_ENV = process.env.API_ENV_FILE || '/etc/calculo-descuentos/api.env';

function cargarEnv(ruta) {
  try {
    const env = {};
    for (const linea of fs.readFileSync(ruta, 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !linea.trim().startsWith('#')) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
    return env;
  } catch {
    return {};
  }
}

module.exports = {
  apps: [
    {
      name: 'calculo-api',
      script: './dist/index.js',
      env: {
        NODE_ENV: 'production',
        ...cargarEnv(RUTA_ENV),
      },
    },
  ],
};
