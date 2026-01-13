import { validationResult } from "express-validator";

/**
 * Middleware para manejar errores de validación de express-validator
 * Debe usarse después de las validaciones en las rutas
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Error de validación",
      errors: errors.array(),
    });
  }
  next();
};
