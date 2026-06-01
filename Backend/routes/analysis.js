import express from 'express';
import { createJobAnalysis, getJobAnalyses, getJobAnalysisById } from '../Controllers/analysisController.js';
import { protect } from '../Middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createJobAnalysis);
router.get('/', protect, getJobAnalyses);
router.get('/:id', protect, getJobAnalysisById);

export default router;
