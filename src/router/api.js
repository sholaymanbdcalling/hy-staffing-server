import express from 'express';
import { loginUser, logoutUser, registerUser, verifyEmail } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authVerifyMiddleware.js';

const router = express.Router();

// User routers
router.post('/register', registerUser);
router.post('/verify-otp', verifyEmail);
router.post('/login', loginUser);
// private route
router.post('/logout', verifyJWT, logoutUser);

export default router;
