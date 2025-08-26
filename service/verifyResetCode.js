import bcrypt from 'bcryptjs';
import { getResetCodeByEmail} from '../models/resetCodeModel.js';
import { getUserByEmail } from '../models/userModel.js';

export const verifyResetCode = async (email, code) => {
  const resetEntry = await getResetCodeByEmail(email);

  if (!resetEntry) {
    throw new Error('Código no encontrado o ya expirado');
  }

  const now = new Date();
  const expires = new Date(resetEntry.reset_code_expires);
  if (now > expires) {
    throw new Error('El código ha expirado');
  }

  const isValid = await bcrypt.compare(code, resetEntry.reset_code);
  if (!isValid) {
    throw new Error('Código incorrecto');
  }

  const user = await getUserByEmail(email);
  return user.id;
};
