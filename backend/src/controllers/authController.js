import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { sendVerificationEmail } from "../services/email.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, nombre, apellido, edad, sexo } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = new User({
      email,
      password,
      nombre,
      apellido,
      edad,
      sexo,
      metodoRegistro: "email",
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await user.save();

    const baseUrl =
      process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    await sendVerificationEmail(email, nombre, verificationUrl);

    res.status(201).json({
      message: "Registro exitoso. Revisá tu email para verificar tu cuenta.",
      requiresVerification: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Solo para registro por email: exigir verificación
    if (user.metodoRegistro === "email" && !user.emailVerified) {
      return res.status(403).json({
        message:
          "Verificá tu email antes de iniciar sesión. Revisá tu bandeja de entrada.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Verifica el email con el token enviado por correo. Redirige al frontend con resultado. */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (!token) {
      return res.redirect(`${frontendUrl}/login?error=token_required`);
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(
        `${frontendUrl}/login?error=token_invalid_or_expired`
      );
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    return res.redirect(
      `${frontendUrl}/login#token=${encodeURIComponent(jwtToken)}`
    );
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=verification_failed`);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, email, edad, sexo } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si se actualiza el email, verificar que no esté en uso por otro usuario
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }
      user.email = email;
    }

    // Actualizar campos si se proporcionan
    if (nombre) user.nombre = nombre;
    if (apellido) user.apellido = apellido;
    if (edad) user.edad = edad;
    if (sexo) user.sexo = sexo;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.json({
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nueva función para autenticación con Google
export const googleAuth = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Código de autorización no proporcionado" });
    }

    // Verificar que las variables de entorno estén configuradas
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REDIRECT_URI
    ) {
      return res.status(500).json({
        message:
          "Error de configuración del servidor. Variables de Google OAuth no configuradas.",
      });
    }

    // Crear cliente OAuth2
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Intercambiar código por tokens (pasar redirect_uri explícitamente)
    let tokens;
    try {
      const tokenResponse = await client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      });
      tokens = tokenResponse.tokens;
    } catch (tokenError) {
      console.error("Error al intercambiar código por tokens:", tokenError);

      if (tokenError.message && tokenError.message.includes("invalid_grant")) {
        return res.status(400).json({
          message:
            "El código de autorización ha expirado o ya fue usado. Por favor, intenta iniciar sesión nuevamente.",
          error: "invalid_grant",
        });
      }

      return res.status(400).json({
        message: "Error al intercambiar código de autorización",
        error: tokenError.message,
      });
    }

    client.setCredentials(tokens);

    // Verificar que tengamos id_token
    if (!tokens.id_token) {
      return res.status(400).json({
        message: "No se recibió el token de identificación de Google",
      });
    }

    // Obtener información del usuario de Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    // Validar que tengamos email
    if (!email) {
      return res.status(400).json({
        message: "No se pudo obtener el email de Google",
      });
    }

    // Buscar si el usuario ya existe por email o googleId
    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.metodoRegistro = "google";
        user.emailVerified = true; // Google ya verificó el email
        if (picture) user.fotoPerfil = picture;
        await user.save();
      }
    } else {
      const nombre = given_name || email.split("@")[0];
      const apellido = family_name || "Usuario";

      user = new User({
        email,
        googleId,
        nombre,
        apellido,
        metodoRegistro: "google",
        emailVerified: true, // No pedir verificación a usuarios de Google
        fotoPerfil: picture,
      });

      await user.save();
    }

    // Generar JWT
    const token = generateToken(user._id);

    // Redirigir al frontend con el token en el hash (no se envía en referrer ni logs)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/auth/google/callback#token=${encodeURIComponent(
      token
    )}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error en autenticación con Google:", error);
    res.status(500).json({
      message: "Error al autenticar con Google",
      error: error.message,
    });
  }
};

// Función para obtener la URL de Google OAuth (para el frontend)
export const getGoogleAuthUrl = (req, res) => {
  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      prompt: "consent", // Fuerza mostrar pantalla de consentimiento
    });

    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({
      message: "Error al generar URL de Google",
      error: error.message,
    });
  }
};
