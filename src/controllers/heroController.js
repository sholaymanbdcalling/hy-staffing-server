import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import Hero from '../models/heroModel.js';

// Create and update hero
const upsertHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { homePage, servicePage, jobListPage } = req.body;

    // Parse JSON strings from form-data
    const parsedHomePage = homePage ? JSON.parse(homePage) : {};
    const parsedServicePage = servicePage ? JSON.parse(servicePage) : {};
    const parsedJobListPage = jobListPage ? JSON.parse(jobListPage) : {};

    // Upload images if provided and get the URLs
    const homePageImageUrl = req.files?.homePageImage
      ? await uploadOnCloudinary(req.files.homePageImage[0].path)
      : null;
    const servicePageImageUrl = req.files?.servicePageImage
      ? await uploadOnCloudinary(req.files.servicePageImage[0].path)
      : null;
    const jobListPageImageUrl = req.files?.jobListPageImage
      ? await uploadOnCloudinary(req.files.jobListPageImage[0].path)
      : null;

    // If id is provided, update the existing document
    if (id) {
      const hero = await Hero.findById(id);
      if (!hero) {
        return res.status(404).json(new ApiError(404, { message: 'Hero not found' }));
      }

      // Update fields if provided
      if (Object.keys(parsedHomePage).length) {
        hero.homePage = { ...hero.homePage.toObject(), ...parsedHomePage };
        if (homePageImageUrl) {
          hero.homePage.image = homePageImageUrl.secure_url;
        }
      }

      if (Object.keys(parsedServicePage).length) {
        hero.servicePage = { ...hero.servicePage.toObject(), ...parsedServicePage };
        if (servicePageImageUrl) {
          hero.servicePage.image = servicePageImageUrl.secure_url;
        }
      }

      if (Object.keys(parsedJobListPage).length) {
        hero.jobListPage = { ...hero.jobListPage.toObject(), ...parsedJobListPage };
        if (jobListPageImageUrl) {
          hero.jobListPage.image = jobListPageImageUrl.secure_url;
        }
      }

      // Save to database
      await hero.save();
      return res.status(200).json(new ApiResponse(200, hero, 'Data updated successfully'));
    } else {
      // If no id is provided, create a new document
      const newHero = new Hero({
        homePage: {
          ...parsedHomePage,
          image: homePageImageUrl ? homePageImageUrl.secure_url : parsedHomePage.image,
        },
        servicePage: {
          ...parsedServicePage,
          image: servicePageImageUrl ? servicePageImageUrl.secure_url : parsedServicePage.image,
        },
        jobListPage: {
          ...parsedJobListPage,
          image: jobListPageImageUrl ? jobListPageImageUrl.secure_url : parsedJobListPage.image,
        },
      });

      // Validate if the images are provided for the required fields
      if (!newHero.homePage.image || !newHero.servicePage.image || !newHero.jobListPage.image) {
        return res
          .status(400)
          .json(new ApiError(400, { message: 'Image is required for all sections' }));
      }

      // Save data to the database
      await newHero.save();
      return res.status(201).json(new ApiResponse(201, newHero, 'Data created successfully'));
    }
  } catch (error) {
    console.error('Error in upsertHero:', error); // Detailed error logging
    return res.status(500).json(new ApiError(500, { message: error.message, stack: error.stack }));
  }
};

export { upsertHero };
