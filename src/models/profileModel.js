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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "userId is required"],
      index: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      default: "Pending",
    },
  },
  { versionKey: false, timestamps: true }
);

const Profile = mongoose.model("profiles", profileSchema);
export default Profile;
