import {ApiResponse} from '../utils/ApiResponse.js';
import {ApiError} from '../utils/ApiError.js';
import User from '../models/userModel.js';
import Profile from '../models/profileModel.js';
import EmailSend from '../utils/EmailHelper.js';
import {generateToken} from '../utils/generateToken.js';
import errorHandler from '../middlewares/errorHandler.js';

// register a user controller
const registerUser = async (req, res) => {
    try {
        const {firstName, lastName, mobile, email, password, role} = req.body;
        const subject = 'Email verification';
        const OTP = Math.floor(100000 + Math.random() * 900000)
            .toString()
            .padStart(6, '0');
        const text = `Your email verification code is ${OTP}`;

        // Validate required fields
        if ([firstName, lastName, mobile, email, password, role].some((field) => field?.trim() === '')) {
            throw new ApiError(400, 'All fields are required');
        }

        // Check for existing user by email
        const existedUser = await User.findOne({email: email.toLowerCase()});

        if (existedUser) {
            return res.status(409).json({message: 'User with this email already exists'});
        }

        // Send email
        await EmailSend(email, subject, text);

        // Create the user
        const user = await User.create({
            firstName, lastName, mobile, email: email.toLowerCase(), password, role, otp: OTP,
        });

        // Fetch the created user without sensitive fields
        const createdUser = await User.findById(user._id).select('-password -otp');

        if (!createdUser) {
            return res.status(500).json({message: 'Something went wrong when registering the user'});
        }

        return res.status(200).json(new ApiResponse(200, createdUser, 'success'));
    } catch (error) {
        console.error('Error during user registration:', error);

        // Return an appropriate error response based on the error type
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({message: error.message});
        }

        return res.status(500).json({message: 'An unexpected error occurred during registration'});
    }
};

// verify email controller
const verifyEmail = async (req, res) => {
    try {
        const {otp} = req.body;

        // Validate required fields
        if (!otp?.trim()) {
            throw new ApiError(400, 'OTP is required');
        }

        // Check for existing user by otp
        const user = await User.findOne({otp});

        if (!user) {
            throw new ApiError(409, 'OTP is not matching');
        }

        // Clear the OTP
        user.otp = null;
        await user.save();

        // Fetch the created user without sensitive fields
        const verifiedUser = await User.findById(user._id).select('-password -otp');

        if (!verifiedUser) {
            return res.status(500).json({message: 'Something went wrong when registering the user'});
        }

        return res.status(200).json(new ApiResponse(200, verifiedUser, 'Otp verification successfull'));
    } catch (error) {
        console.error('Error during otp verification:', error);

        // Return an appropriate error response based on the error type
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({message: error.message});
        }

        return res.status(500).json({
            message: 'An unexpected error occurred during otp verification',
        });
    }
};

// login user controller
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        //   find user
        const user = await User.findOne({email});
        if (!user) {
            throw new ApiError(404, 'User does not exist');
        }

        // Is email verified
        if (user?.otp !== null) {
            throw new ApiError(404, 'Email is not verified');
        }

        //   check is password valid
        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid user credentials');
        }

        const token = await generateToken(user._id);

        const loggedInUser = await User.findById(user._id).select('-password -otp');

        const option = {
            httpOnly: true, secure: true,
        };

        return res
            .status(200)
            .cookie('token', token, option)
            .cookie('firstName', user.firstName, option)
            .cookie('lastName', user.lastName, option)
            .cookie('email', user.email, option)
            .json(new ApiResponse(200, {
                user: loggedInUser, token,
            }, 'User logged in successfully',),);
    } catch (error) {
        console.error('Error during user login:', error);

        // Return an appropriate error response based on the error type
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({message: error.message});
        }

        return res.status(500).json({message: 'An unexpected error occurred during user login'});
    }
};

// logout user controller
const logoutUser = async (req, res) => {
    const option = {
        httpOnly: true, secure: true,
    };

    return res
        .status(200)
        .clearCookie('token', option)
        .clearCookie('firstName', option)
        .clearCookie('lastName', option)
        .clearCookie('email', option)
        .json(new ApiResponse(200, {}, 'User logged out successfully'));
};

