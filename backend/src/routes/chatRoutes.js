import { Router } from 'express';
import { chat, history, clearHistory, chatStatus } from '../controllers/chatController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { chatLimiter } from '../middlewares/rateLimiter.js';
import { messageSchema } from '../validators/chatValidators.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.post('/message', validateToken, chatLimiter, validate(messageSchema), chat);
router.get('/status', validateToken, chatStatus);
router.get('/history', validateToken, history);
router.delete('/history', validateToken, clearHistory);

export default router;
