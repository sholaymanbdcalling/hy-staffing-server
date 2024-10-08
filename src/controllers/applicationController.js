import Profile from '../models/profileModel.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import errorHandler from '../middlewares/errorHandler.js';
import Application from '../models/applicationModel.js';
import cloudinary from '../utils/FileUpload/cloudinary.js';
import fs from 'fs';
import path from 'path';

//application List
const applicationList = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo);
    let perPage = Number(req.params.perPage);
    let skipRow = (pageNo - 1) * perPage;
    let matchStage = { $match: {} };
    let skipStage = { $skip: skipRow };
    let limitStage = { $limit: perPage };
    let countStage = { $count: 'total' };
    let data = await Profile.aggregate([
      matchStage,
      skipStage,
      limitStage,
      {
        $addFields: {
          sortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'P'] }, then: 1 }, // Highest priority
                { case: { $eq: ['$status', 'A'] }, then: 2 }, // Second priority
                { case: { $eq: ['$status', 'R'] }, then: 3 }, // Lowest priority
              ],
              default: 4, // For any other status values
            },
          },
        },
      },
      {
        $sort: { sortOrder: 1 }, // Sort by the sortOrder field in ascending order
      },
      {
        $project: { sortOrder: 0 }, // Remove the sortOrder field from the output
      },
    ]);
    let totalCount = await Profile.aggregate([matchStage, countStage]);
    res.status(200).json(new ApiResponse(200, { data, totalCount }));
  } catch (e) {
    errorHandler(e, res);
  }
};

// update application status
const updateStatus = async (req, res) => {
  try {
    let { role, _id } = req.user;
    let id = req.params.id;
    let status = req.params.status;
    let userCount = await Profile.findOne({ userId: _id });
    if (role === 'company' && userCount) {
      let data = await Profile.updateOne({ _id: id }, { $set: { status: status } });
      if (data.modifiedCount === 1) {
        res.status(200).json(new ApiResponse(200, 'Status updated!'));
      }
    } else {
      throw new Error(401, 'unauthorized');
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//Create new application
const createApplication = async (req, res) => {
  try {
    const userId = req.user;

    if (!userId || !userId._id) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }

    const { subject, message } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded! Only PDF files are allowed.' });
    }

    const result = await uploadToCloudinary(file, userId._id);

    console.log('Cloudinary response:', result);

    const application = new Application({
      userId: userId._id,
      subject,
      message,
      file: result.secure_url,
    });

    await application.save();

    res.status(201).send({
      status: 'ok',
      data: {
        message: 'File uploaded and application created successfully',
        application: {
          userId: userId._id,
          subject,
          message,
          fileUrl: result.secure_url,
          status: application.status,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'File upload or database save failed',
      error: error.message,
    });
  }
};

const uploadToCloudinary = (file, userId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'pdf-uploads',
        public_id: `${userId}-${file.originalname.replace(/ /g, '-')}`,
        format: 'pdf',
        access_mode: 'public',
      },
      (error, result) => {
        if (error) {
          return reject(new Error('Cloudinary upload failed: ' + error.message));
        }
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

export { applicationList, createApplication };
