import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from './utils/logger.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productsRoutes from './routes/products.routes.js';
import cartRoutes from './routes/cart.routes.js';
import authDashboard from './routes/authDashboard.routes.js';
import ordersRoutes from './routes/orders.routes.js'
import categoriesAdminRoutes from './routes/categoriesAdmin.routes.js'
import notificationRoutes from './routes/notificationRoutes.js'
// Cronjobs


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadApp() {
  const app = express();

  // Middlewares globales
  app.use(cors({ 
    origin: 'http://localhost:5173',
    credentials: true }));
  app.use(
    helmet({
      hidePoweredBy: true,
      contentSecurityPolicy: false, // ⚠️ lo desactivo si usas React/Vite para no romper carga de scripts
    })
  );

  // Mostrar cabeceras de seguridad aplicadas por helmet
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log('🔐 Cabeceras de seguridad aplicadas:');
      const headers = res.getHeaders();
      // Filtrar solo las que son de seguridad (empiezan con x- o relacionadas)
      const securityHeaders = Object.fromEntries(
        Object.entries(headers).filter(([key]) =>
          [
            'x-',
            'strict-',
            'content-',
            'cross-',
            'referrer',
            'origin',
            'permissions',
          ].some((prefix) => key.startsWith(prefix))
        )
      );
      console.log(securityHeaders);
    });
    next();
  });

  app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});
  app.use(bodyParser.json());
  app.use(cookieParser());

  // Archivos estáticos
  app.use('/uploads', express.static(join(__dirname, '/uploads')));

  // Servir frontend estático (build de Vite)
  // Rutas API
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/dashboard', authDashboard);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/admin/categories', categoriesAdminRoutes);
  app.use('/api/notifications', notificationRoutes);

  return app;
}