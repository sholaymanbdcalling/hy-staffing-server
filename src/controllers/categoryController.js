import errorHandler from '../middlewares/errorHandler.js';
import Category from '../models/categoryModel.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

//category List
const categoryList = async (req, res) => {
  try {
    let data = await Category.find({});
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e, res);
  }
};

//create a new category
const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    // Log incoming files
    // console.log('Received files:', req.files);

    // Validate if the image file is provided
    if (!req.files || !req.files.categoryImage || req.files.categoryImage.length === 0) {
      throw new ApiError(400, 'Image file is required');
    }

    // Get image local path
    const imageLocalPath = req.files.categoryImage[0].path;

    // Upload image to cloud storage
    let categoryImage;
    if (imageLocalPath) {
      categoryImage = await uploadOnCloudinary(imageLocalPath);
      if (!categoryImage) {
        throw new ApiError(400, 'Image upload failed');
      }
    } else {
      throw new ApiError(400, 'Image file is required');
    }

    // Create the category
    const category = await Category.create({
      categoryName,
      categoryImage: categoryImage.url,
    });

    // Send success response
    res.status(201).json(new ApiResponse(201, category, 'New Category Added'));
  } catch (e) {
    console.error('Error in createCategory:', e);
    errorHandler(e, res);
  }
};

//remove a category
const removeCategory = async (req, res) => {
  try {
    const id = req.params.id;
    let data = await Category.deleteOne({ _id: id });
    if (data['deletedCount'] === 1) {
      res.status(200).json(new ApiResponse(200, 'Category Removed Successfully'));
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//update category
const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { categoryName, image } = req.body;
    let updateConditions = {};
    if (categoryName !== undefined) {
      updateConditions.categoryName = categoryName;
    }
    if (image !== undefined) {
      updateConditions.image = image;
    }
    await Category.updateOne({ _id: id }, updateConditions, { new: true });
    res.status(200).json(new ApiResponse(200, 'Category Update Successfully'));
  } catch (e) {
    errorHandler(e, res);
  }
};

export { categoryList, createCategory, removeCategory, updateCategory };
