import { loadApp } from './app.js';
import db from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Conexión a la base de datos y arranque del servidor
db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    process.exit(1);
  }

  console.log('✅ << Conectado a la base de datos >>');

  const app = loadApp();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  });
});
