import express from "express";
import { body } from "express-validator";
import { getComments, createComment } from "../controllers/commentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

const createCommentValidation = [
  body("contenido").notEmpty().withMessage("El contenido del comentario es requerido"),
];

// Rutas específicas para comentarios: /api/baches/:id/comments
router.get("/:id/comments", getComments);
router.post("/:id/comments", authenticate, createCommentValidation, createComment);

export default router;

