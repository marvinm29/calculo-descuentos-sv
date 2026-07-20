import { Router } from 'express';
import {
  createHistoryController,
  getHistoryController,
  deleteHistoryController,
} from './history.controller.js';

const router: Router = Router();

router.post('/api/history', createHistoryController);
router.get('/api/history', getHistoryController);
router.delete('/api/history/:id', deleteHistoryController);

export { router as historyRoutes };
