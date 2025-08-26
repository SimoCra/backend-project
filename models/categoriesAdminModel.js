// src/models/Category.js
import db from "../config/db.js";

// Obtener todas las categorías
export const getAllCategories = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM categories`;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Crear nueva categoría
export const createCategory = (name) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO categories (name) VALUES (?)`;
    db.query(query, [name], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name });
    });
  });
};

// Actualizar categoría
export const updateCategory = (id, name) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE categories SET name = ? WHERE id = ?`;
    db.query(query, [name, id], (err, result) => {
      if (err) return reject(err);
      resolve({ message: "Categoría actualizada" });
    });
  });
};

// Eliminar categoría
export const deleteCategory = (id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM categories WHERE id = ?`;
    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve({ message: "Categoría eliminada" });
    });
  });
};

// Obtener productos por categoría
export const getProductsByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.* 
      FROM products p
      WHERE p.category_id = ?
    `;
    db.query(query, [categoryId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};




// ---------------------------------------------------------

// Products up

// Obtener un producto por ID con sus variantes
export const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    // Consulta para obtener el producto
    const productQuery = `SELECT * FROM products WHERE id = ?`;

    db.query(productQuery, [id], (err, productResults) => {
      if (err) return reject(err);
      if (productResults.length === 0) return resolve(null);

      const product = productResults[0];

      // Obtener variantes del producto
      const variantsQuery = `SELECT * FROM product_variants WHERE product_id = ?`;

      db.query(variantsQuery, [id], (err, variantsResults) => {
        if (err) return reject(err);

        // Adjuntar variantes al producto
        product.variants = variantsResults || [];

        resolve(product);
      });
    });
  });
};

export const updateProduct = (id, productData) => {
  return new Promise((resolve, reject) => {
    const { name, description, price, stock, category_id, variants } = productData;

    // 1. Actualizar el producto principal
    const productQuery = `
      UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ? WHERE id = ?
    `;

    db.query(productQuery, [name, description, price, stock, category_id, id], (err) => {
      if (err) return reject(err);

      // 2. Obtener las variantes actuales en la BD para este producto
      const getCurrentVariantsQuery = `SELECT id FROM product_variants WHERE product_id = ?`;

      db.query(getCurrentVariantsQuery, [id], (err, currentVariantsResults) => {
        if (err) return reject(err);

        const currentVariantIds = currentVariantsResults.map(v => v.id);

        // 3. Extraer ids que vienen del cliente
        const incomingVariantIds = variants
          .filter(v => v.id) // sólo variantes con id definido (ya existentes)
          .map(v => v.id);

        // 4. Variantes a eliminar: las que están en BD pero no en la actualización
        const variantsToDelete = currentVariantIds.filter(
          existingId => !incomingVariantIds.includes(existingId)
        );

        // 5. Ejecutar eliminaciones si hay variantes a borrar
        const deleteVariants = () => {
          if (variantsToDelete.length === 0) return Promise.resolve();

          const deleteQuery = `DELETE FROM product_variants WHERE id IN (?)`;
          return new Promise((resolveDelete, rejectDelete) => {
            db.query(deleteQuery, [variantsToDelete], (err) => {
              if (err) rejectDelete(err);
              else resolveDelete();
            });
          });
        };

        // 6. Actualizar variantes existentes
        const updateVariants = () => {
          // Para cada variante con id, actualizar datos
          const updatePromises = variants
            .filter(v => v.id)
            .map(v => {
              return new Promise((resolveUpdate, rejectUpdate) => {
                const updateQuery = `
                  UPDATE product_variants SET color = ?, style = ?, price = ?, image_url = ?
                  WHERE id = ?
                `;
                db.query(updateQuery, [v.color, v.style, v.price, v.image_url || null, v.id], (err) => {
                  if (err) rejectUpdate(err);
                  else resolveUpdate();
                });
              });
            });
          return Promise.all(updatePromises);
        };

        // 7. Insertar variantes nuevas (sin id)
        const insertVariants = () => {
          const newVariants = variants.filter(v => !v.id);

          if (newVariants.length === 0) return Promise.resolve();

          const insertQuery = `
            INSERT INTO product_variants (product_id, color, style, price, image_url) VALUES ?
          `;

          const values = newVariants.map(v => [
            id,
            v.color,
            v.style,
            v.price,
            v.image_url || null
          ]);

          return new Promise((resolveInsert, rejectInsert) => {
            db.query(insertQuery, [values], (err) => {
              if (err) rejectInsert(err);
              else resolveInsert();
            });
          });
        };

        // Ejecutar todo en orden
        deleteVariants()
          .then(() => updateVariants())
          .then(() => insertVariants())
          .then(() => resolve({ message: "Producto y variantes actualizados correctamente" }))
          .catch(reject);
      });
    });
  });
};


// Eliminar producto (y sus variantes por ON DELETE CASCADE)
export const deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM products WHERE id = ?`;
    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve({ message: "Producto eliminado correctamente" });
    });
  });
};
