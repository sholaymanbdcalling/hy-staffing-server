import mongoose from 'mongoose';

const applicationModelSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'userId is required'],
      index: true,
    },
    subject: { type: String, required: [true, 'Subject is required!'], index: true },
    message: { type: String, required: [true, 'Message is required'], index: true },
    file: { type: String, required: [true, 'File is required'], index: true },
    status: { type: String, default: 'pending', index: true },
  },
  { timestamps: true, versionKey: false },
);

const Application = mongoose.model('applications', applicationModelSchema);
export default Application;
