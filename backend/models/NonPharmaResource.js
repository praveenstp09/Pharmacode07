import mongoose from 'mongoose';

const nonPharmaResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a resource title'],
      trim: true,
    },
    section: {
      type: String,
      enum: ['reasoning', 'maths', 'current_affairs', 'general_studies_gk'],
      required: true,
      index: true,
    },
    topic: {
      type: String,
      default: '', // e.g. "Blood Relations", "Time & Work", "Indian Polity"
      index: true,
    },
    contentType: {
      type: String,
      enum: ['cbt', 'pdf'],
      required: true,
    },
    testPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestPaper',
      default: null,
      index: true,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    totalQuestions: {
      type: Number,
      default: 25,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    relevanceMonth: {
      type: String,
      default: '', // For Current Affairs (e.g. "August 2026")
      index: true,
    },
    isFree: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
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

nonPharmaResourceSchema.index({ section: 1, createdAt: -1 });

const NonPharmaResource = mongoose.model('NonPharmaResource', nonPharmaResourceSchema);
export default NonPharmaResource;
