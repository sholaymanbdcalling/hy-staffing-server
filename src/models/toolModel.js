import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      index: true,
      unique: true,
    },
    subTitle: {
      type: String,
      required: [true, "Sub Title is required"],
      index: true,
    },
    des: { type: String, required: [true, "Des is required"], index: true },
  },
  { versionKey: false, timestamps: true }
);

const Tool = mongoose.model("tools", toolSchema);
export default Tool;
