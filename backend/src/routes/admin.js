import express from "express";
import { getStats, getAllBaches } from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Obtener estadísticas del sistema (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 baches:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     reportados:
 *                       type: number
 *                     enProceso:
 *                       type: number
 *                     solucionados:
 *                       type: number
 *                     tiempoPromedioSolucion:
 *                       type: number
 *                 usuarios:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                 comentarios:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *       403:
 *         description: Se requiere rol de administrador
 */
router.get("/stats", getStats);

/**
 * @swagger
 * /api/admin/baches:
 *   get:
 *     summary: Listar todos los baches con paginación (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [reportado, en_proceso, solucionado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de baches con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 baches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bache'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 *       403:
 *         description: Se requiere rol de administrador
 */
router.get("/baches", getAllBaches);

export default router;

