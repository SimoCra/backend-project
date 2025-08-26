// controllers/productController.js
import { createProduct, getProducts, getProductByName } from '../service/productService.js';
import { countAllProducts } from '../models/productModel.js';
import logger from '../utils/logger.js';

// POST /admin/create-product
export const createProductController = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  const { id, name, description, price, stock, category, variants } = req.body;

  // Validar campos obligatorios básicos
  if (!id || !name || !description || !price || stock === undefined || !category) {
    return res.status(400).json({ message: 'Llene todos los campos obligatorios' });
  }

  // Validar que variantes existan y sean JSON
  let parsedVariants;
  try {
    parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
  } catch (err) {
    return res.status(400).json({ message: 'Formato de variantes inválido' });
  }

  if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
    return res.status(400).json({ message: 'Debe enviar al menos una variante' });
  }

  // Convertir el stock a entero 1 o 0
  const stockBool = stock === 'true' || stock === '1' || stock === 1 || stock === true ? 1 : 0;

  // Validar cantidad de imágenes
  if (req.files.length !== parsedVariants.length) {
    return res.status(400).json({ message: 'La cantidad de imágenes debe coincidir con la cantidad de variantes' });
  }

  // Mapear variantes con imágenes
  const variantsWithImages = parsedVariants.map((variant, index) => ({
    color: variant.color,
    style: variant.style,
    price: parseInt(variant.price),
    image_url: `uploads/products/${req.files[index].filename}`
  }));

  try {
    await createProduct(id, category, name, description, price, stockBool, variantsWithImages);
    logger.info(`✅ Producto creado: ${name} (ID: ${id})`);
    return res.status(201).json({ message: 'Producto creado exitosamente' });
  } catch (error) {
    logger.error(`❌ Error en createProductController: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      message: 'Error al crear el producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /home/get-products-public
export const getPublicProductsController = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;

    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const offset = (pageInt - 1) * limitInt;

    const [products, total] = await Promise.all([
      getProducts(limitInt, offset), // ✅ incluye variantes con imagen_url
      countAllProducts()
    ]);

    const totalPages = Math.ceil(total / limitInt);

    logger.info(`📦 Productos obtenidos (page: ${pageInt}, limit: ${limitInt})`);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: pageInt,
        limit: limitInt,
        totalPages
      }
    });
  } catch (error) {
    logger.error(`❌ Error en getPublicProductsController: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      message: 'Error al obtener productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /home/get-product/:name
export const getProductByNameController = async (req, res) => {
  try {
    const product = await getProductByName(req.params.name); // ✅ incluye variants con imagen_url
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    logger.info(`🔍 Producto obtenido: ${req.params.name}`);
    res.json(product);
  } catch (error) {
    logger.error(`❌ Error en getProductByNameController: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      message: 'Error al obtener producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
