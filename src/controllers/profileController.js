import errorHandler from "../middlewares/errorHandler.js";
import Profile from "../models/profileModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProfile = async (req, res) => {
  try {
    const user = req.user;
    let { _id } = user;
    let reqBody = req.body;
    reqBody.userId = _id;
    let userCount = await Profile.findOne({ userId: _id });
    if (userCount === null) {
      await Profile.create(reqBody);
      return res.status(201).json(new ApiResponse(201, "Profile Created!"));
    } else {
      let data = await Profile.updateOne(
        { userId: _id },
        { $set: reqBody },
        { upsert: true }
      );
      if (
        data.acknowledged &&
        data.modifiedCount === 1 &&
        data.matchedCount === 1
      ) {
        res.status(200).json(new ApiResponse(200, "Profile Updated!"));
      }
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

const profileList = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo);
    let perPage = Number(req.params.perPage);
    let skipRow = (pageNo - 1) * perPage;
    let matchStage = { $match: {} };
    let skipStage = { $skip: skipRow };
    let limitStage = { $limit: perPage };
    let countStage = { $count: "total" };
    const { role, _id } = req.user;
    const userCount = await Profile.findOne({ userId: _id });
    if (role === "user" && !userCount) {
      throw new Error(401, "unauthorized!");
    }
    let data = await Profile.aggregate([
      matchStage,
      skipStage,
      limitStage,
      {
        $addFields: {
          sortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "P"] }, then: 1 }, // Highest priority
                { case: { $eq: ["$status", "A"] }, then: 2 }, // Second priority
                { case: { $eq: ["$status", "R"] }, then: 3 }, // Lowest priority
              ],
              default: 4, // For any other status values
            },
          },
        },
      },
      {
        $sort: { sortOrder: 1 }, // Sort by the sortOrder field in ascending order
      },
      {
        $project: { sortOrder: 0 }, // Remove the sortOrder field from the output
      },
    ]);
    let totalCount = await Profile.aggregate([matchStage, countStage]);
    res.status(200).json(new ApiResponse(200, { data, totalCount }));
  } catch (e) {
    errorHandler(e, res);
  }
};

const updateStatus = async (req, res) => {
  try {
    let { role, _id } = req.user;
    let id = req.params.id;
    let status = req.params.status;
    let userCount = await Profile.findOne({ userId: _id });
    if (role === "company" && userCount) {
      let data = await Profile.updateOne(
        { _id: id },
        { $set: { status: status } }
      );
      if (data.modifiedCount === 1) {
        res.status(200).json(new ApiResponse(200, "Status updated!"));
      }
    } else {
      throw new Error(401, "unauthorized");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

const removeProfile = async (req, res) => {
  try {
    let { role, _id } = req.user;
    let id = req.params.id;
    let userCount = await Profile.findOne({ userId: _id });
    if (role === "company" && userCount) {
      let data = await Profile.deleteOne({ _id: id });
      if (data.deletedCount === 1) {
        res.status(200).json(new ApiResponse(200, "Profile Removed"));
      }
    } else {
      throw new Error(401, "unauthorized");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

const profileDetails = async (req, res) => {
  try {
    let { role, _id } = req.user;
    let id = req.params.id;
    let userCount = await Profile.findOne({ userId: _id });
    if (role === "company" && userCount) {
      let data = await Profile.findOne({ _id: id });
      res.status(200).json(new ApiResponse(200, data));
    } else {
      throw new Error(401, "unauthorized");
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    const {avatar,bio} = req.body;

    let updateFields = {};

    if (bio !== undefined) {
      updateFields.bio = bio; // Only update if bio is present
    }

    if (req.body.avatar) {
      updateFields.avatar = avatar; // Assuming you're handling the image upload via multer
    }

    await Profile.updateOne({userId:_id},updateFields,{new:true});

    res.status(200).json(new ApiResponse(200, "Profile updated successfully!"));
  } catch (e) {
    errorHandler(e, res);
  }
};

export {
  createProfile,
  profileList,
  updateStatus,
  removeProfile,
  profileDetails,
  updateProfile
};
