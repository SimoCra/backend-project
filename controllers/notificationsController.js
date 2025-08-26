// controllers/notificationController.js
import {
  fetchNotifications,
  removeNotification
} from '../service/notificatonService.js';

import { markNotificationsAsReadByUser } from '../models/notificationsModel.js';
import logger from '../utils/logger.js';

/**
 * Obtiene las últimas 10 notificaciones para el usuario autenticado
 */
export const getNotificationsController = async (req, res) => {
  try {
    const userId = req.params.userId; // Ahora viene por params
    if (!userId) {
      return res.status(400).json({ message: 'User ID es requerido' });
    }

    // Validación de seguridad
    if (Number(req.user.id) !== Number(userId)) {
      return res.status(403).json({ message: 'No autorizado para ver estas notificaciones' });
    }

    const notifications = await fetchNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    logger.error(`❌ Error en getNotificationsController: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      message: 'Error al obtener notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Elimina una notificación por ID (solo si pertenece al usuario o es global)
 */
export const deleteNotificationController = async (req, res) => {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      return res.status(400).json({ message: 'ID de notificación es requerido' });
    }

    // Opcional: validar que la notificación pertenezca al usuario o sea global
    await removeNotification(notificationId);

    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    logger.error(`❌ Error en deleteNotificationController: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      message: 'Error al eliminar la notificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export const markNotificationsReadController = async (req, res) => {
  const userIdFromParams = req.params.userId;
  const authenticatedUserId = req.user.id;

  // Validación de seguridad
  if (parseInt(userIdFromParams) !== parseInt(authenticatedUserId)) {
    return res.status(403).json({ message: 'No autorizado para modificar estas notificaciones' });
  }

  try {
    await markNotificationsAsReadByUser(userIdFromParams);
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`❌ Error marcando notificaciones como leídas: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      message: 'Error marcando notificaciones como leídas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
