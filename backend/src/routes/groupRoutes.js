import { Router } from 'express';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../controllers/groupController.js';
import { validateToken } from '../middlewares/validateToken.js';
import { requireRole } from '../middlewares/roleGuard.js';
import { validate, validateParams } from '../middlewares/validate.js';
import { createGroupSchema, updateGroupSchema, idParamSchema } from '../validators/groupValidators.js';

const router = Router();

router.get('/', validateToken, requireRole('admin', 'profesor'), getGroups);
router.post('/', validateToken, requireRole('admin', 'profesor'), validate(createGroupSchema), createGroup);
router.put('/:id', validateToken, requireRole('admin', 'profesor'), validateParams(idParamSchema), validate(updateGroupSchema), updateGroup);
router.delete('/:id', validateToken, requireRole('admin', 'profesor'), validateParams(idParamSchema), deleteGroup);

export default router;