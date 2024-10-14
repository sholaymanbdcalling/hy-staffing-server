import errorHandler from '../middlewares/errorHandler.js';
import Profile from '../models/profileModel.js';
import { ApiResponse } from '../utils/ApiResponse.js';

//create or update profile
const saveProfile = async (req, res) => {
  try {
    let { _id } = req.user;
    let reqBody = req.body;
    reqBody.userId = _id;
    let userCount = await Profile.findOne({ userId: _id });
    if (userCount === null) {
      await Profile.create(reqBody);
      return res.status(201).json(new ApiResponse(201, 'Profile Created!'));
    } else {
      let data = await Profile.updateOne({ userId: _id }, { $set: reqBody }, { upsert: true });
      if (data.acknowledged && data.modifiedCount === 1 && data.matchedCount === 1) {
        res.status(200).json(new ApiResponse(200, 'Profile Updated!'));
      }
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

// profile details
const profileDetails = async (req, res) => {
  try {
    const { _id } = req.user;
    let matchStage = { $match: { userId: _id } };
    let joinWithProfileStage = {
      $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' },
    };
    let unwindJoin = { $unwind: '$user' };
    let projectStage = {
      $project: {
        updatedAt: 0,
        createdAt: 0,
        _id: 0,
        userId: 0,
        'user.password': 0,
        'user._d': 0,
        'user.otp': 0,
        'user.createdAt': 0,
        'user.updatedAt': 0,
      },
    };
    let data = await Profile.aggregate([
      matchStage,
      joinWithProfileStage,
      unwindJoin,
      projectStage,
    ]);
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e, res);
  }
};

//update profile info
const updateProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    const { avatar, bio, about, address, facebook, linkedIn } = req.body;

    let updateFields = {};

    if (bio !== undefined) {
      updateFields.bio = bio; // Only update if bio is present
    }
    if (about !== undefined) {
      updateFields.about = about; // Only update if about is present
    }
    if (address !== undefined) {
      updateFields.address = address; // Only update if address is present
    }
    if (facebook !== undefined) {
      updateFields.facebook = facebook; // Only update if facebook is present
    }
    if (linkedIn !== undefined) {
      updateFields.linkedIn = linkedIn; // Only update if linkedIN is present
    }
    if (avatar) {
      updateFields.avatar = avatar; // Assuming you're handling the image upload via multer
    }

    let data = await Profile.updateOne({ userId: _id }, updateFields, { new: true });
    if (data.acknowledged && data.modifiedCount === 1 && data.matchedCount === 1) {
      res.status(200).json(new ApiResponse(200, 'Profile updated successfully!'));
    } else {
      res.status(400).json({ message: 'Nothing to update!' });
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

export { saveProfile, profileDetails, updateProfile };
