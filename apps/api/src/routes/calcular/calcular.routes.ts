import { Router } from 'express';
import { calcularController } from './calcular.controller';

const router: Router = Router();

router.post('/api/calcular', calcularController);

export { router as calcularRoutes };
