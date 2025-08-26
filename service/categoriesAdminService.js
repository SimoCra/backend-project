import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct
} from '../models/categoriesAdminModel.js';

/**
 * Obtener todas las categorías con paginación
 */
export const getAllCategoriesService = async (limit = 20, offset = 0) => {
  try {
    return await getAllCategories(limit, offset);
  } catch (error) {
    console.error('Error al obtener categorías:', error.message);
    throw new Error('No se pudieron obtener las categorías');
  }
};

/**
 * Agregar nueva categoría con validación de duplicados
 */
export const addCategoryService = async (code, name, image) => {
  if (!code || code.trim() === '') {
    throw new Error('El código de la categoría es obligatorio');
  }
  if (!name || name.trim() === '') {
    throw new Error('El nombre de la categoría es obligatorio');
  }

  try {
    return await createCategory(code.trim(), name.trim(), image || null);
  } catch (error) {
    console.error('Error al agregar categoría:', error.message);
    throw new Error(error.message || 'No se pudo agregar la categoría');
  }
};

/**
 * Actualizar categoría con validación de duplicados
 */
export const updateCategoryService = async (id, code, name, image) => {
  if (!id) throw new Error('El ID de la categoría es requerido');
  if (!code || code.trim() === '') throw new Error('El código es obligatorio');
  if (!name || name.trim() === '') throw new Error('El nombre es obligatorio');

  try {
    return await updateCategory(id, code.trim(), name.trim(), image || null);
  } catch (error) {
    console.error('Error al actualizar categoría:', error.message);
    throw new Error(error.message || 'No se pudo actualizar la categoría');
  }
};

/**
 * Eliminar categoría
 */
export const deleteCategoryService = async (id) => {
  if (!id) throw new Error('El ID de la categoría es requerido');

  try {
    return await deleteCategory(id);
  } catch (error) {
    console.error('Error al eliminar categoría:', error.message);
    throw new Error('No se pudo eliminar la categoría');
  }
};

/**
 * Obtener productos de una categoría específica
 */
export const getProductsByCategoryService = async (categoryId) => {
  if (!categoryId) throw new Error('El ID de la categoría es requerido');

  try {
    return await getProductsByCategory(categoryId);
  } catch (error) {
    console.error('Error al obtener productos de la categoría:', error.message);
    throw new Error('No se pudieron obtener los productos de la categoría');
  }
};


//  Products

export const getProductByIdService = async (id) => {
  if (!id) throw new Error('El ID del producto es requerido');

  try {
    const product = await getProductById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  } catch (error) {
    console.error('Error al obtener el producto:', error.message);
    throw new Error('No se pudo obtener el producto');
  }
};

export const updateProductService = async (id, productData) => {
  if (!id) throw new Error('El ID del producto es requerido');
  if (!productData) throw new Error('Datos del producto son requeridos');

  try {
    const result = await updateProduct(id, productData);
    return result;
  } catch (error) {
    console.error('Error al actualizar el producto:', error.message);
    throw new Error('No se pudo actualizar el producto');
  }
};

export const deleteProductService = async (id) => {
  if (!id) throw new Error('El ID del producto es requerido');

  try {
    const result = await deleteProduct(id);
    return result;
  } catch (error) {
    console.error('Error al eliminar el producto:', error.message);
    throw new Error('No se pudo eliminar el producto');
  }
};

