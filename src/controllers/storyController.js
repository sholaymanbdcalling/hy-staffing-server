import errorHandler from "../middlewares/errorHandler";
import SuccessStories from "../models/successStoriesModel";


const storyList = async(req,res)=>{
    try{
       let matchStage = {$match:{}};
       let limitStage ={$limit:5};
       let data = await SuccessStories.aggregate([matchStage,limitStage]);
       res.status(200).json(new ApiResponse(200, data));
    }
    catch(e){
       errorHandler(e,res);
    }
}

/*
* We need a validation.So,first we have to complete profile
* We'll back soon
* Must remember we've some work to do here, like we have join multiple collection for finding some info such as username etc.
*/