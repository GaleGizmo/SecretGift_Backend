import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "secretgift@gmail.com", 
    pass: "tu-contraseña-o-app-password", // Contraseña de aplicación de Google
  },
});

async function sendEmails(destinatario, asunto, mensaje) {
  try {
    const info = await transporter.sendMail({
      from: '"Amigo Invisible" <secretgift@gmail.com>',
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