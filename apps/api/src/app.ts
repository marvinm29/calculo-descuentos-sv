import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { calcularRoutes } from './routes/calcular/calcular.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: express.Express = express();

const SENTRY_DSN: string = process.env['SENTRY_DSN'] ?? '';
if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, environment: process.env['NODE_ENV'] ?? 'development' });
}

// CORS restringido al origen del frontend (evita uso por terceros).
// Default dev: http://localhost:5173. Producción: https://marvinmelendez.engineer
const CORS_ORIGIN: string =
  process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message:
          'Demasiadas solicitudes. Intente de nuevo en 60 segundos.',
      });
    },
  }),
);

app.use(calcularRoutes);

if (SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use(errorHandler);

export { app };
