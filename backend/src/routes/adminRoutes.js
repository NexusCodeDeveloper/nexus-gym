import express from "express";
import { getUsers, updateUserLicense, suspendUser, deleteUser } from "../controllers/adminController.js";
import { validateToken } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { validate } from "../middlewares/validate.js";
import { updateLicenseSchema } from "../validators/adminValidators.js";

const router = express.Router();

router.use(validateToken, requireRole('admin'));

router.get("/users", getUsers);
router.put("/users/:id/license", validate(updateLicenseSchema), updateUserLicense);
router.put("/users/:id/suspend", suspendUser);
router.delete("/users/:id", deleteUser);

export default router;