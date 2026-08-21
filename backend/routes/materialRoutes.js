import express from 'express';
import { getMaterials, getMaterialById, trackDownload } from '../controllers/materialController.js';

const router = express.Router();

router.get('/', getMaterials);
router.get('/:id', getMaterialById);
router.post('/:id/track-download', trackDownload);

export default router;
