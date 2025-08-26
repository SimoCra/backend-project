import { getNotificationsByUserId, deleteNotificationById } from "../models/notificationsModel.js";

// Obtener notificaciones por userId
export const fetchNotifications = async (userId) => {
  try {
    const notifications = await getNotificationsByUserId(userId);
    return notifications;
  } catch (err) {
    console.error('❌ Error en fetchNotifications:', err);
    throw new Error('Error al obtener las notificaciones');
  }
};

// Eliminar notificación por ID (opcional: validar userId)
export const removeNotification = async (notificationId) => {
  try {
    const affectedRows = await deleteNotificationById(notificationId);
    if (affectedRows === 0) {
      throw new Error('Notificación no encontrada o ya eliminada');
    }
    return { success: true };
  } catch (err) {
    console.error('❌ Error en removeNotification:', err);
    throw new Error('Error al eliminar la notificación');
  }
};
