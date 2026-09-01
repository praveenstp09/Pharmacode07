import mongoose from 'mongoose';

const singleModelPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a model paper title'],
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
      default: '',
    },
    examType: {
      type: String,
      required: true, // e.g. "AIIMS", "GSSSB", "ESIC", "OSSSC", "BFUHS"
      index: true,
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    },
    hasCBT: {
      type: Boolean,
      default: true,
    },
    testPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestPaper',
      default: null,
      index: true,
    },
    hasPdf: {
      type: Boolean,
      default: false,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    totalQuestions: {
      type: Number,
      default: 100,
    },
    durationMinutes: {
      type: Number,
      default: 100,
    },
    isFree: {
      type: Boolean,
      default: false,
      index: true,
    },
    price: {
      type: Number,
      default: 49,
    },
    discountPrice: {
      type: Number,
      default: 29,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

singleModelPaperSchema.index({ published: 1, examType: 1, isFree: 1 });

const SingleModelPaper = mongoose.model('SingleModelPaper', singleModelPaperSchema);
export default SingleModelPaper;
