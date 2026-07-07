import { Router } from 'express';
import multer from 'multer';
import { validateToken } from '../middlewares/validateToken.js';
import { uploadVideo, listVideos, deleteVideo } from '../controllers/exerciseMediaController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.post('/upload', validateToken, upload.single('video'), uploadVideo);
router.get('/', validateToken, listVideos);
router.delete('/:id', validateToken, deleteVideo);

export default router;
