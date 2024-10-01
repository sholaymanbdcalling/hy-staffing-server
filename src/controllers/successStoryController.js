import errorHandler from "../middlewares/errorHandler.js";
import SuccessStories from "../models/successStoriesModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//create a new story
const createSuccessStory = async (req, res) => {
  try {
    const { _id, role } = req.user;
    let reqBody = req.body;
    reqBody.userId = _id;
    if (role === "user") {
      await SuccessStories.create(reqBody);
      res.status(200).json(new ApiResponse(200, "Success Story Created"));
    } else {
      throw new Error(401, "unauthorized");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//find stories in five data limit;
const storyList = async (req, res) => {
  try {
    let matchStage = { $match: {} };
    let limitStage = { $limit: 5 };
    let data = await SuccessStories.aggregate([matchStage, limitStage]);
    res.status(200).json(new ApiResponse(200, data));
  } catch (e) {
    errorHandler(e, res);
  }
};

//remove a story
const removeStory = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const id = req.params.id;
    if (role === "user") {
      let removeData = await SuccessStories.deleteOne({ _id: id, userId: _id });
      if (removeData.deletedCount === 1) {
        res
          .status(200)
          .json(new ApiResponse(200, "Your Story Removed Successfully!"));
      }
    } else if (role === "admin") {
      let data = await SuccessStories.deleteOne({ _id: id });
      if (data.deletedCount === 1) {
        res
          .status(200)
          .json(new ApiResponse(200, "A Story Removed Successfully!"));
      }
    } else {
      throw new Error(401, "unauthorized!");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//user story list
const userStories = async (req, res) => {
  try {
    let { role, _id } = req.user;
    if (role === "user") {
      let data = await SuccessStories.find({ userId: _id });
      res.status(200).json(new ApiResponse(200, data));
    } else {
      throw new Error(401, "unauthorized!");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//update a story
const updateStory = async (req, res) => {
  try {
    const { _id, role } = req.user;
    const id = req.params.id;
    const reqBody = req.body;
    if (role === "user") {
      let data = await SuccessStories.updateOne(
        { _id: id, userId: _id },
        { $set: reqBody },
        { upsert: true }
      );
      if (
        data.modifiedCount === 1 &&
        data.matchedCount === 1 &&
        data.acknowledged
      ) {
        res.status(200).json(new ApiResponse(200, data));
      } else {
        throw new ApiError(400, "Something went wrong!");
      }
    } else {
      throw new Error(401, "unauthorized");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

export { storyList, createSuccessStory, removeStory, userStories, updateStory };
