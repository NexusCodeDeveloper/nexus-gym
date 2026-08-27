import { Router } from 'express';
import { logScreenshot, getAlerts, markAlertRead } from '../controllers/securityController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { requireRole } from '../middlewares/roleGuard.js';
import { validateParams, validateQuery } from '../middlewares/validate.js';
import { idParamSchema, alertsQuerySchema } from '../validators/securityValidators.js';

const router = Router();

router.post('/screenshot-log', validateToken, logScreenshot);
router.get('/alerts', validateToken, requireRole('admin', 'profesor'), validateQuery(alertsQuerySchema), getAlerts);
router.patch('/alerts/:id/read', validateToken, requireRole('admin', 'profesor'), validateParams(idParamSchema), markAlertRead);

export default router;