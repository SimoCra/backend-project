import express from 'express';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import {
  getAdminUsersController,
  getUserInfoController,
  updateUserController,
  deleteUserController
} from '../controllers/userController.js';
import { adminSecurityMiddleware } from '../middleware/securityLogger.js';

const router = express.Router();

// GET /admin
router.get('/admin', verifyToken, adminSecurityMiddleware, checkRole(['admin']), getAdminUsersController);

// GET /user
router.get('/user', verifyToken, getUserInfoController);

// PUT /:id
router.put('/:id', verifyToken,updateUserController);

// DELETE /admin/users/:id
router.delete('/admin/users/:id', verifyToken,  checkRole(['admin']), deleteUserController);

export default router;
