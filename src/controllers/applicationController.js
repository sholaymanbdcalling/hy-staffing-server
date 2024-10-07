import Profile from "../models/profileModel.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import errorHandler from "../middlewares/errorHandler.js";


//application List
const applicationList = async (req, res) => {
    try {
        let pageNo = Number(req.params.pageNo);
        let perPage = Number(req.params.perPage);
        let skipRow = (pageNo - 1) * perPage;
        let matchStage = {$match: {}};
        let skipStage = {$skip: skipRow};
        let limitStage = {$limit: perPage};
        let countStage = {$count: "total"};
        let data = await Profile.aggregate([
            matchStage,
            skipStage,
            limitStage,
            {
                $addFields: {
                    sortOrder: {
                        $switch: {
                            branches: [
                                {case: {$eq: ["$status", "P"]}, then: 1}, // Highest priority
                                {case: {$eq: ["$status", "A"]}, then: 2}, // Second priority
                                {case: {$eq: ["$status", "R"]}, then: 3}, // Lowest priority
                            ],
                            default: 4, // For any other status values
                        },
                    },
                },
            },
            {
                $sort: {sortOrder: 1}, // Sort by the sortOrder field in ascending order
            },
            {
                $project: {sortOrder: 0}, // Remove the sortOrder field from the output
            },
        ]);
        let totalCount = await Profile.aggregate([matchStage, countStage]);
        res.status(200).json(new ApiResponse(200, {data, totalCount}));
    } catch (e) {
        errorHandler(e, res);
    }
};

// update application status
const updateStatus = async (req, res) => {
    try {
        let {role, _id} = req.user;
        let id = req.params.id;
        let status = req.params.status;
        let userCount = await Profile.findOne({userId: _id});
        if (role === "company" && userCount) {
            let data = await Profile.updateOne(
                {_id: id},
                {$set: {status: status}}
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


export {applicationList}