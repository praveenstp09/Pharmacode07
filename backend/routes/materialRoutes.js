import express from 'express';
import { getMaterials, getMaterialById } from '../controllers/materialController.js';

const router = express.Router();

router.get('/', getMaterials);
router.get('/:id', getMaterialById);

export default router;
