import express from 'express';
import { uploadResume, getResumes, getResumeById, getResumeFile, deleteResume } from '../Controllers/resumeController.js';
import { protect } from '../Middlewares/auth.js';
import { upload } from '../Middlewares/upload.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadResume);
router.get('/', protect, getResumes);
router.get('/:id', protect, getResumeById);
router.get('/:id/file', protect, getResumeFile);
router.delete('/:id', protect, deleteResume);

export default router;
