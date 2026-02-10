import nodemailer from "nodemailer";

/**
 * Crea el transporter de nodemailer según variables de entorno.
 * En desarrollo sin SMTP configurado, usa ethereal (test) o solo loguea.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port: parseInt(port, 10) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }

  // Sin SMTP: en desarrollo devolver null y el controlador hará log del link
  return null;
}

/**
 * Envía email de verificación al usuario.
 * @param {string} to - Email del usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} verificationUrl - URL completa para verificar (incluye token)
 * @returns {Promise<{ sent: boolean, error?: string }>}
 */
export async function sendVerificationEmail(to, nombre, verificationUrl) {
  const transporter = getTransporter();
  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    "noreply@bachesrosario.com";

  const mailOptions = {
    from: `Baches Rosario <${from}>`,
    to,
    subject: "Verifica tu cuenta - Baches Rosario",
    html: `
      <h2>Hola ${nombre}</h2>
      <p>Gracias por registrarte en Baches Rosario.</p>
      <p>Para activar tu cuenta, hacé clic en el siguiente enlace (válido por 24 horas):</p>
      <p><a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background:#3498db;color:#fff;text-decoration:none;border-radius:5px;">Verificar mi cuenta</a></p>
      <p>Si no creaste esta cuenta, podés ignorar este correo.</p>
      <p>— Baches Rosario</p>
    `,
    text: `Hola ${nombre}. Verificá tu cuenta entrando a: ${verificationUrl}`,
  };

  if (!transporter) {
    console.log(
      "[EMAIL] SMTP no configurado. Link de verificación (copiar en desarrollo):"
    );
    console.log(verificationUrl);
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    await transporter.sendMail(mailOptions);
    return { sent: true };
  } catch (err) {
    console.error("[EMAIL] Error enviando verificación:", err.message);
    return { sent: false, error: err.message };
  }
}

/**
 * Envía email para restablecer contraseña.
 * @param {string} to
 * @param {string} nombre
 * @param {string} resetUrl
 */
export async function sendPasswordResetEmail(to, nombre, resetUrl) {
  const transporter = getTransporter();
  const from =
    process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@bachesrosario.com";

  const mailOptions = {
    from: `Baches Rosario <${from}>`,
    to,
    subject: "Restablecer contraseña - Baches Rosario",
    html: `
      <h2>Hola ${nombre}</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Hacé clic en el siguiente enlace para elegir una nueva contraseña (válido por 1 hora):</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#e74c3c;color:#fff;text-decoration:none;border-radius:5px;">Restablecer mi contraseña</a></p>
      <p>Si no solicitaste este cambio, podés ignorar este correo.</p>
      <p>— Baches Rosario</p>
    `,
    text: `Hola ${nombre}. Restablecé tu contraseña accediendo a: ${resetUrl}`,
  };

  if (!transporter) {
    console.log("[EMAIL] SMTP no configurado. Link de reset (copiar en desarrollo):");
    console.log(resetUrl);
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    await transporter.sendMail(mailOptions);
    return { sent: true };
  } catch (err) {
    console.error("[EMAIL] Error enviando reset de contraseña:", err.message);
    return { sent: false, error: err.message };
  }
}
