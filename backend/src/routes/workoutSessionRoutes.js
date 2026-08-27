import { Router } from 'express';
import { startSession, stopSession, getActiveSession, getHistory } from '../controllers/workoutSessionController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { validate } from '../middlewares/validate.js';
import { startSessionSchema } from '../validators/workoutSessionValidators.js';

const router = Router();

router.post('/start', validateToken, validate(startSessionSchema), startSession);
router.patch('/stop', validateToken, stopSession);
router.get('/active', validateToken, getActiveSession);
router.get('/history', validateToken, getHistory);

export default router;
