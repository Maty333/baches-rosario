import Bache from "../models/Bache.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

export const getStats = async (req, res) => {
  try {
    const totalBaches = await Bache.countDocuments();
    const bachesPendientesModeracion = await Bache.countDocuments({
      estadoModeracion: "pendiente",
    });
    const bachesReportados = await Bache.countDocuments({
      estado: "reportado",
      $or: [{ estadoModeracion: "aprobado" }, { estadoModeracion: { $exists: false } }],
    });
    const bachesEnProceso = await Bache.countDocuments({
      estado: "en_proceso",
      $or: [{ estadoModeracion: "aprobado" }, { estadoModeracion: { $exists: false } }],
    });
    const bachesSolucionados = await Bache.countDocuments({
      estado: "solucionado",
      $or: [{ estadoModeracion: "aprobado" }, { estadoModeracion: { $exists: false } }],
    });

    const tiempoPromedioSolucion = await Bache.aggregate([
      { $match: { estado: "solucionado", tiempoSolucion: { $exists: true } } },
      {
        $group: {
          _id: null,
          promedio: { $avg: "$tiempoSolucion" },
        },
      },
    ]);

    const totalUsuarios = await User.countDocuments();
    const totalComentarios = await Comment.countDocuments();

    res.json({
      baches: {
        total: totalBaches,
        pendientesModeracion: bachesPendientesModeracion,
        reportados: bachesReportados,
        enProceso: bachesEnProceso,
        solucionados: bachesSolucionados,
        tiempoPromedioSolucion:
          tiempoPromedioSolucion.length > 0 ? Math.round(tiempoPromedioSolucion[0].promedio) : 0,
      },
      usuarios: {
        total: totalUsuarios,
      },
      comentarios: {
        total: totalComentarios,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBaches = async (req, res) => {
  try {
    const { estado, estadoModeracion, fechaDesde, fechaHasta, page = 1, limit = 20 } = req.query;
    let query = {};

    if (estado) {
      query.estado = estado;
    }

    if (estadoModeracion) {
      query.estadoModeracion = estadoModeracion;
    }

    if (fechaDesde || fechaHasta) {
      query.fechaReporte = {};
      if (fechaDesde) query.fechaReporte.$gte = new Date(fechaDesde);
      if (fechaHasta) query.fechaReporte.$lte = new Date(fechaHasta);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const baches = await Bache.find(query)
      .populate("reportadoPor", "nombre email")
      .sort({ fechaReporte: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Bache.countDocuments(query);

    res.json({
      baches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const aprobarBache = async (req, res) => {
  try {
    const { id } = req.params;
    const bache = await Bache.findById(id);

    if (!bache) {
      return res.status(404).json({ message: "Bache no encontrado" });
    }

    if (bache.estadoModeracion !== "pendiente") {
      return res.status(400).json({
        message: "El bache ya fue revisado (aprobado o rechazado)",
      });
    }

    bache.estadoModeracion = "aprobado";
    bache.motivoRechazo = undefined;
    await bache.save();
    await bache.populate("reportadoPor", "nombre email");

    if (req.io) {
      req.io.emit("nuevoBache", bache);
    }

    res.json({
      message: "Bache aprobado. Ya es visible para todos.",
      bache,
    });
  } catch (error) {
    if (error.name === "CastError" || error.message?.includes("Cast to ObjectId")) {
      return res.status(400).json({ message: "ID de bache inválido" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const rechazarBache = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoRechazo } = req.body || {};
    const bache = await Bache.findById(id);

    if (!bache) {
      return res.status(404).json({ message: "Bache no encontrado" });
    }

    if (bache.estadoModeracion !== "pendiente") {
      return res.status(400).json({
        message: "El bache ya fue revisado (aprobado o rechazado)",
      });
    }

    bache.estadoModeracion = "rechazado";
    bache.motivoRechazo = motivoRechazo ? String(motivoRechazo).trim() : undefined;
    await bache.save();
    await bache.populate("reportadoPor", "nombre email");

    res.json({
      message: "Bache rechazado.",
      bache,
    });
  } catch (error) {
    if (error.name === "CastError" || error.message?.includes("Cast to ObjectId")) {
      return res.status(400).json({ message: "ID de bache inválido" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { rol, search, page = 1, limit = 20 } = req.query;
    let query = {};

    // Filtro por rol
    if (rol) {
      query.rol = rol;
    }

    // Búsqueda por nombre o email
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { apellido: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener usuarios con paginación
    const users = await User.find(query)
      .select("-password") // Excluir password
      .sort({ fechaRegistro: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Obtener estadísticas para cada usuario
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalBaches = await Bache.countDocuments({ reportadoPor: user._id });
        const totalComentarios = await Comment.countDocuments({ autor: user._id });

        return {
          ...user.toObject(),
          totalBaches,
          totalComentarios,
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      usuarios: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuario
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener estadísticas detalladas
    const totalBaches = await Bache.countDocuments({ reportadoPor: user._id });
    const totalComentarios = await Comment.countDocuments({ autor: user._id });

    // Baches por estado
    const bachesReportados = await Bache.countDocuments({
      reportadoPor: user._id,
      estado: "reportado",
    });
    const bachesEnProceso = await Bache.countDocuments({
      reportadoPor: user._id,
      estado: "en_proceso",
    });
    const bachesSolucionados = await Bache.countDocuments({
      reportadoPor: user._id,
      estado: "solucionado",
    });

    // Obtener últimos baches reportados (opcional, para mostrar actividad reciente)
    const ultimosBaches = await Bache.find({ reportadoPor: user._id })
      .select("titulo estado fechaReporte votos")
      .sort({ fechaReporte: -1 })
      .limit(5);

    // Preparar respuesta con estadísticas
    const userWithStats = {
      ...user.toObject(),
      estadisticas: {
        totalBaches,
        totalComentarios,
        bachesPorEstado: {
          reportados: bachesReportados,
          enProceso: bachesEnProceso,
          solucionados: bachesSolucionados,
        },
        ultimosBaches: ultimosBaches.map((bache) => ({
          _id: bache._id,
          titulo: bache.titulo,
          estado: bache.estado,
          fechaReporte: bache.fechaReporte,
          totalVotos: bache.votos.length,
        })),
      },
    };

    res.json(userWithStats);
  } catch (error) {
    // Manejar errores de ObjectId inválido
    if (error.name === "CastError" || error.message.includes("Cast to ObjectId")) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, edad, sexo } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si se actualiza el email, verificar que no esté en uso por otro usuario
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }
      user.email = email;
    }

    // Actualizar campos si se proporcionan
    if (nombre) user.nombre = nombre;
    if (apellido) user.apellido = apellido;
    if (edad) user.edad = edad;
    if (sexo) user.sexo = sexo;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    // Manejar errores de ObjectId inválido
    if (error.name === "CastError" || error.message.includes("Cast to ObjectId")) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Prevenir que un admin se elimine a sí mismo
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
    }

    // Obtener estadísticas antes de eliminar (para la respuesta)
    const totalBaches = await Bache.countDocuments({ reportadoPor: user._id });
    const totalComentarios = await Comment.countDocuments({ autor: user._id });

    // Eliminar baches relacionados
    await Bache.deleteMany({ reportadoPor: user._id });

    // Eliminar comentarios relacionados
    await Comment.deleteMany({ autor: user._id });

    // Eliminar votos del usuario en otros baches
    await Bache.updateMany(
      { "votos.usuario": user._id },
      { $pull: { votos: { usuario: user._id } } }
    );

    // Eliminar el usuario
    await User.findByIdAndDelete(id);

    res.json({
      message: "Usuario eliminado exitosamente",
      deletedUser: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
      },
      deletedData: {
        baches: totalBaches,
        comentarios: totalComentarios,
      },
    });
  } catch (error) {
    // Manejar errores de ObjectId inválido
    if (error.name === "CastError" || error.message.includes("Cast to ObjectId")) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }
    res.status(500).json({ message: error.message });
  }
};
