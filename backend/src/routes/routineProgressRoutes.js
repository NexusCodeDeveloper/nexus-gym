import express from 'express';
import { getProgress, updateDayProgress } from '../controllers/routineProgressController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { requireRoutineAccess } from '../middlewares/routineAccess.js';
import { validate, validateParams } from '../middlewares/validate.js';
import { idParamSchema, dayProgressSchema } from '../validators/routineProgressValidators.js';

const router = express.Router();

router.get('/:routineId', validateToken, validateParams(idParamSchema), requireRoutineAccess, getProgress);
router.put('/:routineId/day', validateToken, validateParams(idParamSchema), requireRoutineAccess, validate(dayProgressSchema), updateDayProgress);

export default router;