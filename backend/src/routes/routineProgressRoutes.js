import express from 'express';
import { getProgress, updateDayProgress } from '../controllers/routineProgressController.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = express.Router();

router.get('/:routineId', validateToken, getProgress);
router.put('/:routineId/day', validateToken, updateDayProgress);

export default router;