// change password user
const changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword, confirmPassword} = req.body;
        const {email} = req.user;
        // console.log(email);

        //   find user
        const user = await User.findOne({email});
        if (!user) {
            throw new ApiError(404, 'User does not exist');
        }

        //   check is password valid
        const isPasswordValid = await user.isValidPassword(oldPassword);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid user credentials');
        }

        if (newPassword !== confirmPassword) {
            throw new ApiError(404, 'Password not matched');
        }

        // change password
        user.password = newPassword;
        await user.save();

        // Fetch the created user without sensitive fields
        const updatedUser = await User.findById(user._id).select('-password -otp');

        // response
        return res.status(200).json(new ApiResponse(200, 'Password change successfully'));
    } catch (error) {
        console.error('Error during password change:', error);

        // Return an appropriate error response based on the error type
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({message: error.message});
        }

        return res.status(500).json({
            message: 'An unexpected error occurred during password change',
        });
    }
};

//user list count
const userList = async (req, res) => {
    try {
        let pageNo = Number(req.params.pageNo);
        let perPage = Number(req.params.perPage);
        let skipRow = (pageNo - 1) * perPage;

        let matchStage = {$match: {}};
        let skipStage = {$skip: skipRow};
        let limitStage = {$limit: perPage};
        let projectStage = {
            $project: {
                _id: 1, email: 1, mobile: 1, firstName: 1, lastName: 1, "profile.avatar": 1, role: 1
            }
        };
        let joinStage = {$lookup: {from: "profiles", localField: "_id", foreignField: "userId", as: "profile"}};
        let unwindJoin = {$unwind: "$profile"};
        let data = await User.aggregate([matchStage, skipStage, limitStage, joinStage, unwindJoin, projectStage]);
        let countStage = {$count: 'total'};
        let totalCount = await User.aggregate([matchStage, countStage]);
        res.status(200).json(new ApiResponse(200, {data, totalCount}));

    } catch (e) {
        errorHandler(e, res);
    }
};


//remove a user
const removeUser = async (req, res) => {
    try {
        const id = req.params.id;
        const {role} = req.user;
        const userCount = await User.findById({_id: id});
        if ((role === "admin" || role === "super admin") && userCount.role === "super admin") {
            res.status(403).json({message: "Access denied"});
        }
        else if(role === "admin" && userCount.role === "admin") {
            res.status(403).json({message: "Access denied"});
        }
        else {
            let userData = await User.deleteOne({_id: id});
            let profileCount = await Profile.findOne({_id: id});
            if (profileCount !== null) {
                let profileData = await Profile.deleteOne({userId: id});
                if (userData.deletedCount === 1 && profileData.deletedCount === 1) {
                    res.status(200).json(new ApiResponse(200, "Account Deleted"));
                }
            } else {
                if (userData.deletedCount === 1) {
                    res.status(200).json(new ApiResponse(200, "Account Deleted"));
                } else {
                    res.status(400).json({message: "User not found"});
                }
            }
        }
    } catch (e) {
        errorHandler(e, res);
    }
};

//delete user's own account
const deleteUserAccount = async (req, res) => {
    try {
        const {_id, role} = req.user;
        let data = await User.deleteOne({_id: _id, role: role});
        let userCount = await Profile.findOne({userId: _id});
        if (userCount !== null) {
            let profileData = await Profile.deleteOne({userId: _id});
            if (data.deletedCount && profileData.deletedCount) {
                res.status(200).json(new ApiResponse(200, 'Account Delete successfully'));
            }
        } else {
            if (data.deletedCount) {
                res.status(200).json(new ApiResponse(200, 'Account Delete successfully'));
            }
        }

    } catch (e) {
        errorHandler(e, res);
    }
};

//update a user's role
const updateRole = async (req, res) => {
    const {id} = req.params;
    const {newRole} = req.body;
    const currentRole = req.user.role; // Role of the user making the request

    // Prevent assigning super admin
    if (newRole === 'super admin') {
        return res.status(403).json({message: 'You cannot assign the Super Admin role'});
    }

    // Prevent assigning admin unless the requester is super admin
    if (newRole === 'admin' && currentRole !== 'super admin') {
        return res.status(403).json({message: 'Only Super Admin can assign the Admin role'});
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(id, {role: newRole}, {new: true});
        if (!updatedUser) {
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({message: 'Error updating user role'});
    }
};

export {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    userList,
    removeUser,
    deleteUserAccount,
    updateRole,
    changePassword,
};