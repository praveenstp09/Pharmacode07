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
      default: '',
    },
    courseType: {
      type: String,
      enum: ['B.Pharm', 'D.Pharm', 'QuickRevision', 'Exam', 'General'],
      default: 'QuickRevision',
      index: true,
    },
    semesterOrYear: {
      type: String,
      default: 'General', // e.g. "Semester 1" .. "Semester 8" or "1st Year" / "2nd Year"
      index: true,
    },
    chapter: {
      type: String,
      default: '', // e.g. "Chapter 1: Dosage Forms"
    },
    materialType: {
      type: String,
      enum: ['chapter_notes', 'pyq_paper', 'revision_sheet', 'formula_sheet', 'drug_list', 'other'],
      default: 'chapter_notes',
    },
    category: {
      type: String,
      default: 'Notes',
      index: true,
    },
    subject: {
      type: String,
      default: 'General Pharmacy',
      index: true,
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
