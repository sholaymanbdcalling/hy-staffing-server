import express from 'express';
import { loginUser, registerUser, verifyEmail } from '../controllers/userController.js';

const router = express.Router();

// User routers
router.post('/register', registerUser);
router.post('/verify-otp', verifyEmail);
router.post('/login', loginUser);

export default router;
