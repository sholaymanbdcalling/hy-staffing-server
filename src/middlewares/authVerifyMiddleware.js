import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { ApiError } from '../utils/ApiError.js';

export const verifyJWT = async (req, _, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
    if (!token) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decodedToken?.userId).select('-password -otp');
    if (!user) {
      throw new ApiError(401, 'Invalid accessToken');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Something went wrong');
  }
};
