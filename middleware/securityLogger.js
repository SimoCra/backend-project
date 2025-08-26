import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
const logPath = path.join(logDir, 'admin-access.log');

// 🛠️ Asegurar que la carpeta logs exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const adminSecurityMiddleware = (req, res, next) => {
  const { user } = req;
  const ip = req.ip;
  const endpoint = req.originalUrl;
  const fingerprint = req.headers['x-client-fingerprint'] || 'sin fingerprint';
  const time = new Date().toISOString();

  if (!user || user.role !== 'admin') {
    const log = `[${time}] 🚫 BLOQUEADO | IP: ${ip} | Endpoint: ${endpoint} | Fingerprint: ${fingerprint} | Usuario: ${user?.email || 'anónimo'}\n`;
    fs.appendFileSync(logPath, log);
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const log = `[${time}] ✅ ACCESO | IP: ${ip} | Endpoint: ${endpoint} | Usuario: ${user.email}\n`;
  fs.appendFileSync(logPath, log);

  next();
};
