import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { sendSecurityAlertEmail } from '../utils/sendCode.js';
import { findUserEmail } from '../service/userService.js';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Mapeo de razones a rutas de logs

// 📊 Revisa si una IP fue bloqueada más de 10 veces en 1 hora en el archivo dado
const checkIpAbuse = (ip, nowISO, filePath, userEmail) => {
  try {
    const oneHourAgo = new Date(new Date(nowISO).getTime() - 60 * 60 * 1000);
    const logData = fs.readFileSync(filePath, 'utf-8');
    const lines = logData.split('\n');

    let count = 0;
    for (const line of lines) {
      if (line.includes(`IP: ${ip}`)) {
        const match = line.match(/^\[(.*?)\]/);
        if (match) {
          const logTime = new Date(match[1]);
          if (logTime >= oneHourAgo) {
            count++;
          }
        }
      }
    }

    if (count >= 6 && userEmail) {
      const alert = `[${nowISO}] 🚨 ALERTA: IP sospechosa ${ip} con ${count} bloqueos en 1 hora. Usuario: ${userEmail}\n`;
      console.warn(alert);
      fs.appendFileSync(path.join(logDir, 'alerts.log'), alert);

      sendSecurityAlertEmail(alert, userEmail);
    }
  } catch (err) {
    console.error('Error al verificar IP abusiva:', err.message);
  }
};


// Rate limiter para login
export const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 200, // 5 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res, next) => {
    const ip = req.ip;
    const fingerprint = req.headers['x-client-fingerprint'] || 'sin fingerprint';
    const time = new Date().toISOString();
    const endpoint = req.originalUrl;
    const email = req.body?.email

    const retryAfterMs = req.rateLimit?.resetTime
      ? new Date(req.rateLimit.resetTime) - new Date()
      : 10 * 60 * 1000; // fallback por si no existe

    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);

    const userEmail = await findUserEmail(email);

    // Log como antes
    const logLine = `[${time}] 🔒 Bloqueado (login) | IP: ${ip} | Endpoint: ${endpoint} | Fingerprint: ${fingerprint} | Espera: ${retryAfterSeconds}s\n`;
    fs.appendFileSync(path.join(logDir, 'login-rate-limit.log'), logLine);

    // Verificar si es IP abusiva
    checkIpAbuse(ip, time, path.join(logDir, 'login-rate-limit.log'), userEmail);

    // Enviar respuesta clara
    res.status(429).json({
      message: `Demasiados intentos. Debes esperar ${retryAfterMinutes} minuto(s) antes de volver a intentarlo.`,
      retry_after_seconds: retryAfterSeconds
    });
  },
});


const logBlockedAttempt = (req, reason) => {
  const ip = req.ip;
  const fingerprint = req.headers['x-client-fingerprint'] || 'sin fingerprint';
  const userAgent = req.headers['user-agent'] || 'sin user-agent';
  const time = new Date().toISOString();
  const endpoint = req.originalUrl;

  const logFileMap = {
    'login': path.join(logDir, 'login-rate-limit.log'),
    'forgot-password': path.join(logDir, 'forgot-password-rate-limit.log'),
  };

  const logPath = logFileMap[reason] || path.join(logDir, 'rate-limit.log');

  const logLine = `[${time}] 🔒 Bloqueado (${reason}) | IP: ${ip} | Endpoint: ${endpoint} | Fingerprint: ${fingerprint} | UA: ${userAgent}\n`;
  fs.appendFileSync(logPath, logLine);

  checkIpAbuse(ip, time, logPath);
};


// Rate limiter para forgot-password
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes para recuperar contraseña.',
  handler: (req, res, next) => {
    logBlockedAttempt(req, 'forgot-password');
    res.status(429).json({ message: 'Demasiadas solicitudes para recuperar contraseña.' });
  },
});
