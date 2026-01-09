import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    contenido: {
      type: String,
      required: true,
      trim: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bache: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bache",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", commentSchema);

