import Logo from '../models/logoModel.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const getLogo = async (req, res) => {
  try {
    // Hardcoded logo ID
    const id = '67076fbc1c60c1072b4815d6';

    // Retrieve the logo document from the database using the Object ID
    const logo = await Logo.findById(id);

    if (!logo) {
      throw new ApiError(404, 'Logo not found');
    }

    return res.status(200).json(new ApiResponse(200, logo, 'Logo retrieved successfully'));
  } catch (error) {
    console.error('Error during logo retrieval:', error);

    // Return an appropriate error response based on the error type
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    }

    return res
      .status(500)
      .json(new ApiResponse(500, null, 'An unexpected error occurred during logo retrieval'));
  }
};

const updateLogo = async (req, res) => {
  try {
    const { whiteLogo, blackLogo } = req.files;

    if (!whiteLogo && !blackLogo) {
      throw new ApiError(400, 'No files uploaded');
    }

    const logoUpdates = {};

    // Hardcoded logo ID
    const id = '67076fbc1c60c1072b4815d6';

    // Upload white logo
    if (whiteLogo && whiteLogo.length > 0) {
      const whiteLogoPath = whiteLogo[0].path;
      const whiteLogoUploadResult = await uploadOnCloudinary(whiteLogoPath);
      logoUpdates.whiteLogo = whiteLogoUploadResult.secure_url;
    }

    // Upload black logo
    if (blackLogo && blackLogo.length > 0) {
      const blackLogoPath = blackLogo[0].path;
      const blackLogoUploadResult = await uploadOnCloudinary(blackLogoPath);
      logoUpdates.blackLogo = blackLogoUploadResult.secure_url;
    }

    // Update the logo document in the database using the hardcoded ID
    const logo = await Logo.findByIdAndUpdate(id, logoUpdates, { new: true });

    if (!logo) {
      throw new ApiError(404, 'Logo not found');
    }

    return res.status(200).json(new ApiResponse(200, logo, 'Logo updated successfully'));
  } catch (error) {
    console.error('Error during logo update:', error);

    // Return an appropriate error response based on the error type
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    }

    return res
      .status(500)
      .json(new ApiResponse(500, null, 'An unexpected error occurred during logo update'));
  }
};

export { getLogo, updateLogo };
