import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Ya no es required, porque usuarios de Google no tienen password
      minlength: 6,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    edad: {
      type: Number,
      // Ya no es required para usuarios de Google
      min: 13,
      max: 120,
    },
    sexo: {
      type: String,
      // Ya no es required para usuarios de Google
      enum: ["masculino", "femenino", "otro", "prefiero no decir"],
    },
    rol: {
      type: String,
      enum: ["usuario", "admin"],
      default: "usuario",
    },
    // Nuevo campo para identificar usuarios de Google
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Permite múltiples nulls
    },
    // Nuevo campo para foto de perfil de Google
    fotoPerfil: {
      type: String,
    },
    // Campo para saber cómo se registró
    metodoRegistro: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    // Verificación de email (solo para registro por email; Google se considera verificado)
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    // Campos para recuperación de contraseña
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password solo si existe y fue modificado
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar passwords (solo si tiene password)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false; // Usuario de Google no tiene password
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
