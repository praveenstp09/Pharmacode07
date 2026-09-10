import mongoose from 'mongoose';

const studyPackItemSchema = new mongoose.Schema(
  {
    packId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyPack',
      required: true,
      index: true,
    },
    folderName: {
      type: String,
      required: [true, 'Please provide a folder or semester name'],
      trim: true,
      index: true,
    },
    subjectName: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    chapterName: {
      type: String,
      default: '',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for this PDF item'],
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: [true, 'PDF file URL is required'],
      trim: true,
    },
    previewUrl: {
      type: String,
      default: '',
      trim: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    isFreeDemo: {
      type: Boolean,
      default: false,
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

studyPackItemSchema.index({ packId: 1, folderName: 1, sortOrder: 1 });

const StudyPackItem = mongoose.model('StudyPackItem', studyPackItemSchema);
export default StudyPackItem;
