import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../Controllers/authController.js';
import { protect } from '../Middlewares/auth.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;
