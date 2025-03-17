import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
console.log("GMAIL password:", process.env.GMAIL_APP_PASSWORD);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "secretgiftgame@gmail.com", 
    pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Google
  },
});

async function sendEmails(destinatario, asunto, mensaje) {
  try {
    const info = await transporter.sendMail({
      from: '"Amigo Invisible" <secretgiftgame@gmail.com>',
      to: destinatario,
      subject: asunto,
      text: mensaje,
    });

    console.log("Correo enviado: " + info.response);
  } catch (error) {
    console.error("Error al enviar el correo: ", error);
  }
}
export default sendEmails;