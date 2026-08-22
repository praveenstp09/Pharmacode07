import express from 'express';
import {
  getNonPharmaResources,
  createNonPharmaResource,
  updateNonPharmaResource,
  deleteNonPharmaResource,
} from '../controllers/nonPharmaController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public route (with optional authentication)
router.get('/', optionalAuth, getNonPharmaResources);

// Admin-only routes
router.post('/', protect, adminOnly, createNonPharmaResource);
router.put('/:id', protect, adminOnly, updateNonPharmaResource);
router.delete('/:id', protect, adminOnly, deleteNonPharmaResource);

export default router;
