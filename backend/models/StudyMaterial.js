import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title for the study material'],
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
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Notes',
        'PDF Notes',
        'Short Notes',
        'PYQ',
        'Revision Notes',
        'Formula Sheets',
        'Drug Lists',
        'Exam Notifications',
      ],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      default: 'General Pharmacy',
    },
    examType: {
      type: String,
      default: 'All Exams',
      index: true,
    },
    year: {
      type: Number,
      default: 2026,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    previewUrl: {
      type: String,
      default: '',
    },
    downloadCount: {
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

studyMaterialSchema.index({ category: 1, examType: 1, year: -1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
