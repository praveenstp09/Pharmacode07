import express from 'express';
import {
  getPublishedPacks,
  getPackDetails,
} from '../controllers/studyPackController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPublishedPacks);
router.get('/:slug', optionalAuth, getPackDetails);

export default router;
