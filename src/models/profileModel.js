import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      index: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      index: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile is required"],
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      index: true,
    },
    file: { type: String, required: [true, "File is required"], index: true },
    message: {
      type: String,
      required: [true, "Message is required"],
      index: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "userID is required"],
      index: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const Profile = mongoose.model("profiles", profileSchema);
export default Profile;
