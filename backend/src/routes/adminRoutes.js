import express from "express";
import { createTeacher, getTeachers } from "../controllers/adminController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

// Todas las rutas acá requieren estar logueado como admin
router.post("/staff", validateToken, createTeacher);
router.get("/staff", validateToken, getTeachers);

export default router;