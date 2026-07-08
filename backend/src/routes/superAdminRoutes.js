import express from "express";
import { getAdmins, toggleAdminAccess, createAdmin, renewAdmin, deleteAdmin, updateAdmin, toggleChatbot } from "../controllers/superAdminController.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = express.Router();

// Rutas protegidas para el Super Admin
router.get("/admins", validateToken, getAdmins);
router.patch("/admins/:id/toggle-access", validateToken, toggleAdminAccess);
router.post("/admins", validateToken, createAdmin);
router.patch("/admins/:id/renew", validateToken, renewAdmin);
router.delete("/admins/:id", validateToken, deleteAdmin);
router.put("/admins/:id", validateToken, updateAdmin);
router.patch("/admins/:id/chatbot-toggle", validateToken, toggleChatbot);


export default router;