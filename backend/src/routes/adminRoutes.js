import express from "express";
import { getUsers, updateUserLicense, suspendUser, deleteUser } from "../controllers/adminController.js";
import { validateToken } from "../middlewares/validateToken.js";
import { requireRole } from "../middlewares/roleGuard.js";
import { validate, validateParams, validateQuery } from "../middlewares/validate.js";
import { updateLicenseSchema, idParamSchema, userQuerySchema } from "../validators/adminValidators.js";

const router = express.Router();

router.use(validateToken, requireRole('admin'));

router.get("/users", validateQuery(userQuerySchema), getUsers);
router.put("/users/:id/license", validateParams(idParamSchema), validate(updateLicenseSchema), updateUserLicense);
router.put("/users/:id/suspend", validateParams(idParamSchema), suspendUser);
router.delete("/users/:id", validateParams(idParamSchema), deleteUser);

export default router;