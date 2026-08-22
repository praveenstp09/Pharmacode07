import express from 'express';
import {
  getTestSeries,
  getTestSeriesBySlug,
  getTestPaperForAttempt,
  getPracticeMCQs,
} from '../controllers/testSeriesController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getTestSeries);
router.get('/practice/mcqs', getPracticeMCQs);
router.get('/:slug', optionalAuth, getTestSeriesBySlug);
router.get('/paper/:paperId', protect, getTestPaperForAttempt);

export default router;
