import { Router } from 'express';
import multer from 'multer';
import { validateToken } from '../middlewares/validateToken.js';
import { requireRole } from '../middlewares/roleGuard.js';
import { validate, validateParams } from '../middlewares/validate.js';
import { uploadVideo, listVideos, deleteVideo } from '../controllers/exerciseMediaController.js';
import { mediaSchema, idParamSchema } from '../validators/exerciseMediaValidators.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.use(validateToken, requireRole('admin', 'superAdmin', 'profesor'));

const uploadMiddleware = (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Error al procesar el archivo' });
    }
    next();
  });
};

router.post('/upload', requireRole('admin'), uploadMiddleware, validate(mediaSchema), uploadVideo);
router.get('/', listVideos);
router.delete('/:id', requireRole('admin', 'superAdmin'), validateParams(idParamSchema), deleteVideo);

export default router;
