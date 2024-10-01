import errorHandler from "../middlewares/errorHandler.js";
import Category from "../models/categoryModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const { role } = req.user;
    if (role === "admin") {
      await Category.create(req.body);
      res.status(201).json(new ApiResponse(201, "New Category Added"));
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//remove a category
const removeCategory = async (req, res) => {
  try {
    const { role } = req.user;
    const id = req.params.id;
    if (role === "admin") {
      let data = await Category.deleteOne({ _id: id });
      if (data.deletedCount === 1) {
        res
          .status(200)
          .json(new ApiResponse(200, "Category Removed Successfull"));
      }}
  } catch (e) {
    errorHandler(e, res);
  }
};

//update category
const updateCategory = async (req, res) => {
  try {
    const { role } = req.user;
    const id = req.params.id;
    const reqBody = req.body;
    if (role === "admin") {
      let data = await Category.updateOne(
        { _id: id },
        { $set: reqBody },
        { upsert: true }
      );
      if (
        data.modifiedCount === 1 &&
        data.matchedCount === 1 &&
        data.acknowledged
      ) {
        res
          .status(200)
          .json(new ApiResponse(200, "Category Update Successfull"));
      } 
    }
  } catch (e) {
    errorHandler(e, res);
  }
};



export { categoryList, createCategory, removeCategory,updateCategory };
