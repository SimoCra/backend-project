// models/addressModel.js
import db from '../config/db.js'; // Tu conexión MySQL o PostgreSQL con .query estilo callback

export const insertAddress = (addressData) => {
  return new Promise((resolve, reject) => {
    const {
      user_id,
      direccion,
      departamento,
      ciudad,
      barrio,
      apartamento,
      indicaciones,
      tipo_domicilio,
      nombre_contacto,
      celular_contacto
    } = addressData;

    const query = `
      INSERT INTO addresses (
        user_id, direccion, departamento, ciudad, barrio,
        apartamento, indicaciones, tipo_domicilio,
        nombre_contacto, celular_contacto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      direccion,
      departamento,
      ciudad,
      barrio,
      apartamento,
      indicaciones,
      tipo_domicilio,
      nombre_contacto,
      celular_contacto
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId); // o result si quieres todo
    });
  });
};

export const getAddressesByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM addresses
      WHERE user_id = ?
      ORDER BY created_at DESC;
    `;

    db.query(query, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


// models/addressModel.js (ejemplo)
export const checkIfAddressExists = (addressData) => {
  return new Promise((resolve, reject) => {
    const { user_id, direccion, ciudad, tipo_domicilio } = addressData;

    const query = `
      SELECT id FROM addresses 
      WHERE user_id = ? AND direccion = ? AND ciudad = ? AND tipo_domicilio = ?
      LIMIT 1
    `;

    db.query(query, [user_id, direccion, ciudad, tipo_domicilio], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0); // true si ya existe
    });
  });
};


export const getAddressById = (addressId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM addresses
      WHERE id = ?
      LIMIT 1;
    `;

    db.query(query, [addressId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("Dirección no encontrada"));
      resolve(results[0]); // Devuelve un objeto único con direccion, ciudad, etc.
    });
  });
};