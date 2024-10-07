import mongoose from 'mongoose'

const applicationModelSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, required: [true, "userId is required"], index: true},
    subject: {type: String, required: [true, "Subject is required!"], index: true},
    message: {type: String, required: [true, "Message is required"], index: true},
    file: {type: String, required: [true, "File is required"], index: true},
    status: {type: String, default: "pending", index: true},
}, {timestamps: true, versionKey: false});

const Application = mongoose.model('applications', applicationModelSchema);
export default Application;

