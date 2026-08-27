import express from "express";
import {
  profile,
  registerUser,
  logout,
  verifyDni,
  getAlumnos,
  getGyms
} from "../controllers/authController.js";
import { validateToken } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import { registerSchema, dniSchema, alumnosQuerySchema } from "../validators/authValidators.js";

const router = express.Router();

// Rutas públicas
router.get("/gyms", getGyms);
router.post("/verify-dni", validate(dniSchema), verifyDni);
router.post("/logout", logout)

// Ruta protegida (solo admin/superAdmin pueden registrar usuarios)
router.post("/register", validateToken, requireRole('admin', 'superAdmin'), validate(registerSchema), registerUser);

// Rutas protegidas
router.get("/profile", validateToken, profile);
router.get("/alumnos", validateToken, requireRole('admin', 'profesor', 'superAdmin'), validateQuery(alumnosQuerySchema), getAlumnos);

export default router;