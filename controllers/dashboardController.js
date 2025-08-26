import { getDashboardStatsService } from '../service/userService.js';
import logger from '../utils/logger.js'; // Asegúrate de importar tu logger

export const getDashboardStatsController = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Error obteniendo estadísticas del dashboard: ${error.message}`, {
      stack: error.stack,
    });

    res.status(500).json({
      message: 'Error al obtener estadísticas del dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
