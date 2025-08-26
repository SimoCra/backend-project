// src/routes/productAndReviewRoutes.js
import express from 'express';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';
import { validateProduct, validateReview } from '../middleware/ValidateProductInput.js';

import {
  createProductController,
  getPublicProductsController,
  getProductByNameController
} from '../controllers/productController.js';

import {
  createReviewController,
  getReviewsByProductController,
  deleteReviewController,
  getProductAverageRatingController
} from '../controllers/productReviewControllers.js';

const router = express.Router();

// ----------------- PRODUCT ROUTES -----------------

// POST /admin/create-product
router.post( '/admin/create-product', verifyToken, checkRole(['admin']), upload.array('image', 10), validateProduct, createProductController);

// GET /home/get-products-public
router.get('/home/get-products-public', getPublicProductsController);

// GET /home/get-product/:name
router.get('/home/get-product/:name', getProductByNameController);

// ----------------- REVIEW ROUTES -----------------

// POST /reviews
router.post('/reviews', verifyToken,validateReview, createReviewController);

// GET /reviews/:productId
router.get('/reviews/:productId', getReviewsByProductController);

// GET /reviews/:productId/average
router.get('/reviews/:productId/average', getProductAverageRatingController);

// DELETE /reviews/:id
router.delete('/reviews/:id', verifyToken, deleteReviewController);

export default router;
