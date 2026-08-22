import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testSeriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestSeries',
      required: false,
      default: null,
      index: true,
    },
    testPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestPaper',
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    incorrectCount: {
      type: Number,
      required: true,
    },
    unattemptedCount: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        selectedOption: {
          type: Number, // -1 for unattempted, 0, 1, 2, 3
          default: -1,
        },
        timeSpentSeconds: {
          type: Number,
          default: 0,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

testAttemptSchema.index({ userId: 1, testPaperId: 1 });
testAttemptSchema.index({ userId: 1, createdAt: -1 });
testAttemptSchema.index({ testPaperId: 1, score: -1 });

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
export default TestAttempt;
