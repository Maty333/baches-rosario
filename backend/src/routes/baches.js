import express from "express";
import { body } from "express-validator";
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

const router = express.Router();

// Validaciones
const createBacheValidation = [
  body("titulo").notEmpty().withMessage("El título es requerido"),
  body("descripcion").notEmpty().withMessage("La descripción es requerida"),
  body("ubicacion.lat").isFloat().withMessage("Latitud inválida"),
  body("ubicacion.lng").isFloat().withMessage("Longitud inválida"),
  body("ubicacion.direccion").notEmpty().withMessage("La dirección es requerida"),
];

router.get("/", getBaches);
router.get("/:id", getBacheById);
router.post("/", authenticate, upload.array("imagenes", 5), createBacheValidation, createBache);
router.put("/:id", authenticate, upload.array("imagenes", 5), updateBache);
router.patch("/:id/estado", authenticate, isAdmin, updateEstado);
router.post("/:id/votar", authenticate, votarBache);

export default router;

