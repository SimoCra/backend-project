// utils/verifyCaptcha.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const verifyCaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET; // <- asegúrate de tener esto en .env

  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
  );

  return res.data.success; // también puedes usar res.data.score si usas v3
};
