import express from 'express';
import {
  addToCartController,
  deleteProductFromCartController,
  updateCartItemController,
  getCartSummary
} from '../controllers/cartController.js';
import {verifyToken} from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/add', verifyToken,addToCartController);


router.delete('/remove', verifyToken, deleteProductFromCartController);



router.put('/update/:cartItemId', verifyToken, updateCartItemController);

router.get('/summary', verifyToken, getCartSummary)



export default router;
