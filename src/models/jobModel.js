import mongoose, { Schema } from 'mongoose';

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true, // Trim whitespace
      index: true, // Index for better query performance
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true, // Trim whitespace
      index: true, // Index for better query performance
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true, // Trim whitespace
      index: true, // Index for better query performance
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
      validate: {
        validator: function (value) {
          return value > Date.now();
        },
        message: 'Deadline must be a future date',
      },
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
      validate: {
        validator: function (value) {
          // Example regex for experience format, e.g., "3 years", "5-7 years"
          return /^(\d+(-\d+)?\s+years?)$/.test(value);
        },
        message: 'Experience must be in a valid format (e.g., "3 years", "5-7 years")',
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
