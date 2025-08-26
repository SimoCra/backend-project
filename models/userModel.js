import db from '../config/db.js';

// Básicas
export const insertUser = (name, email, phone, hashedPassword, role) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, role],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

export const checkEmailExists = (email) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const checkPhoneExists = (phone) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE phone = ?', [phone], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const insertImage = (userId, filePath) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO images (user_id, file_path) VALUES (?, ?)',
      [userId, filePath],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

export const createCartForUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO carts (user_id) VALUES (?)', [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const findUserByEmailOrPhone = (emailOrPhone) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM users WHERE email = ? OR phone = ?',
      [emailOrPhone, emailOrPhone],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });
};

export const findCartByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM carts WHERE user_id = ?',
      [userId],
      (err, cartResults) => {
        if (err) return reject(err);
        resolve(cartResults[0]);
      }
    );
  });
};

export const getUserDetailsById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.id, u.name, u.email, u.phone, u.role,
             c.id AS cart_id, i.file_path
      FROM users u
      LEFT JOIN carts c ON c.user_id = u.id
      LEFT JOIN images i ON u.id = i.user_id
      WHERE u.id = ?
    `;
    db.query(sql, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result[0]);
    });
  });
};

export const getAllUsersWithImages = (limit, offset) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT users.id, users.name, users.email, users.phone,
             images.file_path AS image
      FROM users
      LEFT JOIN images ON users.id = images.user_id
      LIMIT ? OFFSET ?
    `;
    db.query(query, [limit, offset], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


export const deleteUserCarts = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM carts WHERE user_id = ?', [userId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const deleteUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const updateUserBasicInfo = (id, email, name, phone) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE users SET email = ?, name = ?, phone = ? WHERE id = ?`;
    db.query(query, [email, name, phone, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Reset password
export const findUserIdByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};


// Dashboard
export const getDashboardStatsRaw = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) AS new_users_today,
        (SELECT SUM(quantity) FROM cart_items) AS total_cart_items,
        (SELECT COUNT(*) FROM products) AS total_products;

      SELECT 
        DATE(created_at) AS day, COUNT(*) AS count
        FROM users
        WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        GROUP BY day
        ORDER BY day;

      SELECT 
        p.name, SUM(ci.quantity) AS count
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        GROUP BY p.id
        ORDER BY count DESC
        LIMIT 5;
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


export const updatePasswordByUserId = (userId, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(query, [hashedPassword, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};



export const getUserEmailByIdentifier = (identifier) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT email 
      FROM users 
      WHERE email = ? OR phone = ? 
      LIMIT 1
    `;
    db.query(sql, [identifier, identifier], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null); // no existe
      resolve(results[0].email);
    });
  });
};


export const getUserDetailsByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};