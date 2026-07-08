import { Router } from 'express';
import { checkin, myAttendance, gymAttendance, gymAttendanceHistory } from '../controllers/attendanceController.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

router.post('/checkin', validateToken, checkin);
router.get('/my', validateToken, myAttendance);
router.get('/gym', validateToken, gymAttendance);
router.get('/gym/history', validateToken, gymAttendanceHistory);

export default router;
