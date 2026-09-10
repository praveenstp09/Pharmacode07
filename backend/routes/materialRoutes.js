import express from 'express';
import { getMaterials, getMaterialById, trackDownload } from '../controllers/materialController.js';

import { optionalAuth } from '../middleware/auth.js';
import { publicModerateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', optionalAuth, getMaterials);
router.get('/:id', optionalAuth, getMaterialById);
router.post('/:id/track-download', publicModerateLimiter, trackDownload);

export default router;
