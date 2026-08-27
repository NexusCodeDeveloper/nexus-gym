import express from "express";
import { updateMetrics, getStaffStats } from "../controllers/profileController.js";
import { validateToken } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { validate } from "../middlewares/validate.js";
import { updateMetricsSchema } from "../validators/profileValidators.js";

const router = express.Router();

router.put("/metrics", validateToken, validate(updateMetricsSchema), updateMetrics);
router.get("/stats", validateToken, requireRole('admin', 'profesor', 'superAdmin'), getStaffStats);

export default router;