import express from "express";
import {
  loginUser,
  profile,
  registerUser,
  logout,
} from "../controllers/authController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

//Ruta publica para registrar un usuario
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/profile", validateToken, profile); // Ruta protegida para el perfil de usuario, se le va a agregar el middleware de validación de token en index.js

export default router;

// exportar esta ruta al servidor (index.js)
