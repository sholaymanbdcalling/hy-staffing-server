import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
        title:{type:String,required: true,index:true,unique:true},
        subTitle:{type:String,required: true,index:true},
        des:{type:String,required: true,index:true}
    },
    {versionKey:false,timestamps:true});

const Category = mongoose.model('categories', categorySchema);
export default Category;