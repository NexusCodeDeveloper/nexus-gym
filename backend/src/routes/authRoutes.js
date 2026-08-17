import express from "express";
import {
  loginUser,
  profile,
  registerUser,
  logout,
  verifyDni,
  getAlumnos
} from "../controllers/authController.js";
import { validateToken } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/roleGuard.js";

const router = express.Router();

// Rutas públicas
router.post("/login", loginUser);
router.post("/verify-dni", verifyDni);
router.post("/logout", logout)

// Ruta protegida (solo admin/superAdmin pueden registrar usuarios)
router.post("/register", validateToken, requireRole('admin', 'superAdmin'), registerUser);

// Ruta protegida
router.get("/profile", validateToken, profile);
router.get("/alumnos", validateToken, getAlumnos);

export default router;