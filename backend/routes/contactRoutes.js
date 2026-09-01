import express from 'express';
import { submitContact } from '../controllers/contactController.js';
import { toggleContactResolved, deleteContact } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { publicModerateLimiter } from '../middleware/rateLimiter.js';
import { validateContact } from '../middleware/validate.js';

const router = express.Router();

router.post('/', publicModerateLimiter, validateContact, submitContact);
router.put('/:id/resolve', protect, adminOnly, toggleContactResolved);
router.patch('/:id/resolve', protect, adminOnly, toggleContactResolved);
router.put('/:id', protect, adminOnly, toggleContactResolved);
router.patch('/:id', protect, adminOnly, toggleContactResolved);
router.delete('/:id', protect, adminOnly, deleteContact);

export default router;
