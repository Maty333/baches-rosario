import express from "express";
import { getStats, getAllBaches } from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate);
router.use(isAdmin);

router.get("/stats", getStats);
router.get("/baches", getAllBaches);

export default router;

