import errorHandler from "../middlewares/errorHandler.js";
import Category from "../models/categoryModel.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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
        await Category.create(req.body);
        res.status(201).json(new ApiResponse(201, "New Category Added"));

    } catch (e) {
        errorHandler(e, res);
    }
};

//remove a category
const removeCategory = async (req, res) => {
    try {
        const id = req.params.id;
        let data = await Category.deleteOne({_id: id});
        if (data["deletedCount"] === 1) {
            res
                .status(200)
                .json(new ApiResponse(200, "Category Removed Successfully"));
        }

    } catch (e) {
        errorHandler(e, res);
    }
};

//update category
const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const {categoryName, image} = req.body;
        let updateConditions = {};
        if (categoryName !== undefined) {
            updateConditions.categoryName = categoryName;
        }
        if (image !== undefined) {
            updateConditions.image = image;
        }
        await Category.updateOne(
            {_id: id},
            updateConditions,
            {new: true}
        );
        res.status(200).json(new ApiResponse(200, "Category Update Successfully"));

    } catch (e) {
        errorHandler(e, res);
    }
};


export {categoryList, createCategory, removeCategory, updateCategory};
