import db from "../config/db.js";
import { addReview, getProductAverageRating, getProductReviews } from "../models/productReviewModel.js";


// 📌 Obtener reseña individual
export const getReviewById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM product_reviews WHERE id = ?", [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};


// 📌 Crear reseña
export const addProductReview = async (productId, userId, rating, comment) => {
  if (!productId || !userId || !rating) return null;

  try {
    const review = await addReview(productId, userId, rating, comment);
    return review;
  } catch (error) {
    console.error("❌ Error creando reseña:", error);
    return null;
  }
};


// 📌 Obtener reseñas con paginación
export const fetchProductReviews = async (productId, page = 1, limit = 10) => {
  if (!productId) return [];

  try {
    const reviews = await getProductReviews(productId, page, limit);
    return reviews;
  } catch (error) {
    console.error("❌ Error obteniendo reseñas:", error);
    return [];
  }
};


// 📌 Eliminar reseña (usuario solo la suya, admin cualquiera)
export const deleteReviewService = async (reviewId, userId, isAdmin = false) => {
  if (!reviewId || !userId) return false;

  try {
    const review = await getReviewById(reviewId);

    if (!review) return false;

    // Validar permisos
    if (!isAdmin && review.user_id !== userId) {
      return false; // Usuario no autorizado
    }

    // Eliminar reseña
    return new Promise((resolve, reject) => {
      db.query("DELETE FROM product_reviews WHERE id = ?", [reviewId], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });

  } catch (error) {
    console.error("❌ Error eliminando reseña:", error);
    return false;
  }
};


// 📌 Obtener promedio de calificación
export const fetchProductAverageRating = async (productId) => {
  if (!productId) return { averageRating: 0, totalReviews: 0 };

  try {
    const stats = await getProductAverageRating(productId);
    return stats;
  } catch (error) {
    console.error("❌ Error obteniendo promedio:", error);
    return { averageRating: 0, totalReviews: 0 };
  }
};
