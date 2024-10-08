import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/userModel.js';
import EmailSend from '../utils/EmailHelper.js';
import { generateToken } from '../utils/generateToken.js';
import errorHandler from '../middlewares/errorHandler.js';

// register a user controller
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password, role } = req.body;
    const subject = 'Email verification';
    const OTP = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .padStart(6, '0');
    const text = `Your email verification code is ${OTP}`;

    // Validate required fields
    if (
      [firstName, lastName, mobile, email, password, role].some((field) => field?.trim() === '')
    ) {
      throw new ApiError(400, 'All fields are required');
    }

    // Check for existing user by email
    const existedUser = await User.findOne({ email: email.toLowerCase() });

    if (existedUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Send email
    await EmailSend(email, subject, text);

    // Create the user
    const user = await User.create({
      firstName,
      lastName,
      mobile,
      email: email.toLowerCase(),
      password,
      role,
      otp: OTP,
    });

    // Fetch the created user without sensitive fields
    const createdUser = await User.findById(user._id).select('-password -otp');

    if (!createdUser) {
      return res.status(500).json({ message: 'Something went wrong when registering the user' });
    }

    return res.status(200).json(new ApiResponse(200, createdUser, 'success'));
  } catch (error) {
    console.error('Error during user registration:', error);

    // Return an appropriate error response based on the error type
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'An unexpected error occurred during registration' });
  }
};

// verify email controller
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;

    // Validate required fields
    if (!otp?.trim()) {
      throw new ApiError(400, 'OTP is required');
    }

    // Check for existing user by otp
    const user = await User.findOne({ otp });

    if (!user) {
      throw new ApiError(409, 'OTP is not matching');
    }

    // Clear the OTP
    user.otp = null;
    await user.save();

    // Fetch the created user without sensitive fields
    const verifiedUser = await User.findById(user._id).select('-password -otp');

    if (!verifiedUser) {
      return res.status(500).json({ message: 'Something went wrong when registering the user' });
    }

    return res.status(200).json(new ApiResponse(200, verifiedUser, 'Otp verification successfull'));
  } catch (error) {
    console.error('Error during otp verification:', error);

    // Return an appropriate error response based on the error type
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'An unexpected error occurred during otp verification',
    });
  }
};

// login user controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //   find user
    const user = await User.findOne({ email });
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
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie('token', token, option)
      .cookie('firstName', user.firstName, option)
      .cookie('lastName', user.lastName, option)
      .cookie('email', user.email, option)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            token,
          },
          'User logged in successfully',
        ),
      );
  } catch (error) {
    console.error('Error during user login:', error);

    // Return an appropriate error response based on the error type
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'An unexpected error occurred during user login' });
  }
};

// logout user controller
const logoutUser = async (req, res) => {
  const option = {
    httpOnly: true,
    secure: true,
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
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { email } = req.user;
    // console.log(email);

    //   find user
    const user = await User.findOne({ email });
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
    return res.status(200).json(new ApiResponse(200, updatedUser, 'Password change successfully'));
  } catch (error) {
    console.error('Error during password change:', error);

    // Return an appropriate error response based on the error type
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: 'An unexpected error occurred during password change',
    });
  }
};

//user list count
const userList = async (req, res) => {
  try {
    const { role } = req.user;
    let pageNo = Number(req.params.pageNo);
    let perPage = Number(req.params.perPage);
    let skipRow = (pageNo - 1) * perPage;
    if (role === 'admin') {
      let matchStage = { $match: {} };
      let skipStage = { $skip: skipRow };
      let limitStage = { $limit: perPage };
      let projectStage = { $project: { password: 0, otp: 0 } };
      let data = await User.aggregate([matchStage, skipStage, limitStage, projectStage]);
      let countStage = { $count: 'total' };
      let totalCount = await User.aggregate([matchStage, countStage]);
      res.status(200).json(new ApiResponse(200, { data, totalCount }));
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//user info
const userInfo = async (req, res) => {
  try {
    const { _id } = req.user;
    let matchStage = { $match: { _id: _id } };
    let joinWithProfileStage = {
      $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' },
    };
    let unwindJoin = { $unwind: '$profile' };
    let projectStage = {
      $project: {
        password: 0,
        role: 0,
        'profile?.subject': 0,
        'profile?.message': 0,
        'profile?.file': 0,
      },
    };
    let data = await User.aggregate([matchStage, joinWithProfileStage, unwindJoin, projectStage]);
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e, res);
  }
};

//remove a user
const removeUser = async (req, res) => {
  try {
    const { role } = req.user;
    const id = req.params.id;
    if (role === 'admin') {
      let data = await User.deleteOne({ _id: id });
      if (data.deletedCount) {
        res.status(200).json(new ApiResponse(200, 'Removed user successfully'));
      }
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//delete user's own account
const deleteUserAccount = async (req, res) => {
  try {
    const { _id, role } = req.user;
    let data = await User.deleteOne({ _id: _id, role: role });
    if (data.deletedCount) {
      res.status(200).json(new ApiResponse(200, 'Account Delete successfully'));
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//update a user's role
const updateRole = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const id = req.params.id;
    const newRole = req.params.role;
    if (role === 'admin') {
      const data = await User.updateOne({ _id: id }, { $set: { role: newRole } });
      if (data.matchedCount == 1 && data.modifiedCount === 1 && data.acknowledged) {
        res.status(200).json(new ApiResponse(200, data));
      }
    }
  } catch (e) {
    errorHandler(e, res);
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
  userInfo,
  changePassword,
};
