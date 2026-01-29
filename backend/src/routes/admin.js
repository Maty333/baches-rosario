import express from "express";
import { body, query } from "express-validator";
import {
  getStats,
  getAllBaches,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  aprobarBache,
  rechazarBache,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { handleValidationErrors } from "../middleware/validationHandler.js";

const router = express.Router();

// Validaciones para actualizar usuario
const updateUserValidation = [
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
// Validación de query parameters para baches (admin)
const getAllBachesQueryValidation = [
  query("estado")
    .optional()
    .isIn(["reportado", "en_proceso", "solucionado"])
    .withMessage("Estado inválido"),
  query("estadoModeracion")
    .optional()
    .isIn(["pendiente", "aprobado", "rechazado"])
    .withMessage("estadoModeracion inválido"),
  query("fechaDesde")
    .optional()
    .isISO8601()
    .withMessage("fechaDesde debe ser una fecha válida (YYYY-MM-DD)"),
  query("fechaHasta")
    .optional()
    .isISO8601()
    .withMessage("fechaHasta debe ser una fecha válida (YYYY-MM-DD)"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page debe ser un número entero mayor a 0"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit debe ser un número entre 1 y 100"),
];

router.get("/baches", getAllBachesQueryValidation, handleValidationErrors, getAllBaches);

router.post("/baches/:id/aprobar", validateObjectId("id"), aprobarBache);

router.post("/baches/:id/rechazar", validateObjectId("id"), rechazarBache);

/**
 * @swagger
 * /api/admin/usuarios:
 *   get:
 *     summary: Listar todos los usuarios con paginación (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [usuario, admin]
 *         description: Filtrar por rol
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, apellido o email
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
 *         description: Lista de usuarios con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       apellido:
 *                         type: string
 *                       edad:
 *                         type: number
 *                       sexo:
 *                         type: string
 *                       rol:
 *                         type: string
 *                         enum: [usuario, admin]
 *                       fechaRegistro:
 *                         type: string
 *                         format: date-time
 *                       totalBaches:
 *                         type: number
 *                         description: Total de baches reportados por el usuario
 *                       totalComentarios:
 *                         type: number
 *                         description: Total de comentarios realizados por el usuario
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
// Validación de query parameters para usuarios
const getAllUsersQueryValidation = [
  query("rol")
    .optional()
    .isIn(["usuario", "admin"])
    .withMessage("Rol inválido"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page debe ser un número entero mayor a 0"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit debe ser un número entre 1 y 100"),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("La búsqueda no puede exceder 100 caracteres"),
];

router.get("/usuarios", getAllUsersQueryValidation, handleValidationErrors, getAllUsers);

/**
 * @swagger
 * /api/admin/usuarios/{id}:
 *   get:
 *     summary: Obtener detalles de un usuario específico (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Detalles del usuario con estadísticas
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
 *                 apellido:
 *                   type: string
 *                 edad:
 *                   type: number
 *                 sexo:
 *                   type: string
 *                 rol:
 *                   type: string
 *                   enum: [usuario, admin]
 *                 fechaRegistro:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalBaches:
 *                       type: number
 *                       description: Total de baches reportados
 *                     totalComentarios:
 *                       type: number
 *                       description: Total de comentarios realizados
 *                     bachesPorEstado:
 *                       type: object
 *                       properties:
 *                         reportados:
 *                           type: number
 *                         enProceso:
 *                           type: number
 *                         solucionados:
 *                           type: number
 *                     ultimosBaches:
 *                       type: array
 *                       description: Últimos 5 baches reportados
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           titulo:
 *                             type: string
 *                           estado:
 *                             type: string
 *                           fechaReporte:
 *                             type: string
 *                             format: date-time
 *                           totalVotos:
 *                             type: number
 *       400:
 *         description: ID de usuario inválido
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Se requiere rol de administrador
 */
router.get("/usuarios/:id", validateObjectId("id"), getUserById);

/**
 * @swagger
 * /api/admin/usuarios/{id}:
 *   put:
 *     summary: Actualizar información de un usuario (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
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
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado exitosamente
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
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Se requiere rol de administrador
 */
router.put("/usuarios/:id", validateObjectId("id"), updateUserValidation, handleValidationErrors, updateUser);

/**
 * @swagger
 * /api/admin/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado exitosamente
 *                 deletedUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                 deletedData:
 *                   type: object
 *                   properties:
 *                     baches:
 *                       type: number
 *                       description: Cantidad de baches eliminados
 *                     comentarios:
 *                       type: number
 *                       description: Cantidad de comentarios eliminados
 *       400:
 *         description: No puedes eliminar tu propia cuenta o ID inválido
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: Se requiere rol de administrador
 */
router.delete("/usuarios/:id", validateObjectId("id"), deleteUser);

export default router;

