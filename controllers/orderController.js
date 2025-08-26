// controllers/orderController.js
import {
  processCheckout,
  fetchUserOrders,
  fetchAllOrders,
  updateOrderStatus
} from '../service/orderService.js';

import {
  createAddress,
  getUserAddresses,
  getAddressById
} from '../service/addressService.js';

import { getUserById } from '../service/userService.js';
import { sendPurchaseConfirmationEmail } from '../utils/sendCode.js';
import logger from '../utils/logger.js';

/**
 * Procesa la compra (checkout) y devuelve la orden
 */
export const checkoutController = async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 ID del usuario autenticado
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "El ID de la dirección es requerido" });
    }

    // Procesar la orden
    const result = await processCheckout(userId, addressId);

    // Obtener datos del usuario
    const user = await getUserById(userId);
    if (!user?.email) {
      return res.status(400).json({ message: "El usuario no tiene un correo registrado" });
    }

    // Obtener dirección completa
    const address = await getAddressById(addressId);

    // Enviar correo de confirmación
    await sendPurchaseConfirmationEmail(user.email, {
      id: result.order.id,
      date: new Date(),
      total: result.order.total,
      address,
      items: result.order.items.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.variant_price,
        color: item.color,
        style: item.style,
        subtotal: item.variant_price * item.quantity
      }))
    });

    res.status(200).json({
      message: "Orden creada y correo enviado ✅",
      order: result.order
    });

  } catch (err) {
    logger.error(`❌ Error en checkoutController: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      message: "Error al procesar la compra",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Crea una nueva dirección para el usuario
 */
export const postAddress = async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      user_id: req.user.id,
    };

    const result = await createAddress(addressData);
    return res.status(201).json(result);
  } catch (error) {
    logger.error(`❌ Error en postAddress: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      message: "Error al crear dirección",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Obtiene todas las direcciones del usuario autenticado
 */
export const getAddressesByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await getUserAddresses(userId);
    res.status(200).json(addresses);
  } catch (error) {
    logger.error(`❌ Error en getAddressesByUser: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      message: "Error al obtener direcciones",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Obtiene las órdenes del usuario autenticado
 */
export const getUserOrdersController = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "No autorizado" });

  try {
    const orders = await fetchUserOrders(userId);
    res.status(200).json({ orders });
  } catch (err) {
    logger.error(`❌ Error en getUserOrdersController: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      message: "Error al obtener órdenes del usuario",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Obtiene todas las órdenes (solo admin)
 */
export const getAllOrdersController = async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin) return res.status(403).json({ message: "No autorizado" });

  try {
    const orders = await fetchAllOrders();
    res.status(200).json({ orders });
  } catch (err) {
    logger.error(`❌ Error en getAllOrdersController: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      message: "Error al obtener todas las órdenes",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Actualiza el estado de una orden (solo admin)
 */
export const updateOrderStatusController = async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin) return res.status(403).json({ message: "No autorizado" });

  const { orderId, newStatus } = req.body;
  if (!orderId || !newStatus) {
    return res.status(400).json({ message: "orderId y newStatus son requeridos" });
  }

  try {
    await updateOrderStatus(orderId, newStatus, req.user.id);
    res.status(200).json({ message: "Estado de la orden actualizado correctamente" });
  } catch (error) {
    logger.error(`❌ Error en updateOrderStatusController: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      message: "Error al actualizar el estado de la orden",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
