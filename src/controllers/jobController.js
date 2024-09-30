import errorHandler from "../middlewares/errorHandler.js";
import Job from "../models/jobModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//find all job post
const jobList = async (req, res) => {
  try {
    let data = await Job.find();
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e,res);
  }
};


//create a new job post
const createJob = async (req, res) => {
  try {
    const { role, userId } = req.user;
    if (role !== "Company") {
      throw new Error(401, "Unauthorized!");
    }
    let reqBody = req.body;
    reqBody.userId = userId;
    await Job.create(reqBody);
    res.status(201).json(new ApiResponse(201, "Created successfully!"));
  } catch (e) {
    errorHandler(e,res);
  }
};


//removing a job post
const removeJob = async(req,res)=>{
   try{
    const { role } = req.user;
    if(role === "User"){
        throw new Error(401, "Unauthorized!");
    }
    let id = req.params.id;
    let data = await Job.deleteOne({_id:id});
    if(data.deletedCount === 1){
        res.status(200).json(new ApiResponse(200, "Removed successfully!"));
    }
    else{
        throw new Error(400, "Something went wrong!!" ); 
    }
   }
   catch(e){
    errorHandler(e,res);
   }
}


//find a single Job post
const singleJob = async(req,res)=>{
    try{
        const { role } = req.user;
        if(role === "User"){
            throw new Error(401, "Unauthorized!");
        }
        let id = req.params.id;
        let data = await Job.findOne({_id:id});
        res.status(200).json(new ApiResponse(200, data));
    }
    catch(e){
        errorHandler(e,res);
    }
}


//updating a job post
const updateJob = async(req,res)=>{
    try{
        const { role } = req.user;
        if(role === "User"){
            throw new Error(401, "Unauthorized!");
        }
        let id = req.params.id;
        let reqBody = req.body;
        let data =await Job.updateOne({_id:id},{$set:reqBody},{upsert:true});
        if(data.acknowledged && data.modifiedCount ===1 && data.matchedCount === 1){
            res.status(200).json(new ApiResponse(200, data));
        }
    }
    catch(e){
        errorHandler(e,res); 
    }
}

export { jobList, createJob,removeJob,singleJob ,updateJob};
