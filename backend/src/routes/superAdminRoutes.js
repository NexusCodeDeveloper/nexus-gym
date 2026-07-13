import { Router } from 'express';
import { getAdmins, toggleAdminAccess, createAdmin, renewAdmin, deleteAdmin, updateAdmin, toggleChatbot } from '../controllers/superAdminController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { requireRole } from '../middlewares/roleGuard.js';
import { createAdminSchema, updateAdminSchema, idParamSchema, validateParams } from '../validators/superAdminValidators.js';
import { validate } from '../validators/attendanceValidators.js';

const router = Router();

router.use(validateToken, requireRole('superAdmin'));

router.get('/admins', getAdmins);
router.post('/admins', validate(createAdminSchema), createAdmin);
router.put('/admins/:id', validateParams(idParamSchema), validate(updateAdminSchema), updateAdmin);
router.patch('/admins/:id/toggle-access', validateParams(idParamSchema), toggleAdminAccess);
router.patch('/admins/:id/renew', validateParams(idParamSchema), renewAdmin);
router.patch('/admins/:id/chatbot-toggle', validateParams(idParamSchema), toggleChatbot);
router.delete('/admins/:id', validateParams(idParamSchema), deleteAdmin);

export default router;
