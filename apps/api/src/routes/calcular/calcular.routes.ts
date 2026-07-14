import { Router } from 'express';
import { calcularController } from './calcular.controller.js';

const router: Router = Router();

router.post('/api/calcular', calcularController);

export { router as calcularRoutes };
