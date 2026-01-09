import express from "express";
import { body } from "express-validator";
import { register, login, getMe } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Validaciones
const registerValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("nombre").notEmpty().withMessage("El nombre es requerido"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", authenticate, getMe);

export default router;

