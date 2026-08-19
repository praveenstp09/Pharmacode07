import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: [val => val.length === 4, 'Must provide exactly 4 options'],
    required: true,
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    default: 'General Pharmacy',
  },
  topic: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
});

const testPaperSchema = new mongoose.Schema(
  {
    testSeriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestSeries',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true, // e.g., "GSSSB Model Paper 1 (120 Questions)"
    },
    paperNumber: {
      type: Number,
      default: 1,
    },
    durationMinutes: {
      type: Number,
      default: 120, // default 2 hours (120 mins)
    },
    totalMarks: {
      type: Number,
      default: 120,
    },
    positiveMarks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0.25,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    questions: [questionSchema],
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

testPaperSchema.index({ testSeriesId: 1, paperNumber: 1 });

const TestPaper = mongoose.model('TestPaper', testPaperSchema);
export default TestPaper;
