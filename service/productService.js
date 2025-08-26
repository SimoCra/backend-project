// ✅ services/productService.js
import {
  checkCategoryExists,
  checkProductExistsByIdOrName,
  insertProduct,
  insertProductVariants,
  selectAllProducts,
  selectProductByName,
  findCartItem,
  updateCartItemQuantity,
  insertCartItem,
  updateCartTimestamp,
  removeProductFromCart,
  modifyCartItemQuantity,
  getCartSummaryFromDB,
  findCartIdByUserId
} from '../models/productModel.js';

export const createProduct = async (id, category, name, description, price, stock, variants) => {
  const safePrice = parseInt(price);
  const safeStock = stock === '1' || stock === 1 || stock === true ? 1 : 0;

  // Validaciones previas
  const categoryExists = await checkCategoryExists(category);
  if (categoryExists.length === 0) throw new Error('La categoría especificada no existe.');

  const productExists = await checkProductExistsByIdOrName(id, name);
  if (productExists.length > 0) throw new Error('Ya existe un producto con este ID o nombre.');

  if (!Array.isArray(variants) || variants.length === 0) throw new Error('Debe enviar al menos una variante.');

  // Aquí el service solo orquesta llamadas a funciones que insertan producto y variantes.
  // La transacción debería manejarse externamente.
  await insertProduct(id, category, name, description, safePrice, safeStock);
  await insertProductVariants(id, variants);

  return {
    productId: id,
    variantsInserted: variants.length,
  };
};

const parseVariants = (variants) => {
  if (!variants) return [];
  if (typeof variants === 'string') {
    try {
      return JSON.parse(variants);
    } catch {
      // Si falla el parseo, devuelve un array vacío o el string tal cual
      return [];
    }
  }
  // Si ya es objeto/array, devuélvelo directamente
  return variants;
};



export const getProducts = async (limit, offset) => {
  const raw = await selectAllProducts(limit, offset);

  return raw.map((row) => ({
    id: row.product_id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: !!row.stock,
    category_id: row.category_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    variants: parseVariants(row.variants),
  }));
};

export const getProductByName = async (name) => {
  const result = await selectProductByName(name);
  if (result.length === 0) throw 'Producto no encontrado';

  const product = result[0];

  return {
    id: product.product_id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: !!product.stock,
    category_id: product.category_id,
    created_at: product.created_at,
    updated_at: product.updated_at,
    variants: parseVariants(product.variants),
  };
};



// services/cartService.js

export const addToCart = async (cartId, productId, variantId, quantity = 1) => {
  const existingItem = await findCartItem(cartId, productId, variantId);

  if (existingItem.length > 0) {
    await updateCartItemQuantity(existingItem[0].id, quantity);
  } else {
    await insertCartItem(cartId, productId, variantId, quantity);
  }

  updateCartTimestamp(cartId);

  return {
    message: existingItem.length > 0
      ? 'Cantidad actualizada en el carrito'
      : 'Producto agregado al carrito'
  };
};




export const deleteProduct = async (cartId, productId, variantId) => {
  const result = await removeProductFromCart(cartId, productId, variantId);
  if (result.affectedRows === 0) throw 'Producto no encontrado en el carrito.';
  
  updateCartTimestamp(cartId);
  return { message: 'Producto eliminado del carrito correctamente.' };
};


export const updateCartItem = async (cartItemId, newQuantity) => {
  const result = await modifyCartItemQuantity(cartItemId, newQuantity);
  if (result.affectedRows === 0) throw 'Producto no encontrado en el carrito.';
  return { message: 'Cantidad actualizada correctamente.' };
};

export const getCartSummaryByUserId = async (userId) => {
  const rawItems = await getCartSummaryFromDB(userId);

  if (rawItems.length === 0) {
    return {
      items: [],
      total: 0,
      totalUniqueItems: 0,
      totalQuantity: 0
    };
  }

  const total = rawItems[0].total;
  const totalUniqueItems = rawItems[0].total_unique_items;
  const totalQuantity = rawItems[0].total_quantity;

  const items = rawItems.map((row) => ({
    id: row.cart_item_id,
    cart_item_id: row.cart_item_id,
    quantity: row.quantity,
    productId: row.product_id,
    variantId: row.variant_id,
    name: row.product_name,
    color: row.color,
    style: row.style,
    price: row.variant_price,
    available: row.stock === 1,
    image: row.image_url,
    subtotal: row.subtotal
  }));

  return {
    items,
    total,
    totalUniqueItems,
    totalQuantity
  };
};


export const getCartIdByUserId = async (userId) => {
  const results = await findCartIdByUserId(userId);
  if (!results.length) {
    throw new Error('No se encontró carrito para el usuario');
  }
  return results[0].id;
};