import dotenv from 'dotenv';
import mysql2 from 'mysql2';
dotenv.config(); 

const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});


export default db;