// routes/notificationRoutes.js
import express from 'express';
import { getNotificationsController, deleteNotificationController, markNotificationsReadController} from '../controllers/notificationsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();


// Ahora: GET /api/notifications/:userId
router.get('/:userId', verifyToken, getNotificationsController);

router.put('/mark-read/:userId', verifyToken, markNotificationsReadController);

// Eliminar notificación por ID
router.delete('/:id', verifyToken, deleteNotificationController);

export default router;
