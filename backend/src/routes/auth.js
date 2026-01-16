import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import { register, login, getMe, updateProfile, googleAuth, getGoogleAuthUrl } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Rate Limiting para autenticación (más estricto)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login/registro por IP en 15 minutos
  message: "Demasiados intentos de autenticación, intenta de nuevo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar peticiones exitosas
});

// Validaciones
const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .trim(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
  body("nombre")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres")
    .trim()
    .escape()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),
  body("apellido")
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ min: 2 })
    .withMessage("El apellido debe tener al menos 2 caracteres")
    .trim()
    .escape()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios"),
  body("edad")
    .isInt({ min: 13, max: 120 })
    .withMessage("La edad debe ser un número entre 13 y 120 años"),
  body("sexo")
    .isIn(["masculino", "femenino", "otro", "prefiero no decir"])
    .withMessage("El sexo debe ser: masculino, femenino, otro o prefiero no decir"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

const updateProfileValidation = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .trim(),
  body("nombre")
    .optional()
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres")
    .trim()
    .escape()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),
  body("apellido")
    .optional()
    .isLength({ min: 2 })
    .withMessage("El apellido debe tener al menos 2 caracteres")
    .trim()
    .escape()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios"),
  body("edad")
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage("La edad debe ser un número entre 13 y 120 años"),
  body("sexo")
    .optional()
    .isIn(["masculino", "femenino", "otro", "prefiero no decir"])
    .withMessage("El sexo debe ser: masculino, femenino, otro o prefiero no decir"),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *               - apellido
 *               - edad
 *               - sexo
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: Password123
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 minLength: 2
 *                 example: Pérez
 *               edad:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 example: 25
 *               sexo:
 *                 type: string
 *                 enum: [masculino, femenino, otro, prefiero no decir]
 *                 example: masculino
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     rol:
 *                       type: string
 *                       enum: [usuario, admin]
 *       400:
 *         description: Error de validación o usuario ya existe
 */
router.post("/register", authLimiter, registerValidation, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     rol:
 *                       type: string
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", authLimiter, loginValidation, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 rol:
 *                   type: string
 *                   enum: [usuario, admin]
 *                 fechaRegistro:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 */
router.get("/me", authenticate, getMe);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 minLength: 2
 *                 example: Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevoemail@ejemplo.com
 *               edad:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 example: 26
 *               sexo:
 *                 type: string
 *                 enum: [masculino, femenino, otro, prefiero no decir]
 *                 example: masculino
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Perfil actualizado exitosamente
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     edad:
 *                       type: number
 *                     sexo:
 *                       type: string
 *                     rol:
 *                       type: string
 *       400:
 *         description: Error de validación o email ya en uso
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/profile", authenticate, updateProfileValidation, updateProfile);

/**
 * @swagger
 * /api/auth/google/url:
 *   get:
 *     summary: Obtener URL de autenticación de Google
 *     tags: [Autenticación]
 *     description: Retorna la URL a la que el frontend debe redirigir al usuario para autenticarse con Google
 *     responses:
 *       200:
 *         description: URL de autenticación generada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   example: https://accounts.google.com/o/oauth2/v2/auth?...
 *       500:
 *         description: Error al generar URL de Google
 */
router.get("/google/url", getGoogleAuthUrl);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback de autenticación con Google
 *     tags: [Autenticación]
 *     description: Endpoint al que Google redirige después de la autenticación. Intercambia el código por tokens y crea/actualiza el usuario.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de autorización proporcionado por Google
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     rol:
 *                       type: string
 *                       enum: [usuario, admin]
 *                     fotoPerfil:
 *                       type: string
 *                     metodoRegistro:
 *                       type: string
 *                       enum: [email, google]
 *       400:
 *         description: Código de autorización no proporcionado
 *       500:
 *         description: Error al autenticar con Google
 */
router.get("/google/callback", googleAuth);

export default router;

