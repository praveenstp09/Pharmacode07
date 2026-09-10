import express from 'express';
import {
  getTestSeries,
  getTestSeriesBySlug,
  getTestPaperForAttempt,
  getPracticeMCQs,
} from '../controllers/testSeriesController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { publicModerateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', optionalAuth, getTestSeries);
router.get('/practice/mcqs', optionalAuth, publicModerateLimiter, getPracticeMCQs);
router.get('/:slug', optionalAuth, getTestSeriesBySlug);
router.get('/paper/:paperId', protect, getTestPaperForAttempt);

export default router;
