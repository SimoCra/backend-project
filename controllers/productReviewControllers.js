// controllers/productReviewController.js
import { 
  addProductReview,
  fetchProductAverageRating,
  deleteReviewService,
  fetchProductReviews
} from "../service/productReviewService.js";

import logger from "../utils/logger.js";

// 📌 Crear reseña
export const createReviewController = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const user_id = req.user?.id;

  if (!product_id || !user_id || !rating) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    await addProductReview(product_id, user_id, rating, comment);
    logger.info(`✅ Reseña creada por usuario ${user_id} en producto ${product_id}`);
    res.status(201).json({ message: "Reseña creada exitosamente" });
  } catch (error) {
    logger.error(`❌ Error en createReviewController: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Error al crear la reseña" });
  }
};

// 📌 Obtener reseñas de un producto (con paginación)
export const getReviewsByProductController = async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!productId) {
    return res.status(400).json({ message: "Falta el ID del producto" });
  }

  try {
    const { reviews, total } = await fetchProductReviews(
      productId,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    logger.info(`📖 Reseñas obtenidas para producto ${productId} (page: ${page}, limit: ${limit})`);

    res.status(200).json({
      reviews,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (error) {
    logger.error(`❌ Error en getReviewsByProductController: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Error al obtener reseñas" });
  }
};

// 📌 Eliminar reseña (autor o admin)
export const deleteReviewController = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id;
  const isAdmin = req.user?.role === "admin";

  if (!id) {
    return res.status(400).json({ message: "Falta el ID de la reseña" });
  }

  try {
    const result = await deleteReviewService(id, user_id, isAdmin);

    if (!result) {
      logger.warn(`⚠️ Usuario ${user_id} intentó eliminar reseña ${id} sin permisos`);
      return res.status(403).json({ message: "No autorizado para eliminar esta reseña" });
    }

    logger.info(`🗑️ Reseña ${id} eliminada por usuario ${user_id} (${isAdmin ? "admin" : "autor"})`);
    res.status(200).json({ message: "Reseña eliminada correctamente" });

  } catch (error) {
    logger.error(`❌ Error en deleteReviewController: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Error al eliminar reseña" });
  }
};

// 📌 Obtener promedio de calificación de un producto
export const getProductAverageRatingController = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: "Falta el ID del producto" });
  }

  try {
    const stats = await fetchProductAverageRating(productId);
    logger.info(`⭐ Promedio de calificaciones obtenido para producto ${productId}`);
    res.status(200).json(stats); // { averageRating, totalReviews }
  } catch (error) {
    logger.error(`❌ Error en getProductAverageRatingController: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: "Error al obtener promedio de reseñas" });
  }
};
