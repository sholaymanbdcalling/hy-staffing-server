import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true, // Trim whitespace
      match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Validation for email format
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    otp: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Check password validity
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// Generate token
userSchema.methods.generateToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY },
  );
};

const User = mongoose.model('User', userSchema);

export default User;
