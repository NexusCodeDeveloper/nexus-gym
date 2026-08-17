import { Router } from 'express';
import { checkin, checkout, myAttendance, gymAttendance, gymAttendanceHistory } from '../controllers/attendanceController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { checkinSchema, checkoutSchema, dateRangeSchema } from '../validators/attendanceValidators.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { checkinLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/checkin', validateToken, checkinLimiter, validate(checkinSchema), checkin);
router.post('/checkout', validateToken, validate(checkoutSchema), checkout);
router.get('/my', validateToken, myAttendance);
router.get('/gym', validateToken, validateQuery(dateRangeSchema), gymAttendance);
router.get('/gym/history', validateToken, validateQuery(dateRangeSchema), gymAttendanceHistory);

export default router;
