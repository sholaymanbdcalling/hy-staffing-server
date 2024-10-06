import Logo from '../models/logoModel.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const updateLogo = async (req, res) => {
  try {
    const { whiteLogo, blackLogo } = req.files;

    if (!whiteLogo && !blackLogo) {
      throw new ApiError(400, 'No files uploaded');
    }

    const logoUpdates = {};

    // upload white logo
    if (whiteLogo && whiteLogo.length > 0) {
      const whiteLogoPath = whiteLogo[0].path;
      const whiteLogoUploadResult = await uploadOnCloudinary(whiteLogoPath);
      logoUpdates.whiteLogo = whiteLogoUploadResult.secure_url;
    }

    // upload black logo
    if (blackLogo && blackLogo.length > 0) {
      const blackLogoPath = blackLogo[0].path;
      const blackLogoUploadResult = await uploadOnCloudinary(blackLogoPath);
      logoUpdates.blackLogo = blackLogoUploadResult.secure_url;
    }

    // Update the logo document in the database
    const logo = await Logo.findOneAndUpdate({}, logoUpdates, { new: true, upsert: true });

    return res.status(200).json(new ApiResponse(200, logo, 'Logo update successfully'));
  } catch (error) {
    console.error('Error during logo update:', error);

    // Return an appropriate error response based on the error type
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: 'An unexpected error occurred during logo update' });
  }
};

export { updateLogo };
