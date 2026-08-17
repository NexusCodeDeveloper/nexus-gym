import { Router } from 'express';
import multer from 'multer';
import { validateToken } from '../middlewares/validateToken.js';
import { requireRole } from '../middlewares/roleGuard.js';
import { uploadVideo, listVideos, deleteVideo } from '../controllers/exerciseMediaController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.use(validateToken, requireRole('admin', 'superAdmin'));

router.post('/upload', upload.single('video'), uploadVideo);
router.get('/', listVideos);
router.delete('/:id', deleteVideo);

export default router;
