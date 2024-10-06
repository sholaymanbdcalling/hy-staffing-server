import express from 'express';
import {
    changePassword,
    deleteUserAccount,
    loginUser,
    logoutUser,
    registerUser,
    removeUser,
    updateRole,
    userList,
    verifyEmail,
} from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authVerifyMiddleware.js';
import {
    createJob,
    filterJob,
    jobList,
    listByCategory,
    removeJob,
    searchByKeyword,
    singleJob,
    updateJob,
} from '../controllers/jobController.js';
import {
    createProfile,
    profileDetails,
    profileList,
    removeProfile,
    updateProfile,
    updateStatus,
} from '../controllers/profileController.js';
import {
    createSuccessStory,
    removeStory,
    storyList,
    updateStory,
    userStories,
} from '../controllers/successStoryController.js';
import {
    categoryList,
    createCategory,
    removeCategory,
    updateCategory,
} from '../controllers/categoryController.js';

import { createTool, toolByType, updateTool } from '../controllers/toolController.js';


const router = express.Router();

// User routers
router.post('/register', registerUser);
router.post('/verify-otp', verifyEmail);
router.post('/login', loginUser);

// private route

router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changePassword);
router.get("/userList/:pageNo/:perPage", verifyJWT, userList);
router.delete("/removeUser/:id", verifyJWT, removeUser);
router.delete("/deleteUserAccount", verifyJWT, deleteUserAccount);
router.put("/updateRole/:id/:role", verifyJWT, updateRole);
router.get("/userInfo", verifyJWT, userInfo);
router.put('/updateProfile',verifyJWT,updateProfile);


//Job router
router.get('/jobList/:pageNo/:perPage', jobList);
router.post('/createJob', verifyJWT, createJob);
router.delete('/removeJob/:id', verifyJWT, removeJob);
router.get('/singleJob/:id', verifyJWT, singleJob);
router.put('/updateJob/:id', verifyJWT, updateJob);
router.get('/searchByKeyword/:keyword', searchByKeyword);
router.post('/filterJob', filterJob);
router.get('/listByCategory/:id', verifyJWT, listByCategory);

//profile router
router.post('/createProfile', verifyJWT, createProfile);
router.get('/profileList/:pageNo/:perPage', verifyJWT, profileList);
router.put('/updateStatus/:id/:status', verifyJWT, updateStatus);
router.delete('/removeProfile/:id', verifyJWT, removeProfile);
router.get('/profileDetails/:id', verifyJWT, profileDetails);

//story routes
router.post('/createSuccessStory', verifyJWT, createSuccessStory);
router.get('/storyList', storyList);
router.delete('/removeStory/:id', verifyJWT, removeStory);
router.get('/userStories', verifyJWT, userStories);
router.put('/updateStory/:id', verifyJWT, updateStory);

//category routes
router.get('/categoryList', categoryList);
router.post('/createCategory', verifyJWT, createCategory);
router.delete('/removeCategory/:id', verifyJWT, removeCategory);
router.put('/updateCategory/:id', verifyJWT, updateCategory);

//tool routes
router.post('/createTool', verifyJWT, createTool);
router.put('/updateTool/:id', verifyJWT, updateTool);
router.get('/toolByType/:type', toolByType);


export default router;