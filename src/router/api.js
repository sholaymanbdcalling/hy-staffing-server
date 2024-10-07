import express from "express";
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
} from "../controllers/userController.js";
import {
    createJob,
    jobList,
    removeJob,
    updateJob,
    searchByKeyword,
    filterJob,
    listByCategory,
} from "../controllers/jobController.js";
import {
    profileDetails,
    saveProfile,
    updateProfile,
} from "../controllers/profileController.js";
import {
    createSuccessStory,
    removeStory,
    storyList,
    updateStory,
    userStories,
} from "../controllers/successStoryController.js";
import {
    categoryList,
    createCategory,
    removeCategory,
    updateCategory,
} from "../controllers/categoryController.js";
import {
    createTool,
    toolByType,
    updateTool,
} from "../controllers/toolController.js";
import {checkRole} from "../middlewares/checkRole.js";
import {verifyJWT} from "../middlewares/authVerifyMiddleware.js";
const router = express.Router();

// User routers
router.post("/register", registerUser);
router.post("/verify-otp", verifyEmail);
router.post("/login", loginUser);

// private route
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changePassword);
router.get("/userList/:pageNo/:perPage", verifyJWT, checkRole(["super admin", "admin", "moderator"]), userList);
router.delete("/removeUser/:id", verifyJWT, checkRole(["super admin", "admin"]), removeUser);
router.delete("/deleteUserAccount", verifyJWT, deleteUserAccount);
router.put("/updateRole/:id", verifyJWT, checkRole(["super admin", "admin"]), updateRole);
router.put('/updateProfile', verifyJWT, updateProfile);

//Job router
router.get("/jobList/:pageNo/:perPage", jobList);
router.post("/createJob", verifyJWT, createJob);
router.delete("/removeJob/:id", verifyJWT, checkRole(["super admin", "admin", "moderator", "company"]), removeJob);
router.put("/updateJob/:id", verifyJWT, updateJob);
router.get("/searchByKeyword/:pageNo/:perPage/:keyword", searchByKeyword);
router.post("/filterJob/:pageNo/:perPage", filterJob);
router.get("/listByCategory/:pageNo/:perPage/:id", verifyJWT, listByCategory);

//profile router
router.post("/saveProfile", verifyJWT, saveProfile);
router.get('/profileDetails', verifyJWT, profileDetails);
router.put('/updateProfile', verifyJWT, updateProfile);

//story routes
router.post("/createSuccessStory", verifyJWT, createSuccessStory);
router.get("/storyList", storyList);
router.delete("/removeStory/:id", verifyJWT, removeStory);
router.get("/userStories", verifyJWT, userStories);
router.put("/updateStory/:id", verifyJWT, updateStory);


//category routes
router.get("/categoryList", categoryList);
router.post("/createCategory", verifyJWT, checkRole(["super admin", "admin"]), createCategory);
router.delete("/removeCategory/:id", verifyJWT, checkRole(["super admin", "admin"]), removeCategory);
router.put("/updateCategory/:id", verifyJWT, checkRole(["super admin", "admin"]), updateCategory);

//tool routes
router.post("/createTool", verifyJWT,checkRole(["super admin", "admin"]), createTool);
router.put("/updateTool/:id", verifyJWT,checkRole(["super admin", "admin"]), updateTool);
router.get("/toolByType/:type", toolByType);

export default router;
