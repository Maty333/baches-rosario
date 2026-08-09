import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/database.js";
import { initializeSocket } from "./config/socket.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";
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

// Seguridad: Helmet.js - Headers de seguridad (CORP cross-origin para que el frontend pueda cargar imágenes de /uploads)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS más restrictivo
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, mobile apps, etc.) solo en desarrollo
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://localhost:5174",
          "https://baches-rosario-1.onrender.com",
        ]; // Vite default ports

    // En desarrollo, permitir requests sin origin
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    // En producción, solo permitir orígenes específicos
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true, // Permitir cookies/credenciales
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"], // Headers que el cliente puede leer
  maxAge: 86400, // Cache preflight requests por 24 horas
};

app.use(cors(corsOptions));

// Rate Limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP en 15 minutos
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares
app.use(express.json({ limit: "10mb" })); // Límite de tamaño del body
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Servir archivos estáticos (imágenes)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Aplicar rate limiting general a todas las rutas API
app.use("/api/", generalLimiter);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/baches", bachesRoutes);
app.use("/api/baches", commentsRoutes);
app.use("/api/admin", adminRoutes);

// Ruta de prueba
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar estado de la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API funcionando correctamente
 */
app.get("/api/health", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Manejo de errores (no exponer detalles internos en producción)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const message =
    process.env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err.message || "Error interno del servidor";
  res.status(500).json({ message });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(
    `📚 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`,
  );
});
