import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { calcularRoutes } from './routes/calcular/calcular.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: express.Express = express();

app.use(cors());
app.use(express.json());

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

app.use(errorHandler);

export { app };
