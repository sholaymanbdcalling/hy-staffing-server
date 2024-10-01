import errorHandler from "../middlewares/errorHandler.js";
import Job from "../models/jobModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import searchQuery from "../utils/searchQuery.js";
import Category from "../models/categoryModel.js";
const { ObjectId } = mongoose.Types;

//find all job post
const jobList = async (req, res) => {
  try {
    let data = await Job.find();
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e, res);
  }
};

//create a new job post
const createJob = async (req, res) => {
  try {
    const { role, _id} = req.user;
    if (role !== "company") {
      throw new Error(401, "unauthorized!");
    }
    let reqBody = req.body;
    reqBody.userId = _id;
    await Job.create(reqBody);
    res.status(201).json(new ApiResponse(201, "created successfully!"));
  } catch (e) {
    errorHandler(e, res);
  }
};

//removing a job post
const removeJob = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === "user") {
      throw new Error(401, "unauthorized!");
    }
    let id = req.params.id;
    let data = await Job.deleteOne({ _id: id });
    if (data.deletedCount === 1) {
      res.status(200).json(new ApiResponse(200, "Removed successfully!"));
    } else {
      throw new Error(400, "Something went wrong!!");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//find a single Job post
const singleJob = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === "user") {
      throw new Error(401, "unauthorized!");
    }
    let id = req.params.id;
    let data = await Job.findOne({ _id: id });
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e, res);
  }
};

//updating a job post
const updateJob = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === "user") {
      throw new Error(401, "unauthorized!");
    }
    let id = req.params.id;
    let reqBody = req.body;
    let data = await Job.updateOne(
      { _id: id },
      { $set: reqBody },
      { upsert: true }
    );
    if (
      data.acknowledged &&
      data.modifiedCount === 1 &&
      data.matchedCount === 1
    ) {
      res.status(200).json(new ApiResponse(200, data));
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//Job search by keyword
const searchByKeyword = async (req, res) => {
  try {
    const keyword = req.params.keyword;
    let searchData = searchQuery(keyword);

    if (searchData.error) {
      return res.status(400).json({ message: searchData.error });
    }

    let data = await Job.aggregate([{ $match: searchData }]);

    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e, res);
  }
};

//filter job on the basis of location,keyword,category and type
const filterJob = async (req, res) => {
  try {
    let data ;
      const { keyword, categoryId, jobType, location } = req.body;
      let matchConditions = {};
      if(keyword){
        let searchRegex = { $regex: keyword, $options: "i" };
        let searchParams = [{ title: searchRegex }, { company: searchRegex }]; 
        let searchQuery = { $or: searchParams };
        Object.assign(matchConditions, searchQuery);
      }
      if(categoryId){
        matchConditions.categoryId = new ObjectId(categoryId)
      }
      if(jobType){
        matchConditions.jobType = jobType;
      }
      if(location){
        matchConditions.location = location
      }
      let matchStage ={$match:matchConditions}
      data = await Job.aggregate([matchStage]);
    
    res.status(200).json(new ApiResponse(200, data));
   
  } catch (e) {
    errorHandler(e, res);
  }
};


//job list by category
const listByCategory = async(req,res)=>{
  try{
   let categoryId = new ObjectId(req.params.id);
   let data = await Job.aggregate([{$match:{categoryId:categoryId}}]);
   res.status(200).json(new ApiResponse(200, data));
  }
  catch(e){
  errorHandler(e,res);
  }
}

export {
  jobList,
  createJob,
  removeJob,
  singleJob,
  updateJob,
  searchByKeyword,
  filterJob,
  listByCategory
};
