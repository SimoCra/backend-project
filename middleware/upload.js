import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Firmas HEX válidas 
const firmasPermitidas = [
  'ffd8ffe0', // JPG
  'ffd8ffe1', // JPG
  '89504e47'  // PNG
];

// Almacenamiento dinámico por ruta
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder;

    if (req.baseUrl.includes('/user')) {
      folder = 'uploads/users';
    } else if (req.baseUrl.includes('/products')) {
      folder = 'uploads/products';
    } else if (req.baseUrl.includes('/categories')) {
      folder = 'uploads/categories';
    } else {
      folder = 'uploads/others';
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

// Validar tipo MIME por cabecera
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes .jpg, .jpeg y .png'), false);
  }
};

//Multer con validación
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máx
});

// Función que debes usar después de upload:
export const validarFirmaHex = (req, res, next) => {
  const file = req.file;
  try {
    if (!file) return next();

    const buffer = fs.readFileSync(file.path);
    const firmaHex = buffer.subarray(0, 4).toString('hex');

    if (!firmasPermitidas.includes(firmaHex)) {
      fs.unlinkSync(file.path);
      console.log(`❌ Firma no válida: ${firmaHex} (${file.originalname})`);
      return res.status(400).send('Archivo con firma no válida');
    }

    console.log(`✅ Firma válida: ${firmaHex} (${file.originalname})`);
    next();
  } catch (error) {
    return res.status(500).send('Error al verificar la firma del archivo');
  }
};
