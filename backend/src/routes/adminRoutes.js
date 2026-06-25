import express from "express";
import { getUsers, updateUserLicense, suspendStudent, deleteStudent } from "../controllers/adminController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

// Todas las rutas acá requieren estar logueado como admin
router.get("/users", validateToken, getUsers);
router.put("/users/:id/license", validateToken, updateUserLicense);
router.put("/users/:id/suspend", validateToken, suspendStudent);
router.delete("/users/:id", validateToken, deleteStudent);

export default router;