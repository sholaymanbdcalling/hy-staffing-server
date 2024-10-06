import mongoose, { Schema } from 'mongoose';

const logoSchema = new Schema(
  {
    whiteLogo: {
      type: String,
      trim: true,
    },
    blackLogo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Logo = mongoose.model('Logo', logoSchema);

export default Logo;
