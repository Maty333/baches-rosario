import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { connectDB } from "./config/database.js";
import { initializeSocket } from "./config/socket.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Importar rutas
import authRoutes from "./routes/auth.js";
import bachesRoutes from "./routes/baches.js";
import commentsRoutes from "./routes/comments.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Inicializar Socket.io
const io = initializeSocket(server);

// Middleware para hacer io disponible en req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/baches", bachesRoutes);
app.use("/api/baches", commentsRoutes);
app.use("/api/admin", adminRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

