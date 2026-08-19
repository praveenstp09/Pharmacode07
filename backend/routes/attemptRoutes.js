import express from 'express';
import {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
} from '../controllers/attemptController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All attempt routes require authentication

router.post('/submit', submitAttempt);
router.get('/my-attempts', getMyAttempts);
router.get('/:attemptId', getAttemptById);

export default router;
