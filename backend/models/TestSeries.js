import mongoose from 'mongoose';

const testSeriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a test series title'],
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
      default: '/placeholder-test.jpg',
    },
    category: {
      type: String,
      required: true,
      enum: ['Competitive Exam', 'Pharmacy Subject', 'Model Paper', 'Previous Year'],
      default: 'Competitive Exam',
    },
    examType: {
      type: String,
      required: true,
      index: true, // e.g. GSSSB, UPSSSC, RRB, AIIMS, GPAT, BFUHS, CISF
    },
    totalTests: {
      type: Number,
      default: 1,
    },
    totalQuestions: {
      type: Number,
      default: 120,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    highlights: [String], // e.g., ["120 MCQs as per latest GSSSB syllabus", "Negative marking (-0.25)", "Detailed explanations"]
  },
  {
    timestamps: true,
  }
);

const TestSeries = mongoose.model('TestSeries', testSeriesSchema);
export default TestSeries;
