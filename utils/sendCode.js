// import nodemailer from 'nodemailer'
// import {google} from 'googleapis'
// import dotenv from 'dotenv'
// import crypto from 'crypto'
// import { resetPassword } from '../service/userService.js'
// dotenv.config()

// // Cuando vayamos a terminar proyecto crear email con el hosting, y hacer claves de acceso, client_id, secret_id, refresh_token-- santoralsagrado@gmail.com suponiendo

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URL
// );

// oAuth2Client.setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN
// });

// export async function sendEmail(correo) {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();
//     const codeUser = crypto.randomInt(100000, 1000000).toString();

//     await resetPassword(correo,codeUser)

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.ADMIN_EMAIL,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN ,
//         accessToken: accessToken?.token, 
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

    
//     const mailOptions = {
//       from: process.env.ADMIN_EMAIL,
//       to: correo, 
//       subject: 'Recuperacion de contraseña',
//       html: `<div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f7f7f7; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
//                 <div style="text-align: center; padding-bottom: 20px;">
//                     <img src="frontend/img/Logo.png" alt="Logo" style="height: 80px; object-fit: contain;" />
//                 </div>

//                 <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>

//                 <p style="color: #555; font-size: 16px;">
//                     Hola, hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este mensaje.
//                 </p>

//                 <p style="font-size: 16px; color: #555;">Tu código de verificación es:</p>

//                 <div style="background-color: #ffffff; border: 2px dashed #007BFF; color: #007BFF; font-size: 24px; text-align: center; padding: 15px; margin: 20px 0; border-radius: 6px;">
//                     <strong>${codeUser}</strong>
//                 </div>

//                 <p style="font-size: 14px; color: #888;">
//                     Este código expirará en 15 minutos por razones de seguridad.
//                 </p>

//                 <p style="font-size: 14px; color: #999; text-align: center; padding-top: 20px;">
//                     © 2025 Santoral Sagrado. Todos los derechos reservados.
//                 </p>
//                 </div>
// `,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {

//     throw new Error(error|| 'No se pudo enviar el correo');
//   }
// }

// export async function sendSecurityAlertEmail(message) {
//   try {
//     const transporter = await createTransporter();

//     const mailOptions = {
//       from: process.env.ADMIN_EMAIL,
//       to: process.env.ALERT_RECEIVER, // receptor fijo
//       subject: '🚨 Alerta de Seguridad – IP sospechosa',
//       text: message
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('📧 Alerta enviada por correo');
//   } catch (error) {
//     console.error('❌ Error al enviar alerta de seguridad:', error.message);
//   }
// }



// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';;
import { generateResetToken } from './resetToken.js';

dotenv.config();

// ✅ Transportador SMTP básico con contraseña de aplicación
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,          // Tu correo Gmail
    pass: process.env.ADMIN_EMAIL_PASS      // Contraseña de aplicación (NO tu contraseña normal)
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendSecurityAlertEmail(message, userEmail) {
  try {
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: userEmail, 
      cc: process.env.ADMIN_EMAIL,// aca ira el email del usuario, esto es temporal
      subject: '🚨 Alerta de Seguridad – IP sospechosa',
      text: message
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Alerta enviada por correo');
  } catch (error) {
    console.error('❌ Error al enviar alerta de seguridad:', error.message);
  }
}


export async function sendEmail(correo) {
  try {
    const token = generateResetToken(correo);
    const safeToken = encodeURIComponent(token); // codifica el token para que no se rompa en la URL
    const resetLink = `http://localhost:5173/reset-password/${safeToken}`;


    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: correo,
      subject: 'Restablecimiento de contraseña',
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f7f7f7; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px;">
            <img src="frontend/img/Logo.png" alt="Logo" style="height: 80px; object-fit: contain;" />
          </div>
          <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
          <p style="color: #555; font-size: 16px;">
            Hola, hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este mensaje.
          </p>
          <p style="font-size: 16px; color: #555;">Haz clic en el siguiente botón para cambiar tu contraseña:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Cambiar contraseña</a>
          </div>
          <p style="font-size: 14px; color: #888;">
            Este enlace expirará en 15 minutos por razones de seguridad.
          </p>
          <p style="font-size: 14px; color: #999; text-align: center; padding-top: 20px;">
            © 2025 Santoral Sagrado. Todos los derechos reservados.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error?.message || 'No se pudo enviar el correo');
  }
}


export async function sendPurchaseConfirmationEmail(correo, order) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    // Validar que order.total sea un número válido
    if (isNaN(Number(order.total))) {
      throw new Error("Total de orden inválido para envío de correo");
    }

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: correo,
      subject: "Confirmación de tu compra - Santoral Sagrado",
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f7f7f7; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px;">
            <img src="https://tu-dominio.com/logo.png" alt="Logo" style="height: 80px; object-fit: contain;" />
          </div>

          <h2 style="color: #333; text-align: center;">¡Gracias por tu compra!</h2>
          <p style="color: #555; font-size: 16px;">
            Hola, hemos recibido tu pedido correctamente. A continuación encontrarás los detalles:
          </p>

          <div style="background: #fff; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p><strong>Número de orden:</strong> ${order.id}</p>
            <p><strong>Fecha:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Total de la compra:</strong> $${Number(order.total).toFixed(2)}</p>
            <p><strong>Dirección de envío:</strong> 
              ${order.address?.direccion || ""}, 
              ${order.address?.ciudad || ""}, 
              ${order.address?.departamento || ""}
            </p>
          </div>

          <h3 style="margin-top: 20px; color: #333;">Productos comprados:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #eee; text-align: left;">
                <th style="padding: 8px;">Producto</th>
                <th style="padding: 8px;">Cantidad</th>
                <th style="padding: 8px;">Precio Unitario</th>
                <th style="padding: 8px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${Number(item.price).toFixed(2)}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h3 style="text-align: right; margin-top: 20px; color: #333;">
            Total: $${Number(order.total).toFixed(2)}
          </h3>

          <p style="margin-top: 20px; font-size: 16px; color: #555;">
            Te notificaremos cuando tu pedido sea enviado.<br/>
            Gracias por confiar en <strong>Santoral Sagrado</strong>.
          </p>

          <p style="font-size: 14px; color: #999; text-align: center; padding-top: 20px;">
            © 2025 Santoral Sagrado. Todos los derechos reservados.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error?.message || "No se pudo enviar el correo de confirmación de compra");
  }
}