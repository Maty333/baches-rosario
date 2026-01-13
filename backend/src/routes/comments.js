import express from "express";
import { body } from "express-validator";
import { getComments, createComment } from "../controllers/commentController.js";
import { authenticate } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const router = express.Router();

const createCommentValidation = [
  body("contenido")
    .notEmpty()
    .withMessage("El contenido del comentario es requerido")
    .trim()
    .escape()
    .isLength({ min: 1, max: 500 })
    .withMessage("El comentario debe tener entre 1 y 500 caracteres"),
];

// Rutas específicas para comentarios: /api/baches/:id/comments
/**
 * @swagger
 * /api/baches/{id}/comments:
 *   get:
 *     summary: Obtener comentarios de un bache
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del bache
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/:id/comments", validateObjectId("id"), getComments);

/**
 * @swagger
 * /api/baches/{id}/comments:
 *   post:
 *     summary: Crear comentario en un bache
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del bache
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenido
 *             properties:
 *               contenido:
 *                 type: string
 *                 example: Este bache está muy mal, necesita reparación urgente
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Bache no encontrado
 */
router.post("/:id/comments", validateObjectId("id"), authenticate, createCommentValidation, createComment);

export default router;

