import Bache from "../models/Bache.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

export const getStats = async (req, res) => {
  try {
    const totalBaches = await Bache.countDocuments();
    const bachesReportados = await Bache.countDocuments({ estado: "reportado" });
    const bachesEnProceso = await Bache.countDocuments({ estado: "en_proceso" });
    const bachesSolucionados = await Bache.countDocuments({ estado: "solucionado" });

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
    const { estado, fechaDesde, fechaHasta, page = 1, limit = 20 } = req.query;
    let query = {};

    if (estado) {
      query.estado = estado;
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

