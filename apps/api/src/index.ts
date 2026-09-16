import tracer from 'dd-trace';
tracer.init();

import { app } from './app.js';

const PORT = Number(process.env['PORT']) || 3001;
// Hardening: por defecto sólo loopback — el proxy (Caddy) corre en el mismo host.
const HOST = process.env['HOST'] || '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`API escuchando en http://${HOST}:${PORT}`);
});
