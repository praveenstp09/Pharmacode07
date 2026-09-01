import mongoose from 'mongoose';

const folderItemSchema = new mongoose.Schema(
  {
    testSeriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestSeries',
      required: true,
      index: true,
    },
    folderType: {
      type: String,
      enum: [
        'model_papers',
        'previous_year_papers',
        'subject_wise_tests',
        'cbt_mixed',
        'pyq',
        'subject_wise',
        'mcq_pdf',
      ],
      default: 'model_papers',
      required: true,
      index: true,
    },
    subjectName: {
      type: String,
      default: '', // Used when folderType is subject_wise_tests / subject_wise (e.g. 'Pharmacology')
      index: true,
    },
    contentType: {
      type: String,
      enum: ['cbt', 'pdf', 'notes_pdf'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
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
    year: {
      type: Number,
      default: 2026,
    },
    totalQuestions: {
      type: Number,
      default: 100,
    },
    durationMinutes: {
      type: Number,
      default: 100,
    },
    isFreeDemo: {
      type: Boolean,
      default: false, // Set true for 1 free preview item per folder
      index: true,
    },
    sortOrder: {
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

folderItemSchema.index({ testSeriesId: 1, folderType: 1, sortOrder: 1 });

const FolderItem = mongoose.model('FolderItem', folderItemSchema);
export default FolderItem;
