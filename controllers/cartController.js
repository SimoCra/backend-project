import {
  addToCart,
  deleteProduct,
  updateCartItem,
  getCartIdByUserId,
  getCartSummaryByUserId,
} from '../service/productService.js';
import logger from '../utils/logger.js'; // 👈 winston logger

// POST /add
export const addToCartController = async (req, res) => {
  const { cartId, productId, variantId, quantity } = req.body;

  if (!cartId || !productId || variantId == null || quantity == null) {
    logger.warn(`Intento inválido de agregar al carrito: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ message: 'Datos inválidos para agregar al carrito.' });
  }

  if (quantity <= 0) {
    logger.warn(`Cantidad inválida (${quantity}) para cartId=${cartId}, productId=${productId}`);
    return res.status(400).json({ message: 'La cantidad debe ser mayor que cero.' });
  }

  try {
    const result = await addToCart(cartId, productId, variantId, quantity);
    logger.info(`🛒 Producto agregado al carrito (cartId=${cartId}, productId=${productId}, variantId=${variantId}, qty=${quantity})`);
    res.json(result);
  } catch (error) {
    logger.error(`❌ Error en POST /cart/add: ${error.message}`);
    res.status(400).json({ message: error.message || 'Error al agregar producto al carrito' });
  }
};

// DELETE /:cartId/:productId
export const deleteProductFromCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId } = req.body;

    if (!productId || !variantId) {
      logger.warn(`Eliminar producto fallido: faltan productId o variantId. Body=${JSON.stringify(req.body)}`);
      return res.status(400).json({ message: 'Se requieren productId y variantId para eliminar del carrito.' });
    }

    const cartId = await getCartIdByUserId(userId);
    await deleteProduct(cartId, productId, Number(variantId));

    logger.info(`🗑️ Producto eliminado del carrito (userId=${userId}, cartId=${cartId}, productId=${productId}, variantId=${variantId})`);
    res.status(200).json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    logger.error(`❌ Error al eliminar producto del carrito (userId=${req.user?.id}): ${error.message}`);
    res.status(500).json({ message: error.message || 'Error al eliminar el producto del carrito' });
  }
};

// PUT /update/:cartItemId
export const updateCartItemController = async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    logger.warn(`Intento inválido de actualizar item (cartItemId=${cartItemId}, quantity=${quantity})`);
    return res.status(400).json({ message: 'Cantidad inválida.' });
  }

  try {
    const result = await updateCartItem(cartItemId, quantity);
    logger.info(`✏️ Item actualizado (cartItemId=${cartItemId}, nuevaCantidad=${quantity})`);
    res.json(result);
  } catch (error) {
    logger.error(`❌ Error en PUT /cart/update/${cartItemId}: ${error.message}`);
    res.status(500).json({ message: error.message || 'Error al actualizar el carrito.' });
  }
};

// GET /summary
export const getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await getCartSummaryByUserId(userId);

    logger.info(`📦 Resumen del carrito obtenido (userId=${userId})`);
    res.json(summary);
  } catch (error) {
    logger.error(`❌ Error al obtener resumen del carrito (userId=${req.user?.id}): ${error.message}`);
    res.status(500).json({ message: 'Error al obtener el resumen del carrito' });
  }
};
