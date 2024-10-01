import errorHandler from "../middlewares/errorHandler.js";
import Tool from "../models/toolModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//create tool
const createTool = async (req, res) => {
  try {
    const { role } = req.user;
    let reqBody = req.body;
    if (role === "admin") {
      let data = await Tool.create(reqBody);
      res.status(201).json(new ApiResponse(201, `${data?.title} Created`));
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//update tool
const updateTool = async(req,res)=>{
    try{
        const { role } = req.user;
        const id = req.params.id;
        let reqBody = req.body;
        if(role === "admin"){
            let data = await Tool.updateOne({_id:id},{$set:reqBody},{upsert:true});
            if(data.acknowledged && data.modifiedCount === 1){
                res.status(200).json(new ApiResponse(200, `Update successfully`));
            }
        }
    }
    catch(e){
     errorHandler(e,res);
    }
}


//find tool by type
const toolByType = async(req,res)=>{
    try{
       let type = req.params.type;
       let data = await Tool.findOne({toolType:type});
       res.status(200).json(new ApiResponse(200, data));
    }
    catch(e){
      errorHandler(e,res);
    }
}




export {createTool,updateTool,toolByType};
