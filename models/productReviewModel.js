// models/Review.js
import db from '../config/db.js';

// Insertar una nueva reseña
export const addReview = (productId, userId, rating, comment) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO product_reviews (product_id, user_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [productId, userId, rating, comment],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// Obtener reseñas de un producto
export const getProductReviews = (productId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    // 1️⃣ Sacamos las reseñas con paginación
    db.query(
      `SELECT pr.*, u.name AS user_name, u.email AS user_email
       FROM product_reviews pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.product_id = ?
       ORDER BY pr.created_at DESC
       LIMIT ? OFFSET ?`,
      [productId, limit, offset],
      (err, reviews) => {
        if (err) return reject(err);

        // 2️⃣ Contamos cuántas reseñas hay en total (sin paginación)
        db.query(
          `SELECT COUNT(*) AS total FROM product_reviews WHERE product_id = ?`,
          [productId],
          (err2, result) => {
            if (err2) return reject(err2);

            const total = result[0].total;

            resolve({
              reviews,
              total,
              page,
              limit,
            });
          }
        );
      }
    );
  });
};



// Eliminar una reseña (solo si pertenece al usuario)
export const getReviewById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM reviews WHERE id = ?", [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

export const deleteReviewService = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM reviews WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const getProductAverageRating = (productId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT AVG(rating) AS averageRating, COUNT(*) AS totalReviews 
       FROM product_reviews 
       WHERE product_id = ?`,
      [productId],
      (err, result) => {
        if (err) return reject(err);

        const row = result[0];
        resolve({
          averageRating: row.averageRating ? Number(row.averageRating) : null,
          totalReviews: row.totalReviews
        });
      }
    );
  });
};
