import Job from "../models/jobModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const jobList = async(req,res) =>{
    
    try{
        let data = await Job.find();
        res.status(200).json(new ApiResponse(200, data));
    }
    catch(e){
        console.log(e);
      throw new Error(400,{message:e.message || "Something went wrong!!"});
    }
}


const createJob = async(req,res)=>{
   try{
    const {role,userId} = req.user ;
    if(role !== "Company"){
        throw new Error(401,"Unauthorized!");
    }
    let reqBody = req.body;
    reqBody.userId = userId;
    await Job.create(reqBody);
    res.status(201).json(new ApiResponse(201,"Created successfully!"))
   }
   catch(e){

   }
}











export {jobList};