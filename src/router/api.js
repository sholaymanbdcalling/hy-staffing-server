import express from 'express';
import { loginUser, logoutUser, registerUser, verifyEmail } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authVerifyMiddleware.js';
import { createJob, filterJob, jobList, listByCategory, removeJob, searchByKeyword, singleJob, updateJob } from '../controllers/jobController.js';
import { createProfile, profileDetails, profileList, removeProfile, updateStatus } from '../controllers/profileController.js';
import { createSuccessStory, removeStory, storyList, updateStory, userStories } from '../controllers/successStoryController.js';
import { categoryList, createCategory, removeCategory, updateCategory } from '../controllers/categoryController.js';

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
router.get('/listByCategory/:id',verifyJWT,listByCategory)


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

//category routes
router.get('/categoryList' , categoryList);
router.post('/createCategory' , verifyJWT , createCategory);
router.delete('/removeCategory/:id',verifyJWT,removeCategory);
router.put('/updateCategory/:id',verifyJWT,updateCategory);

export default router;
