import express from 'express';
import {
  getSingleModelPapers,
  getSingleModelPaperBySlug,
  createSingleModelPaper,
  updateSingleModelPaper,
  deleteSingleModelPaper,
} from '../controllers/singleModelController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, getSingleModelPapers);
router.get('/:slug', optionalAuth, getSingleModelPaperBySlug);

// Admin-only routes
router.post('/', protect, adminOnly, createSingleModelPaper);
router.put('/:id', protect, adminOnly, updateSingleModelPaper);
router.delete('/:id', protect, adminOnly, deleteSingleModelPaper);

export default router;
