import { ApiResponse } from '../utils/ApiResponse.js';
import errorHandler from '../middlewares/errorHandler.js';
import Application from '../models/applicationModel.js';
import cloudinary from '../utils/FileUpload/cloudinary.js';
import EmailSend from '../utils/EmailHelper.js';
import User from '../models/userModel.js';

//application List
const applicationList = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo);
    let perPage = Number(req.params.perPage);
    let skipRow = (pageNo - 1) * perPage;

    let matchStage = { $match: {} };
    let projectStage = {
      $project: {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        file: 1,
        userId: 1,
        subject: 1,
        message: 1,
        status: 1,
      },
    };
    let skipStage = { $skip: skipRow };
    let limitStage = { $limit: perPage };
    let countStage = { $count: 'total' };

    // Fetch paginated data
    let data = await Application.aggregate([matchStage, projectStage, skipStage, limitStage]);
    // Fetch total count
    let totalCount = await Application.aggregate([matchStage, countStage]);

    res.status(200).json({ status: 'ok', data: data, totalCount: totalCount });
  } catch (e) {
    errorHandler(e, res);
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    let { role, _id } = req.user;
    let applicationId = req.params.id;
    let status = req.body.status;

    // Check if the admin exists
    let isExistAdmin = await User.findOne({ _id: _id });

    let isExistApplication = await Application.findOne({ _id: applicationId });

    console.log('This is applicant user id ', isExistApplication['userId'].toString());

    console.log(isExistApplication['firstName']);
    console.log(isExistApplication['lastName']);
    console.log(isExistApplication['email']);

    // Application accepted
    if (role === 'company' && status === 'Accepted' && isExistApplication && isExistAdmin) {
      await Application.updateOne({ _id: applicationId }, { $set: { status: status } });
      let applicationMessage = `Dear ${isExistApplication['firstName']} ${isExistApplication['lastName']},

      We are pleased to inform you that your application has been accepted. We will contact you shortly with further details.

      Best regards,
      Human Resource Manager
      Hy Staffing`;
      EmailSend(isExistApplication['email'], 'Your application is accepted', applicationMessage);

      res.status(201).json({
        status: 'ok',
        data: 'Application status updated',
      });
    } else if (role === 'company' && status === 'Rejected' && isExistApplication && isExistAdmin) {
      await Application.updateOne({ _id: applicationId }, { $set: { status: status } });
      let applicationMessage = `Dear ${isExistApplication['firstName']} ${isExistApplication['lastName']},

      We regret to inform you that your application has been rejected. Thank you for your interest.

      Best regards,
      Human Resource Manager
      Hy Staffing`;
      EmailSend(isExistApplication['email'], 'Your application is accepted', applicationMessage);

      res.status(201).json({
        status: 'ok',
        data: 'Application status updated',
      });
    }
  } catch (error) {
    // Handle any other errors
    res.status(500).json({ status: 'failed', error: error.message });
  }
};

//Create new application
const createApplication = async (req, res) => {
  try {
    const user = req.user;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const email = user.email;
    const phone = user.mobile;

    if (!user || !user._id) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }

    const { subject, message } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded! Only PDF files are allowed.' });
    }

    const result = await uploadToCloudinary(file, user._id);

    const application = new Application({
      firstName,
      lastName,
      email,
      phone,
      userId: user._id,
      subject,
      message,
      file: result.secure_url,
    });

    await application.save();

    let applicationMessage = `Thank you ${
      firstName + ' ' + lastName
    } . Your application is successfully received.`;

    EmailSend(email, subject, applicationMessage);

    res.status(201).send({
      status: 'ok',
      data: {
        message: 'Application submitted successfully',
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

const deleteApplication = async (req, res) => {
  try {
    const id = req.params.id;
    await Application.deleteOne({ _id: id });
    res.status(200).json({ status: 'ok', message: 'Application is deleted' });
  } catch (error) {
    res.status(200).json('Something wents wrong');
  }
};

export { applicationList, createApplication, updateApplicationStatus, deleteApplication };
