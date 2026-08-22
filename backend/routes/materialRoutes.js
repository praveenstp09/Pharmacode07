import express from 'express';
import { getMaterials, getMaterialById, trackDownload } from '../controllers/materialController.js';

import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getMaterials);
router.get('/:id', optionalAuth, getMaterialById);
router.post('/:id/track-download', trackDownload);

export default router;
