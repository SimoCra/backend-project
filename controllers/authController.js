import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { 
  createUser, 
  loginUser, 
  findUserById, 
  updateUserPasswordService, 
  findUserByEmailService 
} from '../service/userService.js';
import { verifyCaptcha } from '../service/captchaService.js';
import { sendEmail } from '../utils/sendCode.js';
import logger from '../utils/logger.js';  // 👈 importar winston

dotenv.config();

// POST /register
export const registerController = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const role = (email === process.env.ADMIN_EMAIL) ? 'admin' : 'user';
  const image = { filename: 'default.jpg' };

  try {
    await createUser(name, email, phone, password, role, image);
    logger.info(`🟢 Usuario registrado: ${email}`);
    res.status(201).json({ message: '✅ Usuario registrado exitosamente' });
  } catch (error) {
    logger.error(`❌ Error al registrar usuario (${email}): ${error.message}`);
    res.status(500).json({ message: error || 'Error al registrar usuario' });
  }
};

// POST /login
export const loginController = async (req, res) => {
  const { email, password, captchaToken } = req.body;
  const fingerprint = req.headers['x-client-fingerprint']; 

  if (captchaToken) {
    return res.status(400).json({ message: 'Falta el captcha' });
  }
  if (!fingerprint) {
    return res.status(400).json({ message: 'Fingerprint ausente en el header' });
  }

  try {
    await verifyCaptcha(captchaToken); 
    const user = await loginUser(email);

    if (!user) {
      logger.warn(`Intento de login con email inexistente: ${email}`);
      return res.status(400).json({ message: 'Email inexistente' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn(`Contraseña incorrecta para email: ${email}`);
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        cart_id: user.cartId,
        fp: fingerprint
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.cookie('__secure', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000
    });

    logger.info(`🟢 Login exitoso: ${email} (rol: ${user.role})`);
    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    logger.error(`❌ Error al iniciar sesión (${email}): ${error.message}`);
    return res.status(500).json({ message: error?.message || '❌ Error al iniciar sesión' });
  }
};

// POST /forgot-password
export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'El correo es obligatorio' });

  try {
    await sendEmail(email);
    logger.info(`📧 Email de recuperación enviado a: ${email}`);
    return res.status(200).json({ message: '📧 Revisa tu correo para cambiar tu contraseña' });
  } catch (error) {
    logger.error(`❌ Error al enviar email a ${email}: ${error.message}`);
    const msg = typeof error === 'string' ? error : error.message || 'Error del servidor';
    return res.status(400).json({ message: msg });
  }
};

// GET /me
export const getMeController = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      logger.warn(`Usuario no encontrado: ${req.user.id}`);
      return res.status(404).json({ message: ' Usuario no encontrado' });
    }
    res.status(200).json({ user });
  } catch (error) {
    logger.error(`❌ Error al obtener usuario ${req.user.id}: ${error.message}`);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// /logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('__secure', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });
    logger.info(`🔴 Logout exitoso del usuario ${req.user?.id || 'desconocido'}`);
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    logger.error(`❌ Error al cerrar sesión: ${error.message}`);
    res.status(500).json({ message: 'Error al cerrar Sesion' });
  }
};

// Cambiar Contraseña
export const verifyResetTokenController = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    return res.status(200).json({ message: 'Token válido', email: decoded.email });
  } catch (error) {
    logger.warn(`Token inválido en reset password: ${error.message}`);
    return res.status(400).json({ message: 'El enlace para restablecer tu contraseña ya no es válido. Por favor, solicita uno nuevo.' });
  }
};

export const resetPasswordController = async (req, res) => {
  const { token, newPassword, newPasswordValidate } = req.body;

  if (!token) return res.status(400).json({ message: 'Token no proporcionado' });
  if (!newPassword || !newPasswordValidate) return res.status(400).json({ message: 'Debes enviar la nueva contraseña y su confirmación' });
  if (newPassword !== newPasswordValidate) return res.status(400).json({ message: 'Las contraseñas no coinciden' });

  try {
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    const email = decoded.email;

    const user = await findUserByEmailService(email);
    if (!user) {
      logger.warn(`Intento de reset password con usuario inexistente: ${email}`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await updateUserPasswordService(user.id, newPassword);
    logger.info(`🔑 Contraseña cambiada exitosamente para: ${email}`);

    return res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    logger.error(`❌ Error al resetear contraseña: ${error.message}`);
    return res.status(400).json({
      message: error.name === 'TokenExpiredError'
        ? 'El enlace ha expirado, solicita uno nuevo'
        : error.message || 'Error al restablecer la contraseña',
    });
  }
};
