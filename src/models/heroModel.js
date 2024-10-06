import mongoose, { Schema } from 'mongoose';

const heroSchema = new Schema(
  {
    homePage: {
      title: { type: String, required: [true, 'Title is required'], trim: true },
      subTitle: { type: String, required: [true, 'Sub title is required'], trim: true },
      image: { type: String, required: [true, 'Image is required'], trim: true },
    },
    servicePage: {
      title: { type: String, required: [true, 'Title is required'], trim: true },
      subTitle: { type: String, required: [true, 'Sub title is required'], trim: true },
      image: { type: String, required: [true, 'Image is required'], trim: true },
    },
    jobListPage: {
      title: { type: String, required: [true, 'Title is required'], trim: true },
      subTitle: { type: String, required: [true, 'Sub title is required'], trim: true },
      image: { type: String, required: [true, 'Image is required'], trim: true },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Hero = mongoose.model('Hero', heroSchema);

export default Hero;
