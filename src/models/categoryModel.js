import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
        categoryName: {type: String, required: [true, " Category Name is required"], index: true},
        image: {type: String, required: [true, "Image is required"], index: true}
    },
    {versionKey: false, timestamps: true});

const Category = mongoose.model('categories', categorySchema);
export default Category;