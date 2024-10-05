import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { uploadOnCloudinary } from '../utils/cloudinary';
import Hero from '../models/heroModel';

// Create and update hero
const upsertHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { homePage, servicePage, jobListPage } = req.body;

    // Upload images if provided
    const homePageImageUrl = req.files?.homePageImage
      ? await uploadOnCloudinary(req.files.homePageImage[0]).secure_url
      : null;
    const servicePageImageUrl = req.files?.servicePageImage
      ? await uploadOnCloudinary(req.files.servicePageImage[0]).secure_url
      : null;
    const jobListPageImageUrl = req.files?.jobListPageImage
      ? await uploadOnCloudinary(req.files.jobListPageImage[0]).secure_url
      : null;

    // If id is provided, update the existing document
    if (id) {
      const hero = await Hero.findById(id);
      if (!hero) {
        return res.status(404).json(new ApiError(404, { message: 'Hero not found' }));
      }

      // Update fields if provided
      if (homePage) {
        hero.homePage = { ...hero.homePage.toObject(), ...homePage };
        if (homePageImageUrl) {
          hero.homePage.image = homePageImageUrl;
        }
      }

      if (servicePage) {
        hero.servicePage = { ...hero.servicePage.toObject(), ...servicePage };
        if (servicePageImageUrl) {
          hero.servicePage.image = servicePageImageUrl;
        }
      }

      if (jobListPage) {
        hero.jobListPage = { ...hero.jobListPage.toObject(), ...jobListPage };
        if (jobListPageImageUrl) {
          hero.jobListPage.image = jobListPageImageUrl;
        }
      }

      // Save to database
      await hero.save();
      return res.status(200).json(new ApiResponse(200, hero, 'Data updated successfully'));
    } else {
      // If no id is provided, create a new document
      const newHero = new Hero({
        homePage: {
          ...homePage,
          image: homePageImageUrl,
        },
        servicePage: {
          ...servicePage,
          image: servicePageImageUrl,
        },
        jobListPage: {
          ...jobListPage,
          image: jobListPageImageUrl,
        },
      });

      // Save data to the database
      await newHero.save();
      return res.status(201).json(new ApiResponse(201, newHero, 'Data created successfully'));
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, { message: error.message }));
  }
};

export { upsertHero };
