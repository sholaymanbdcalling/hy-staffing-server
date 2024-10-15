import errorHandler from '../middlewares/errorHandler.js';
import Job from '../models/jobModel.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import searchQuery from '../utils/searchQuery.js';
import City from '../models/cityModel.js';
const { ObjectId } = mongoose.Types;
import Fuse from 'fuse.js';

//find all job post
const jobList = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo);
    let perPage = Number(req.params.perPage);
    let skipRow = (pageNo - 1) * perPage;
    let matchStage = { $match: {} };
    let skipStage = { $skip: skipRow };
    let limitStage = { $limit: perPage };
    let countStage = { $count: 'total' };
    let data = await Job.aggregate([matchStage, skipStage, limitStage]);
    let totalCount = await Job.aggregate([matchStage, countStage]);
    res.status(200).json(new ApiResponse(200, { data, totalCount }));
  } catch (e) {
    errorHandler(e, res);
  }
};

//create a new job post
const createJob = async (req, res) => {
  try {
    const { role, _id } = req.user;
    if (role !== 'company') {
      res.status(403).json({ message: 'Access denied' });
    }
    let reqBody = req.body;
    reqBody.userId = _id;
    await Job.create(reqBody);
    res.status(201).json(new ApiResponse(201, 'created successfully!'));
  } catch (e) {
    errorHandler(e, res);
  }
};

//removing a job post
const removeJob = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === 'user') {
      res.status(403).json({ message: 'Access denied' });
    }
    let id = req.params.id;
    let data = await Job.deleteOne({ _id: id });
    if (data.deletedCount === 1) {
      res.status(200).json(new ApiResponse(200, 'Removed successfully!'));
    } else {
      res.status(400).json({ message: 'Not available' });
    }
  } catch (e) {
    errorHandler(e, res);
  }
};

//updating a job post
const updateJob = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'company') {
      res.status(403).json({ message: 'Access denied' });
    } else {
      let id = req.params.id;
      let { title, company, location, jobType, deadline, experience, categoryId } = req.body;
      let updateFields = {};
      if (title !== undefined) {
        updateFields.title = title;
      }
      if (company !== undefined) {
        updateFields.company = company;
      }
      if (location !== undefined) {
        updateFields.location = location;
      }
      if (jobType !== undefined) {
        updateFields.jobType = jobType;
      }
      if (deadline !== undefined) {
        updateFields.deadline = deadline;
      }
      if (experience !== undefined) {
        updateFields.experience = experience;
      }
      if (categoryId !== undefined) {
        updateFields.categoryId = categoryId;
      }
      let data = await Job.updateOne({ _id: id }, updateFields, { new: true });
      if (data.acknowledged && data.modifiedCount === 1 && data.matchedCount === 1) {
        res.status(200).json(new ApiResponse(200, data));
      }
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
    let pageNo = Number(req.params.pageNo);
    let perPage = Number(req.params.perPage);
    let skipRow = (pageNo - 1) * perPage;
    let matchStage = { $match: searchData };
    let skipStage = { $skip: skipRow };
    let limitStage = { $limit: perPage };
    let data = await Job.aggregate([matchStage, skipStage, limitStage]);
    let totalCount = await Job.aggregate([matchStage, { $count: 'total' }]);
    res.status(200).json(new ApiResponse(200, { data, totalCount }));
  } catch (e) {
    errorHandler(e, res);
  }
};

//filtering data on various criteria
const filterJob = async (req, res) => {
  try {
    let data;
    const { keyword, categoryId, jobType, location } = req.body;
    let matchConditions = {};
    let locationMessage = '';

    // Keyword filtering
    if (keyword) {
      let searchRegex = { $regex: keyword, $options: 'i' };
      let searchParams = [{ title: searchRegex }, { company: searchRegex }];
      Object.assign(matchConditions, { $or: searchParams });
    }

    // Category filtering
    if (categoryId) {
      matchConditions.categoryId = new ObjectId(categoryId);
    }

    // Job type filtering
    if (jobType) {
      matchConditions.jobType = jobType;
    }

    // Location filtering with fuzzy matching
    if (location) {
      if (location.length < 3) {
        return res
          .status(400)
          .json({ message: 'Location name must be at least 3 characters long' });
      }

      // Fetch cities from the database
      const cities = await City.find({}, { city: 1, _id: 0 });
      const cityNames = cities.map((city) => city.city);

      // Fuse.js setup
      const options = {
        includeScore: true,
        threshold: 0.3, // Lower threshold means stricter matching
        keys: ['city'], // Specify the field to search
      };
      const fuse = new Fuse(cities, options);
      const results = fuse.search(location);

      if (results.length > 0) {
        const bestMatch = results[0].item.city;
        matchConditions.city = { $regex: bestMatch, $options: 'i' };
        locationMessage = `Did you mean '${bestMatch}'?`;
      } else {
        locationMessage = `No matching city found for '${location}'.`;
      }
    }

    // Get job data
    data = await Job.aggregate([{ $match: matchConditions }]);

    // If no jobs matched, remove the city condition and retry
    if (data.length === 0) {
      delete matchConditions.city; // Remove city filter
      data = await Job.aggregate([{ $match: matchConditions }]);
    }

    // Send the response with matchConditions for debugging
    res
      .status(200)
      .json(
        new ApiResponse(200, { data, totalCount: data.length, locationMessage, matchConditions }),
      );
  } catch (e) {
    errorHandler(e, res);
  }
};

//job list by category
const listByCategory = async (req, res) => {
  try {
    let pageNo = Number(req.params.pageNo);
    let perPage = Number(req.params.perPage);
    let skipRow = (pageNo - 1) * perPage;
    let categoryId = new ObjectId(req.params.id);
    let matchStage = { $match: { categoryId: categoryId } };
    let skipStage = { $skip: skipRow };
    let limitStage = { $limit: perPage };
    let data = await Job.aggregate([matchStage, skipStage, limitStage]);
    let countStage = { $count: 'total' };
    let totalCount = await Job.aggregate([matchStage, countStage]);
    res.status(200).json(new ApiResponse(200, { data, totalCount }));
  } catch (e) {
    errorHandler(e, res);
  }
};

export { jobList, createJob, removeJob, updateJob, searchByKeyword, filterJob, listByCategory };
