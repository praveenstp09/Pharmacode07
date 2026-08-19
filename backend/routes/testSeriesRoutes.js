import express from 'express';
import {
  getTestSeries,
  getTestSeriesBySlug,
  getTestPaperForAttempt,
  getPracticeMCQs,
} from '../controllers/testSeriesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTestSeries);
router.get('/practice/mcqs', getPracticeMCQs);
router.get('/:slug', getTestSeriesBySlug);
router.get('/paper/:paperId', protect, getTestPaperForAttempt);

export default router;
