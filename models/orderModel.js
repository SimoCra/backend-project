import db from '../config/db.js';

export const insertOrder = async (userId, total, addressId) => {
  try {
    const orderId = await new Promise((resolve, reject) => {
      const query = `
        INSERT INTO orders (user_id, total, status, created_at, direccion)
        VALUES (?, ?, 'pendiente', NOW(), ?)
      `;
      db.query(query, [userId, total, addressId], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });

    return orderId;
  } catch (error) {
    throw error;
  }
};


// Insertar productos en la orden (con variante)
export const insertOrderItem = (orderId, productId, variantId, quantity, price) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [orderId, productId, variantId, quantity, price], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Limpiar el carrito del usuario tras la orden
export const clearUserCart = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = ?
    `;
    db.query(query, [userId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// [OBSOLETO] Solo devuelve productos sin variantes (opcional: puedes eliminar)
export const getCartItemsWithDetails = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.id as product_id, 
        p.name, 
        ci.quantity, 
        p.price
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = ?
    `;
    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Obtener órdenes del usuario con variante incluida
export const getUserOrders = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.id AS order_id,
        o.total,
        o.status,
        o.created_at,
        oi.product_id,
        p.name AS product_name,
        oi.variant_id,
        pv.color,
        pv.style,
        pv.image_url,
        oi.quantity,
        oi.price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Obtener todas las órdenes (para admin), con variantes opcionales
export const getAllOrders = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        o.id AS order_id,
        u.name AS user_name,
        u.email AS user_email,
        CONCAT(
          a.direccion, ', ',
          a.barrio, ', ',
          a.ciudad, ', ',
          a.departamento,
          IF(a.apartamento IS NOT NULL AND a.apartamento != '', CONCAT(' Apt ', a.apartamento), '')
        ) AS full_address,
        o.total,
        o.status,
        o.created_at AS order_created_at,
        GROUP_CONCAT(
          CONCAT(
            p.name,
            IF(pv.color IS NOT NULL, CONCAT(' (', pv.color, ', ', pv.style, ')'), ''),
            ' x', oi.quantity
          )
          SEPARATOR ' | '
        ) AS products
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.direccion = a.id
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    `;
    
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


export const updateOrderStatusQuery = (orderId, newStatus) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE orders SET status = ? WHERE id = ?`;
    db.query(query, [newStatus, orderId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
