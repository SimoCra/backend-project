import { body, validationResult } from 'express-validator';

const containsDangerousChars = (str) => /[<>&"'`\\]/.test(str);

export const validateProduct = [
  // ID: debe ser 3 dígitos
  body('id')
    .notEmpty().withMessage('El ID del producto es obligatorio.')
    .matches(/^\d{3}$/).withMessage('El ID debe ser un número de 3 dígitos (ej: 001).'),

  // Nombre del producto
  body('name')
    .notEmpty().withMessage('El nombre del producto es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.')
    .custom(value => {
      if (/^\s|\s$/.test(value)) {
        throw new Error('El nombre no puede comenzar ni terminar con espacios.');
      }
      if (containsDangerousChars(value)) {
        throw new Error('El nombre contiene caracteres no permitidos (p.ej. < > & \' " \\ ).');
      }
      return true;
    }),

  // Descripción
  body('description')
    .notEmpty().withMessage('La descripción es obligatoria.')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres.')
    .custom(value => {
      if (containsDangerousChars(value)) {
        throw new Error('La descripción contiene caracteres no permitidos (p.ej. < > & \' " \\ ).');
      }
      return true;
    }),

  // Precio
  body('price')
    .notEmpty().withMessage('El precio es obligatorio.')
    .matches(/^\d+$/).withMessage('El precio debe ser un número entero positivo.')
    .custom(value => {
      if (parseInt(value) <= 0) {
        throw new Error('El precio debe ser mayor a 0.');
      }
      return true;
    }),

  // Stock
    body('stock')
    .notEmpty().withMessage('El stock es obligatorio.')
    .matches(/^\d+$/).withMessage('El stock debe ser un número entero positivo o cero.')
    .custom(value => {
      if (parseInt(value) < 0) {
        throw new Error('El stock no puede ser menor a 0.');
      }
      return true;
    }),

  // Categoría
  body('category')
    .notEmpty().withMessage('La categoría es obligatoria.')
    .matches(/^\d{3}$/).withMessage('La categoría debe ser un ID de 3 dígitos (ej: 001).'),

  // Solo muestra el primer error encontrado
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0].msg;
      return res.status(400).json({ message: first });
    }
    next();
  }
];



const badWords = [
  // Colombia
  'mierda', 'hijo de puta', 'pendejo', 'puto', 'puta', 'cabron', 'culero', 'mrk', 'mrka', 'marika',
  'marica', 'gonorrea', 'mamerto', 'zorra', 'chimba', 'verga', 'cojudo',
  'culiá', 'huevón', 'pajuo', 'chupapijas', 'malparido', 'gilipollas',

  // Otros países
  'idiota', 'imbécil', 'estúpido', 'tonto', 'bastardo', 'cabrón', 'tarado',
  'zopenco', 'malnacido', 'capullo'
];

// Función para detectar palabras ofensivas
const containsBadWords = (str) => {
  const lower = str.toLowerCase();
  return badWords.some(word => lower.includes(word));
};

// Validación de reseña
export const validateReview = [
  body('product_id')
    .notEmpty().withMessage('El ID del producto es obligatorio.')
    .isNumeric().withMessage('El ID del producto debe ser numérico.'),

  body('rating')
    .notEmpty().withMessage('El rating es obligatorio.')
    .isInt({ min: 1, max: 5 }).withMessage('El rating debe estar entre 1 y 5.'),

  body('comment')
    .notEmpty().withMessage('El comentario es obligatorio.')
    .isLength({ min: 3 }).withMessage('El comentario debe tener al menos 3 caracteres.')
    .custom(value => {
      if (/^\s|\s$/.test(value)) {
        throw new Error('El comentario no puede empezar ni terminar con espacios.');
      }
      if (containsDangerousChars(value)) {
        throw new Error('El comentario contiene caracteres no permitidos (p.ej. < > & \' " \\ ).');
      }
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/.test(value)) {
        throw new Error('El comentario solo puede contener letras y espacios.');
      }
      if (containsBadWords(value)) {
        throw new Error('Lenguaje inapropiado detectado en el comentario.');
      }
      return true;
    }),

  // Manejo de errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0].msg;
      return res.status(400).json({ message: first });
    }
    next();
  }
];