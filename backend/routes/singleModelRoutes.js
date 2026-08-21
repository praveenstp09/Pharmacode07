import express from 'express';
import {
  getSingleModelPapers,
  getSingleModelPaperBySlug,
  createSingleModelPaper,
  updateSingleModelPaper,
  deleteSingleModelPaper,
} from '../controllers/singleModelController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSingleModelPapers);
router.get('/:slug', getSingleModelPaperBySlug);

// Admin-only routes
router.post('/', protect, adminOnly, createSingleModelPaper);
router.put('/:id', protect, adminOnly, updateSingleModelPaper);
router.delete('/:id', protect, adminOnly, deleteSingleModelPaper);

export default router;
