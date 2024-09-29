import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/userModel.js';
import EmailSend from '../utils/EmailHelper.js';
import { generateToken } from '../utils/generateToken.js';

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const subject = 'Email verification';
    const OTP = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .padStart(6, '0');
    const text = `Your email verification code is ${OTP}`;

    // Validate required fields
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'All fields are required' });
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
      email: email.toLowerCase(),
      password,
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

    return res
      .status(500)
      .json({ message: 'An unexpected error occurred during otp verification' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //   find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User does not exist');
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
};

const logoutUser = async (req, res) => {
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('token', option)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
};

export { registerUser, verifyEmail, loginUser, logoutUser };
