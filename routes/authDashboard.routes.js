import express from 'express';
import { getDashboardStatsController } from '../controllers/dashboardController.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/stats', verifyToken, checkRole(['admin']), getDashboardStatsController);

export default router;
