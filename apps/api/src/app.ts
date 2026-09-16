import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { calcularRoutes } from './routes/calcular/calcular.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export interface AppOptions {
  /** Orígenes CORS permitidos. Default: CORS_ORIGIN (lista separada por comas) o http://localhost:5173. */
  corsOrigins?: string[];
  /** Saltos de proxy confiables para req.ip (Regla 9). Default: TRUST_PROXY env o 0 (no confiar). */
  trustProxy?: boolean | number;
  /** Límite de requests por minuto. Default: 100. */
  rateLimitMax?: number;
  /** DSN de Sentry. Default: SENTRY_DSN env. */
  sentryDsn?: string;
  environment?: string;
}

function leerOrigenesEnv(): string[] {
  const raw = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function leerTrustProxyEnv(): boolean | number {
  const raw = process.env['TRUST_PROXY'];
  if (raw === undefined || raw === '') return false;
  const num = Number(raw);
  return Number.isInteger(num) && num >= 0 ? num : raw === 'true';
}

/**
 * Fábrica de la app: permite configurar CORS, proxy y rate limit por entorno
 * y en pruebas (openspec/specs/integridad-calculo.md, Reglas 9 y 10).
 * CORS vive únicamente en Express — ningún componente de borde añade headers CORS.
 */
export function createApp(options: AppOptions = {}): express.Express {
  const app: express.Express = express();

  const corsOrigins = options.corsOrigins ?? leerOrigenesEnv();
  const trustProxy = options.trustProxy ?? leerTrustProxyEnv();
  const rateLimitMax = options.rateLimitMax ?? 100;
  const sentryDsn = options.sentryDsn ?? process.env['SENTRY_DSN'] ?? '';
  const environment =
    options.environment ?? process.env['NODE_ENV'] ?? 'development';

  app.set('trust proxy', trustProxy);

  if (sentryDsn) {
    Sentry.init({ dsn: sentryDsn, environment });
  }

  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());
  app.use(morgan(environment === 'production' ? 'combined' : 'dev'));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: rateLimitMax,
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

  if (sentryDsn) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use(errorHandler);

  return app;
}

export const app = createApp();
