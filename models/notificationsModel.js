import db from '../config/db.js'

export const insertNotification = ({ user_id, title, message, is_global = false, type }) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO notifications (user_id, title, message, is_global, type, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    db.query(query, [user_id, title, message, is_global, type], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};


export const insertGlobalNotification = (title, message, type) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO notifications (user_id, title, message, is_global, type, created_at)
      VALUES (NULL, ?, ?, TRUE, ?, NOW())
    `;
    db.query(query, [title, message, type], (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
};

export const getNotificationsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        user_id,
        title,
        message,
        is_global,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE is_global = TRUE OR user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `;

    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export const deleteNotificationById = (notificationId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM notifications WHERE id = ?`;

    db.query(query, [notificationId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows); // Retorna cuántas filas fueron afectadas
    });
  });
};

 // tu conexión a DB

export const markNotificationsAsReadByUser = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ?
    `;

    db.query(query, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows); // número de filas actualizadas
    });
  });
};
