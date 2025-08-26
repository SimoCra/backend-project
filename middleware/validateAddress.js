// middlewares/validateAddress.js
import { body, validationResult } from 'express-validator';

export const validateAddress = [
  body('user_id')
    .isInt({ min: 1 }).withMessage('El ID de usuario debe ser un número entero positivo'),

  body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es obligatoria')
    .matches(/^[\w\s#\-,.°]+$/).withMessage('La dirección contiene caracteres no permitidos'),

  body('departamento')
    .optional()
    .trim()
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage('Departamento inválido'),

  body('ciudad')
    .optional()
    .trim()
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage('Ciudad inválida'),

  body('barrio')
    .optional()
    .trim()
    .matches(/^[\w\s]+$/).withMessage('Barrio inválido'),

  body('apartamento')
    .optional()
    .trim()
    .matches(/^[\w\s\-#]+$/).withMessage('Apartamento inválido'),

  body('indicaciones')
    .optional()
    .trim()
    .escape(),

  body('tipo_domicilio')
    .trim()
    .isIn(['residencia', 'laboral']).withMessage('Tipo de domicilio inválido'),

  body('nombre_contacto')
    .trim()
    .notEmpty().withMessage('El nombre del contacto es obligatorio')
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage('Nombre contiene caracteres inválidos'),

  body('celular_contacto')
    .trim()
    .matches(/^\d{10}$/).withMessage('El número de celular debe tener 10 dígitos'),

  // Middleware final para revisar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extracted = errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg
      }));
      return res.status(422).json({ errores: extracted });
    }
    next();
  }
];
