import express from "express";
import { createRoutine, deleteRoutine, getMyRoutines, getRoutineById, updateRoutine } from "../controllers/routineController.js";
import { validateToken } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { requireRoutineAccess } from "../middlewares/routineAccess.js";
import { validate, validateParams } from "../middlewares/validate.js";
import { createRoutineSchema, updateRoutineSchema, idParamSchema } from "../validators/routineValidators.js";

const router = express.Router();

router.post("/create", validateToken, requireRole('admin', 'profesor'), validate(createRoutineSchema), createRoutine);
router.get("/mis-rutinas", validateToken, getMyRoutines);
router.get("/:id", validateToken, validateParams(idParamSchema), requireRoutineAccess, getRoutineById);
router.put("/:id", validateToken, requireRole('admin', 'profesor', 'superAdmin'), validateParams(idParamSchema), requireRoutineAccess, validate(updateRoutineSchema), updateRoutine);
router.delete("/:id", validateToken, requireRole('admin', 'profesor', 'superAdmin'), validateParams(idParamSchema), requireRoutineAccess, deleteRoutine);

export default router;