import express from "express";
import { updateMetrics, getStaffStats } from "../controllers/profileController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

router.put("/metrics", validateToken, updateMetrics);
router.get("/stats", validateToken, getStaffStats);

export default router;