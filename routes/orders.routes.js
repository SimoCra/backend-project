// routes/orderRoutes.js
import express from 'express';
import {
  checkoutController,
  postAddress,
  getAddressesByUser,
  getAllOrdersController,
  getUserOrdersController,
  updateOrderStatusController // <-- Importar el controlador nuevo
} from '../controllers/orderController.js';
import { checkRole, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', verifyToken, checkoutController);

router.post('/addresses', verifyToken, postAddress);

router.get('/addresses', verifyToken, getAddressesByUser);

router.get('/my-orders', verifyToken, getUserOrdersController);

router.get('/all-orders', verifyToken, checkRole(['admin']), getAllOrdersController);

// Ruta para actualizar el estado del pedido (solo admin)
router.put('/orders/status', verifyToken, checkRole(['admin']), updateOrderStatusController);

export default router;
