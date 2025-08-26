import {
  insertOrder,
  insertOrderItem,
  clearUserCart,
  getAllOrders,
  getUserOrders,
  updateOrderStatusQuery
} from "../models/orderModel.js";
import { insertNotification } from "../models/notificationsModel.js";
import {getCartSummaryFromDB} from '../models/productModel.js'

// Procesar el checkout (crear orden desde el carrito)
export const processCheckout = async (userId, addressId) => {
  try {
    // 1. Obtener resumen del carrito (con variantes incluidas)
    const cartItems = await getCartSummaryFromDB(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new Error("El carrito está vacío");
    }

    // 2. Calcular total
    const total = cartItems[0]?.total || 0;

    // 3. Crear la orden principal
    const orderId = await insertOrder(userId, total, addressId);

    // 4. Insertar cada ítem con su variante
    for (const item of cartItems) {
      // Validación de stock (opcional: puedes traer `stock` de la variante si lo manejas allí)
      if (item.quantity > item.stock) {
        throw new Error(`Stock insuficiente para el producto ${item.product_name}`);
      }

      await insertOrderItem(
        orderId,
        item.product_id,
        item.variant_id,
        item.quantity,
        item.variant_price
      );
    }

    // 5. Limpiar el carrito del usuario
    await clearUserCart(userId);

    await insertNotification({
          user_id: userId,
          title: 'Pedido recibido',
          message: `Tu pedido #${orderId} ha sido recibido y está en proceso.`,
          is_global: false,
          type: 'pedido'
        });

    // 6. Retornar respuesta exitosa
    return {
      message: "Orden creada exitosamente",
      order: {
        id: orderId,
        userId,
        total,
        items: cartItems,
        addressId,
      },
    };
  } catch (err) {
    console.error("❌ Error en processCheckout:", err);
    throw err;
  }
};

// Obtener órdenes de un usuario
export const fetchUserOrders = async (userId) => {
  try {
    const orders = await getUserOrders(userId);
    return orders;
  } catch (err) {
    console.error("❌ Error en fetchUserOrders:", err);
    throw new Error("Error al obtener los pedidos del usuario");
  }
};

// Obtener todas las órdenes (para el administrador)
export const fetchAllOrders = async () => {
  try {
    const orders = await getAllOrders();
    return orders;
  } catch (err) {
    console.error("❌ Error en fetchAllOrders:", err);
    throw new Error("Error al obtener todos los pedidos");
  }
};


export const updateOrderStatus = async (orderId, newStatus, userId) => {
  try {
    await updateOrderStatusQuery(orderId, newStatus);

    await insertNotification({
      user_id: userId,
      title: 'Pedido actualizado',
      message: `Tu pedido #${orderId} ha cambiado a estado "${newStatus}".`,
      is_global: false,
      type: 'pedido',
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error en updateOrderStatus:', error);
    throw new Error('Error al actualizar el estado del pedido');
  }
};