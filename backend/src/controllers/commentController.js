import { validationResult } from "express-validator";
import Comment from "../models/Comment.js";
import Bache from "../models/Bache.js";

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ bache: req.params.id })
      .populate("autor", "nombre email")
      .sort({ fecha: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar que el bache existe
    const bache = await Bache.findById(req.params.id);
    if (!bache) {
      return res.status(404).json({ message: "Bache no encontrado" });
    }

    const comment = new Comment({
      contenido: req.body.contenido,
      autor: req.user.id,
      bache: req.params.id,
    });

    await comment.save();
    await comment.populate("autor", "nombre email");

    // Emitir evento Socket.io
    req.io.emit("nuevoComentario", {
      bacheId: req.params.id,
      comment,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

