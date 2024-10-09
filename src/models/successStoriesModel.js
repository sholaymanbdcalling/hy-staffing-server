import mongoose, {Schema} from 'mongoose';

const successStoriesSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true, // Trim whitespace
        },
        designation: {
            type: String,
            required: [true, 'Designation is required'],
            trim: true, // Trim whitespace
        },
        comment: {
            type: String,
            required: [true, 'Comment is required'],
            trim: true, // Trim whitespace
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const SuccessStories = mongoose.model('SuccessStories', successStoriesSchema);

export default SuccessStories;
