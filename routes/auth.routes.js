import express from 'express';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  registerController,
  loginController,
  forgotPasswordController,
  getMeController,
  logout,
  verifyResetTokenController,
  resetPasswordController
} from '../controllers/authController.js';
import { validateRegister, validateLogin,validateForgotPassword, validateResetPassword } from '../middleware/validateUserInput.js';
import { loginRateLimiter, forgotPasswordRateLimiter } from '../middleware/rateLimiters.js';

dotenv.config();

const router = express.Router();

// POST /register
router.post('/register', validateRegister,registerController);

// POST /login
router.post('/login', loginRateLimiter,validateLogin,loginController);

// POST /forgot-password
router.post('/forgot-password', forgotPasswordRateLimiter,validateForgotPassword,forgotPasswordController);

// verify-code
router.post('/verify-reset-token', verifyResetTokenController);

router.post('/reset-password', validateResetPassword, resetPasswordController);


router.post('/logout', logout);

// GET /me
router.get('/me', verifyToken, getMeController);


// router.post('/upload', upload, validarFirmaHex, (req, res) => {
//   res.send('Archivo subido y validado correctamente');
// });

export default router;
