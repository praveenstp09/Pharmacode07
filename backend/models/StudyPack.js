import mongoose from 'mongoose';

const studyPackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a study material package title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    thumbnail: {
      type: String,
      default: '/placeholder-notes.jpg',
    },
    courseType: {
      type: String,
      required: true,
      enum: ['B.Pharm', 'D.Pharm', 'QuickRevision', 'Mixed'],
      default: 'B.Pharm',
      index: true,
    },
    scopeLabel: {
      type: String,
      default: 'Complete Package',
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    validityDays: {
      type: Number,
      default: 365,
    },
    totalPdfs: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    highlights: [String],
  },
  {
    timestamps: true,
  }
);

studyPackSchema.index({ published: 1, courseType: 1 });
studyPackSchema.index({ published: 1, createdAt: -1 });

const StudyPack = mongoose.model('StudyPack', studyPackSchema);
export default StudyPack;
