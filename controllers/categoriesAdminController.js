import {
  getAllCategoriesService,
  addCategoryService,
  updateCategoryService,
  deleteCategoryService,
  getProductsByCategoryService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from '../service/categoriesAdminService.js';
import logger from '../utils/logger.js'; // 👈 winston centralizado

/**
 * Obtener todas las categorías con paginación
 */
export const getAllCategoriesController = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const categories = await getAllCategoriesService(Number(limit), Number(offset));

    logger.info(`📂 Categorías obtenidas (limit=${limit}, offset=${offset})`);

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    logger.error(`❌ Error al obtener categorías: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Error al obtener categorías' });
  }
};

/**
 * Crear una nueva categoría
 */
export const addCategoryController = async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      logger.warn(`⚠️ Intento inválido de crear categoría: ${JSON.stringify(req.body)}`);
      return res.status(400).json({ success: false, message: 'El código y el nombre son obligatorios' });
    }

    if (code.length !== 3) {
      return res.status(400).json({ success: false, message: 'El código debe tener exactamente 3 caracteres (ej: 003)' });
    }

    const image = req.file ? req.file.path : null;
    const newCategory = await addCategoryService(code, name, image);

    logger.info(`✅ Categoría creada: ${name} (code=${code})`);
    return res.status(201).json({ success: true, data: newCategory, message: 'Categoría creada exitosamente' });
  } catch (error) {
    logger.error(`❌ Error al crear categoría: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || 'Error al crear categoría' });
  }
};

/**
 * Actualizar categoría
 */
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    if (!id || !code || !name) {
      return res.status(400).json({ success: false, message: 'ID, código y nombre son obligatorios' });
    }

    const image = req.file ? req.file.path : null;
    const updatedCategory = await updateCategoryService(id, code, name, image);

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    logger.info(`✏️ Categoría actualizada (id=${id}, code=${code})`);
    return res.status(200).json({ success: true, data: updatedCategory, message: 'Categoría actualizada exitosamente' });
  } catch (error) {
    logger.error(`❌ Error al actualizar categoría: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || 'Error al actualizar categoría' });
  }
};

/**
 * Eliminar categoría
 */
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID es obligatorio' });
    }

    const deleted = await deleteCategoryService(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    logger.info(`🗑️ Categoría eliminada (id=${id})`);
    return res.status(200).json({ success: true, message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    logger.error(`❌ Error al eliminar categoría: ${error.message}`);
    return res.status(400).json({ success: false, message: error.message || 'Error al eliminar categoría' });
  }
};

/**
 * Obtener productos por categoría
 */
export const getProductsByCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID de la categoría es obligatorio' });
    }

    const products = await getProductsByCategoryService(id);
    logger.info(`📦 Productos obtenidos de categoría (id=${id})`);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    logger.error(`❌ Error al obtener productos de categoría: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Error al obtener productos de la categoría' });
  }
};

// ================== PRODUCTS ==================

/**
 * Obtener producto por ID
 */
export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID del producto es obligatorio' });
    }

    const product = await getProductByIdService(id);
    logger.info(`📌 Producto obtenido (id=${id})`);
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    logger.error(`❌ Error al obtener producto: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Error al obtener el producto' });
  }
};

/**
 * Actualizar producto
 */
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    if (!id || !productData) {
      return res.status(400).json({ success: false, message: 'ID y datos del producto son obligatorios' });
    }

    const result = await updateProductService(id, productData);
    logger.info(`✏️ Producto actualizado (id=${id})`);
    return res.status(200).json({ success: true, message: result.message || 'Producto actualizado correctamente' });
  } catch (error) {
    logger.error(`❌ Error al actualizar producto: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Error al actualizar el producto' });
  }
};

/**
 * Eliminar producto
 */
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'El ID del producto es obligatorio' });
    }

    const result = await deleteProductService(id);
    logger.info(`🗑️ Producto eliminado (id=${id})`);
    return res.status(200).json({ success: true, message: result.message || 'Producto eliminado correctamente' });
  } catch (error) {
    logger.error(`❌ Error al eliminar producto: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Error al eliminar el producto' });
  }
};
