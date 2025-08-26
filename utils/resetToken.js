import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config()



export function generateResetToken(email) {
  return jwt.sign({ email }, process.env.RESET_SECRET, { expiresIn: '15m' });
}
