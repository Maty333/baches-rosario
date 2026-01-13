import express from "express";
import { body, query, param } from "express-validator";
import {
  getBaches,
  getBacheById,
  createBache,
  updateBache,
  updateEstado,
  votarBache,
} from "../controllers/bacheController.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { handleValidationErrors } from "../middleware/validationHandler.js";

const router = express.Router();

// Validaciones
const createBacheValidation = [
  body("titulo")
    .notEmpty()
    .withMessage("El título es requerido")
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage("El título no puede exceder 200 caracteres"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción es requerida")
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage("La descripción no puede exceder 1000 caracteres"),
  body("ubicacion.lat").isFloat().withMessage("Latitud inválida"),
  body("ubicacion.lng").isFloat().withMessage("Longitud inválida"),
  body("ubicacion.direccion")
    .notEmpty()
    .withMessage("La dirección es requerida")
    .trim()
    .escape()
    .isLength({ max: 300 })
    .withMessage("La dirección no puede exceder 300 caracteres"),
];

// Validación de query parameters
const getBachesQueryValidation = [
  query("estado")
    .optional()
    .isIn(["reportado", "en_proceso", "solucionado"])
    .withMessage("Estado inválido"),
  query("lat")
    .optional()
    .isFloat()
    .withMessage("Latitud debe ser un número"),
  query("lng")
    .optional()
    .isFloat()
    .withMessage("Longitud debe ser un número"),
  query("radio")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Radio debe ser un número positivo"),
];

/**
 * @swagger
 * /api/baches:
 *   get:
 *     summary: Listar todos los baches
 *     tags: [Baches]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [reportado, en_proceso, solucionado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitud para búsqueda geográfica
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitud para búsqueda geográfica
 *       - in: query
 *         name: radio
 *         schema:
 *           type: number
 *         description: Radio en km para búsqueda geográfica
 *     responses:
 *       200:
 *         description: Lista de baches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bache'
 */
router.get("/", getBachesQueryValidation, handleValidationErrors, getBaches);

/**
 * @swagger
 * /api/baches/{id}:
 *   get:
 *     summary: Obtener bache por ID
 *     tags: [Baches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del bache
 *     responses:
 *       200:
 *         description: Información del bache
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bache'
 *       404:
 *         description: Bache no encontrado
 */
router.get("/:id", validateObjectId("id"), getBacheById);

/**
 * @swagger
 * /api/baches:
 *   post:
 *     summary: Crear nuevo bache
 *     tags: [Baches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descripcion
 *               - ubicacion
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: Bache en calle principal
 *               descripcion:
 *                 type: string
 *                 example: Bache grande en la intersección
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: -32.9442
 *                   lng:
 *                     type: number
 *                     example: -60.6505
 *                   direccion:
 *                     type: string
 *                     example: Av. Pellegrini 1234
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Bache creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bache'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post("/", authenticate, upload.array("imagenes", 5), createBacheValidation, createBache);

/**
 * @swagger
 * /api/baches/{id}:
 *   put:
 *     summary: Actualizar bache
 *     tags: [Baches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               ubicacion:
 *                 type: object
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Bache actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bache'
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Bache no encontrado
 */
router.put("/:id", validateObjectId("id"), authenticate, upload.array("imagenes", 5), updateBache);

/**
 * @swagger
 * /api/baches/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de bache (Solo Admin)
 *     tags: [Baches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [reportado, en_proceso, solucionado]
 *                 example: en_proceso
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bache'
 *       403:
 *         description: Se requiere rol de administrador
 *       404:
 *         description: Bache no encontrado
 */
router.patch("/:id/estado", validateObjectId("id"), authenticate, isAdmin, updateEstado);

/**
 * @swagger
 * /api/baches/{id}/votar:
 *   post:
 *     summary: Votar o desvotar un bache
 *     tags: [Baches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voto procesado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 votado:
 *                   type: boolean
 *                   example: true
 *                 totalVotos:
 *                   type: number
 *                   example: 5
 *       404:
 *         description: Bache no encontrado
 */
router.post("/:id/votar", validateObjectId("id"), authenticate, votarBache);

export default router;

