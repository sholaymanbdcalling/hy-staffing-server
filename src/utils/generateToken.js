import User from '../models/userModel.js';
import { ApiError } from './ApiError.js';

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const token = await user.generateAccessToken();

    return token;
  } catch (error) {
    throw new ApiError(500, 'Something went wrong when generating token');
  }
};

export { generateToken };
