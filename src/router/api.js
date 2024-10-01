import express from 'express';
import { loginUser, logoutUser, registerUser, verifyEmail } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authVerifyMiddleware.js';
import { createJob, filterJob, jobList, removeJob, searchByKeyword, singleJob, updateJob } from '../controllers/jobController.js';
import { createProfile, profileDetails, profileList, removeProfile, updateStatus } from '../controllers/profileController.js';
import { createSuccessStory, removeStory, storyList, updateStory, userStories } from '../controllers/successStoryController.js';

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
router.get('/searchByKeyword/:keyword' , searchByKeyword);
router.post('/filterJob',filterJob);


//profile router
router.post('/createProfile',verifyJWT,createProfile);
router.get('/profileList',verifyJWT,profileList);
router.put('/updateStatus/:id/:status',verifyJWT,updateStatus);
router.delete('/removeProfile/:id',verifyJWT,removeProfile);
router.get('/profileDetails/:id', verifyJWT,profileDetails);


//story routes
router.post('/createSuccessStory',verifyJWT , createSuccessStory);
router.get('/storyList' , storyList);
router.delete('/removeStory/:id', verifyJWT , removeStory);
router.get('/userStories',verifyJWT,userStories);
router.put('/updateStory/:id',verifyJWT,updateStory);



export default router;
