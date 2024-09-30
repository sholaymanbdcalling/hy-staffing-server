import express from 'express';
import { loginUser, logoutUser, registerUser, verifyEmail } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authVerifyMiddleware.js';
import { createJob, jobList, removeJob, singleJob, updateJob } from '../controllers/jobController.js';

const router = express.Router();

// User routers
router.post('/register', registerUser);
router.post('/verify-otp', verifyEmail);
router.post('/login', loginUser);
// private route
router.post('/logout', verifyJWT, logoutUser);


//Job router
router.get('/jobList', jobList);
router.post('/createJob',verifyJWT, createJob);
router.delete('/removeJob/:id',verifyJWT , removeJob);
router.get('/singleJob/:id',verifyJWT,singleJob);
router.put('/updateJob/:id',verifyJWT,updateJob);


export default router;
