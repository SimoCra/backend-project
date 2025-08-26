import db from '../config/db.js';


export const checkCategoryExists = (categoryId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id FROM categories WHERE id = ?', [categoryId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const checkProductExistsByIdOrName = (id, name) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id FROM products WHERE id = ? OR name = ?', [id, name], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const insertProduct = (id, category, name, description, price, stock) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO products (id, category_id, name, description, price, stock)
      VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [id, category, name, description, price, stock], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Función para insertar variantes SIN stock
export const insertProductVariants = (productId, variants) => {
  /*
    variants = [
      { color: 'dorado', style: 'crucero', price: 500, image_url: 'img1.jpg' },
      { color: 'plateado', style: '5_medallas', price: 550, image_url: 'img2.jpg' },
      ...
    ]
  */
  const values = variants.map(v => [productId, v.color, v.style, v.price, v.image_url]);

  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO product_variants (product_id, color, style, price, image_url)
      VALUES ?`;
    db.query(query, [values], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Función para insertar imágenes adicionales del producto (opcional

export const selectAllProducts = (limit, offset) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.category_id,
        p.created_at,
        p.updated_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id,
            'color', pv.color,
            'style', pv.style,
            'price', pv.price,
            'image_url', pv.image_url
          )
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [limit, offset], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


export const countAllProducts = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) AS total FROM products';
    db.query(query, (err, result) => {
      if (err) return reject(err);
      resolve(result[0].total);
    });
  });
};

export const selectProductByName = (name) => {
  return new Promise((resolve, reject) => {
    const decoded = decodeURIComponent(name).replace(/-/g, ' ');
    const query = `
      SELECT 
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.category_id,
        p.created_at,
        p.updated_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', pv.id,
            'color', pv.color,
            'style', pv.style,
            'price', pv.price,
            'image_url', pv.image_url
          )
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE LOWER(p.name) = ?
      GROUP BY p.id
      LIMIT 1
    `;

    db.query(query, [decoded.toLowerCase()], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};



// CART


export const findCartItem = (cartId, productId, variantId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, quantity 
       FROM cart_items 
       WHERE cart_id = ? AND product_id = ? AND variant_id = ?`,
      [cartId, productId, variantId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};


export const updateCartItemQuantity = (cartItemId, quantity) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE cart_items 
       SET quantity = quantity + ? 
       WHERE id = ?`,
      [quantity, cartItemId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};


export const insertCartItem = (cartId, productId, variantId, quantity) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO cart_items (cart_id, product_id,  quantity,variant_id) VALUES (?, ?, ?, ?)`,
      [cartId, productId, quantity,variantId ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

export const updateCartTimestamp = (cartId) => {
  const query = 'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.query(query, [cartId], () => {}); // silencioso
};


export const removeProductFromCart = (cartId, productId, variantId) => {
  return new Promise((resolve, reject) => {
    console.log('Eliminar producto:', { cartId, productId, variantId });
    db.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ? AND variant_id = ?',
      [cartId, productId, variantId],
      (err, result) => {
        if (err) {
          console.error('Error en delete query:', err);
          return reject(err);
        }
        resolve(result);
      }
    );
  });
};


export const modifyCartItemQuantity = (cartItemId, newQuantity) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, cartItemId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};



// models/cartModel.js
export const getCartSummaryFromDB = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
    SELECT 
      ci.id AS cart_item_id,
      ci.quantity,
      p.id AS product_id,
      p.name AS product_name,
      p.price AS base_price,
      p.stock,
      pv.id AS variant_id,
      pv.color,
      pv.style,
      pv.price AS variant_price,
      pv.image_url,
      (ci.quantity * pv.price) AS subtotal,
      (
        SELECT SUM(ci2.quantity * pv2.price)
        FROM carts c2
        JOIN cart_items ci2 ON c2.id = ci2.cart_id
        JOIN product_variants pv2 ON ci2.variant_id = pv2.id
        WHERE c2.user_id = ?
      ) AS total,
      (
        SELECT COUNT(*)
        FROM cart_items ci3
        JOIN carts c3 ON ci3.cart_id = c3.id
        WHERE c3.user_id = ?
      ) AS total_unique_items,
      (
        SELECT SUM(ci4.quantity)
        FROM cart_items ci4
        JOIN carts c4 ON ci4.cart_id = c4.id
        WHERE c4.user_id = ?
      ) AS total_quantity
    FROM carts c
    JOIN cart_items ci ON c.id = ci.cart_id
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_variants pv ON ci.variant_id = pv.id
    WHERE c.user_id = ?
    `;

    db.query(query, [userId, userId, userId, userId], (err, results) => {
      if (err) {
        console.error('Error en getCartSummaryFromDB:', err);
        return reject('Error al obtener el resumen del carrito');
      }

      resolve(results);
    });
  });
};


export const findCartIdByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM carts WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results); // retornamos el arreglo tal cual, sin lógica aquí
    });
  });
};
