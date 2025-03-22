import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmails(destinatario, asunto, mensaje, gameCode, playerCode) {
  const msg = {
    to: destinatario,
    from: "secretgiftgame@gmail.com", 
    subject: asunto,
    text: mensaje,
    customArgs: {
      game_code: gameCode,
      player_code: playerCode,
    },
  };

  try {
    const response = await sgMail.send(msg);
    console.log("Correo enviado: " + response[0].statusCode);
    if (response[0].statusCode === 202) {
      return { status: "success", response: response[0].statusCode };
    } else {
      return { status: "error", error: "Correo no aceptado por el servidor del destinatario" };
    }
  } catch (error) {
    console.error("Error al enviar el correo: ", error);
    return { status: "error", error: error.message };
  }
}

export default sendEmails;



// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "secretgiftgame@gmail.com",
//     pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Google
//   },
// });

// async function sendEmails(destinatario, asunto, mensaje) {
//   try {
//     const info = await transporter.sendMail({
//       from: '"SecretGift" <secretgiftgame@gmail.com>',
//       to: destinatario,
//       subject: asunto,
//       text: mensaje,
//     });

//     console.log("Correo enviado: " + info.response);
//     if (info.accepted.length > 0) {
//       return { status: "success", response: info.response };
//     } else {
//       return { status: "error", error: "Correo no aceptado por el servidor del destinatario" };
//     }
//   } catch (error) {
//     console.error("Error al enviar el correo: ", error);
//     return { status: "error", error: error.message };
//   }
// }
// export default sendEmails;
