import mongoose from "mongoose";

const bacheSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    ubicacion: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      direccion: {
        type: String,
        required: true,
      },
    },
    imagenes: [
      {
        type: String,
        required: true,
      },
    ],
    posicion: {
      type: String,
      enum: ["medio", "derecha", "izquierda"],
      required: true,
    },
    fechaReporte: {
      type: Date,
      default: Date.now,
    },
    fechaSolucion: {
      type: Date,
    },
    estado: {
      type: String,
      enum: ["reportado", "en_proceso", "solucionado"],
      default: "reportado",
    },
    tiempoSolucion: {
      type: Number, // días
    },
    reportadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votos: [
      {
        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        fecha: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas geográficas
bacheSchema.index({ "ubicacion.lat": 1, "ubicacion.lng": 1 });

export default mongoose.model("Bache", bacheSchema);

