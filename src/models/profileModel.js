import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "userId is required"],
            index: true,
        },
        bio: {
            type: String,
            default: "Hi, I am a new in HY Staffing",
            index: true
        },
        avatar: {
            type: String,
            index: true,
            required: [true, "Avatar is required"],
        },
        address: {
            type: String,
            index: true,
        },
        about: {
            type: String,
            index: true
        },
        facebook: {
            type: String,
            index: true
        },
        linkedIn: {
            type: String,
            index: true
        },
    },
    {versionKey: false, timestamps: true}
);

const Profile = mongoose.model("profiles", profileSchema);
export default Profile;
