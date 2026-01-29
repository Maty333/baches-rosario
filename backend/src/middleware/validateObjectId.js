import mongoose from "mongoose";

/**
 * Middleware para validar que un parámetro sea un ObjectId válido de MongoDB
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || typeof id !== "string" || id.trim() === "") {
      return res.status(400).json({ message: `${paramName} es requerido` });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `${paramName} inválido` });
    }

    next();
  };
};
