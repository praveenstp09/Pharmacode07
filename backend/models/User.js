import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    purchasedTests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestSeries',
      },
    ],
    purchasedMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyMaterial',
      },
    ],
    purchasedSingleModels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SingleModelPaper',
      },
    ],
    purchasedNonPharma: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NonPharmaResource',
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET || 'pharmacode_secret', {
    expiresIn: '30d',
  });
};

const User = mongoose.model('User', userSchema);
export default User;
