import express from "express";
import { createRoutine, deleteRoutine, getMyRoutines, getRoutineById, updateRoutine } from "../controllers/routineController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();
router.post("/create", validateToken, createRoutine);
router.get("/mis-rutinas", validateToken, getMyRoutines);
router.get("/:id", validateToken, getRoutineById);
router.put("/:id", validateToken, updateRoutine);
router.delete("/:id", validateToken, deleteRoutine);
export default router;