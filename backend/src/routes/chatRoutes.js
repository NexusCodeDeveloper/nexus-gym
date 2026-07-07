import { Router } from 'express';
import { chat, history, clearHistory } from '../controllers/chatController.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

router.post('/message', validateToken, chat);
router.get('/history', validateToken, history);
router.delete('/history', validateToken, clearHistory);

export default router;
