import { body, validationResult } from 'express-validator';

export const validateRegister = [
  // 🧑‍🦱 Nombre
  body('name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .custom(value => {
      if (/^\s/.test(value)) throw new Error('El nombre no puede comenzar con espacios');
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(value)) throw new Error('Nombre inválido');
      if (/[<>"'\/\\&]/.test(value)) throw new Error('El nombre contiene caracteres peligrosos');
      return true;
    }),

  // 📧 Email
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido')
    .custom(value => {
      if (/[<>"'\/\\&]/.test(value)) throw new Error('El email contiene caracteres peligrosos');
      return true;
    }),

  // 📞 Teléfono
  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .isLength({ min: 10, max: 10 }).withMessage('El número de teléfono debe tener exactamente 10 dígitos')
    .matches(/^\d+$/).withMessage('Solo se permiten números')
    .custom(value => {
      if (/[<>"'\/\\&]/.test(value)) throw new Error('El teléfono contiene caracteres peligrosos');
      return true;
    }),

  // 🔐 Contraseña
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una letra mayúscula')
    .matches(/[a-z]/).withMessage('Debe contener al menos una letra minúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número')
    .matches(/[!@#$%^&*()_+\-=\[\]{};:\\|,.?]/).withMessage('Debe contener al menos un carácter especial')
    .custom(value => {
      if (/[ñÑáéíóúÁÉÍÓÚ\s]/.test(value)) throw new Error("No se permiten 'ñ', tildes ni espacios en la contraseña");
      if (/[<>"'\/\\&]/.test(value)) throw new Error('La contraseña contiene caracteres peligrosos');
      return true;
    }),

  // ✅ Confirmación de contraseña
  body('validatePassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Las contraseñas no coinciden');
      if (/[<>"'\/\\&]/.test(value)) throw new Error('La confirmación contiene caracteres peligrosos');
      return true;
    }),

  // 🎯 Manejador de errores: SOLO MUESTRA EL PRIMERO
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ message: firstError });
    }
    next();
  }
];

export const validateLogin = [
  // 📧 Email o Teléfono
  body('email')
    .notEmpty().withMessage('El correo o número de teléfono es obligatorio')
    .custom(value => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value);
      const isPhone = /^[0-9]{10}$/.test(value);

      if (!isEmail && !isPhone) {
        throw new Error('Debe ingresar un email válido o un número telefónico');
      }

      if (/[<>"'\/\\&]/.test(value)) {
        throw new Error('El campo contiene caracteres peligrosos');
      }

      return true;
    }),

  // 🔐 Contraseña
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .custom(value => {
      if (/[<>"'\/\\&]/.test(value)) {
        throw new Error('Contraseña inválida: contiene caracteres no permitidos');
      }
      return true;
    }),

  // 🎯 Manejador de errores: SOLO MUESTRA EL PRIMERO
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ message: firstError });
    }
    next();
  }
];



export const validateForgotPassword = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El formato del email no es válido')
    .custom(value => {
      if (/[<>"'\/\\&]/.test(value)) {
        throw new Error('El email contiene caracteres peligrosos');
      }
      return true;
    }),

  // Manejador: solo muestra el primer error
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ message: firstError });
    }
    next();
  }
];


export const validateResetPassword = [
  // Token obligatorio
  body('token')
    .notEmpty()
    .withMessage('Token es obligatorio'),

  // Nueva contraseña con validaciones estrictas
  body('newPassword')
    .notEmpty()
    .withMessage('Nueva contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('Debe contener al menos una letra mayúscula')
    .matches(/[a-z]/)
    .withMessage('Debe contener al menos una letra minúscula')
    .matches(/[0-9]/)
    .withMessage('Debe contener al menos un número')
    .matches(/[!@#$%^&*()_+\-=\[\]{};:\\|,.?]/)
    .withMessage('Debe contener al menos un carácter especial')
    .custom(value => {
      if (/[ñÑáéíóúÁÉÍÓÚ\s]/.test(value)) throw new Error("No se permiten 'ñ', tildes ni espacios en la contraseña");
      if (/[<>"'\/\\&]/.test(value)) throw new Error('La contraseña contiene caracteres peligrosos');
      return true;
    }),

  // Confirmación de contraseña
  body('newPasswordValidate')
    .notEmpty()
    .withMessage('Debes confirmar tu contraseña')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error('Las contraseñas no coinciden');
      if (/[<>"'\/\\&]/.test(value)) throw new Error('La confirmación contiene caracteres peligrosos');
      return true;
    }),

  // Middleware para devolver errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  }
];