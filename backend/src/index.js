import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Conexión a la base de datos
connectDB();

// Configuración del servidor
const app = express();
const port = process.env.PORT || 4000;

// Middlewares principales
app.use(
  cors({
    origin: "http://localhost:5173", // Solo permitimos peticiones de tu frontend
    credentials: true, // Habilitamos el uso de cookies para el login
  }),
);
app.use(morgan("dev")); // Permite visualizar solicitudes HTTP en la consola
app.use(express.json()); // Permite parsear JSON en el body de las solicitudes
app.use(cookieParser()); // Permite parsear cookies en las solicitudes

// Rutas
// Ruta de prueba para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("¡Servidor backend funcionando en docker!");
});
// Rutas de la API
app.use("/api/auth", authRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
