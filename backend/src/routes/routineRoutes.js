import express from "express";
import { createRoutine, getMyRoutines } from "../controllers/routineController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

router.post("/create", validateToken, createRoutine);
router.get("/mis-rutinas", validateToken, getMyRoutines);

export default router;