import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { ApiError } from '../utils/ApiError.js';

export const verifyJWT = async (req, _, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select('-password -otp');
    if (!user) {
      throw new ApiError(401, 'Invalid accessToken');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in verifyJWT:', error); // Log the error for debugging
    throw new ApiError(401, 'Something went wrong');
  }
};
