import express from "express";
import {
  loginUser,
  profile,
  registerUser,
  logout,
  verifyDni,
} from "../controllers/authController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

// Rutas públicas
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-dni", verifyDni);
router.post("/logout", logout);

// Ruta protegida
router.get("/profile", validateToken, profile);

export default router;