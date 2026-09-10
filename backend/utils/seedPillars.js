import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import FolderItem from '../models/FolderItem.js';
import StudyMaterial from '../models/StudyMaterial.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';
import StudyPack from '../models/StudyPack.js';
import StudyPackItem from '../models/StudyPackItem.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacode07';

const samplePharmacologyQuestions = [
  {
    questionText: "Which of the following is a competitive neuromuscular blocking agent?",
    options: ["d-Tubocurarine", "Succinylcholine", "Decamethonium", "Neostigmine"],
    correctOptionIndex: 0,
    explanation: "d-Tubocurarine is a non-depolarizing (competitive) neuromuscular blocker that competes with acetylcholine for nicotinic receptors.",
    subject: "Pharmacology",
  },
  {
    questionText: "Which drug is used as the first-line agent in acute anaphylactic shock?",
    options: ["Adrenaline (Epinephrine)", "Atropine", "Dopamine", "Hydrocortisone"],
    correctOptionIndex: 0,
    explanation: "Adrenaline (1:1000 IM) rapidly reverses bronchospasm, laryngeal edema, and hypotension via alpha and beta adrenergic stimulation.",
    subject: "Pharmacology",
  },
  {
    questionText: "The primary site of active tubular secretion of penicillin in the nephron is:",
    options: ["Proximal Convoluted Tubule", "Loop of Henle", "Distal Convoluted Tubule", "Collecting Duct"],
    correctOptionIndex: 0,
    explanation: "Penicillin is actively secreted into the urine via organic anion transporters located in the proximal convoluted tubule.",
    subject: "Pharmacology",
  },
];

const sampleAptitudeQuestions = [
  {
    questionText: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: ["Brother", "Uncle", "Father", "Cousin"],
    correctOptionIndex: 2,
    explanation: "The 'only son of Suresh's mother' is Suresh himself. Therefore, the boy is Suresh's son, making Suresh the Father.",
    subject: "Reasoning",
  },
  {
    questionText: "If 12 men can complete a project in 15 days, in how many days can 20 men complete the same project?",
    options: ["9 days", "10 days", "8 days", "12 days"],
    correctOptionIndex: 0,
    explanation: "Total work = 12 * 15 = 180 man-days. Days for 20 men = 180 / 20 = 9 days.",
    subject: "Mathematics",
  },
  {
    questionText: "Which Indian state has the longest mainland coastline?",
    options: ["Maharashtra", "Gujarat", "Tamil Nadu", "Andhra Pradesh"],
    correctOptionIndex: 1,
    explanation: "Gujarat has the longest mainland coastline in India, extending over approximately 1,600 km.",
    subject: "General Studies",
  },
];

const seedAllPillars = async () => {
  try {
    console.log('🌱 Connecting to MongoDB Atlas for 4-Pillar initial seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB!');

    // -------------------------------------------------------------
    // PILLAR 1: TEST SERIES (WITH 4 STRUCTURED FOLDERS)
    // -------------------------------------------------------------
    let gsssbSeries = await TestSeries.findOne({ slug: 'gsssb-pharmacist-2026-complete-prep-pack' });
    if (!gsssbSeries) {
      gsssbSeries = await TestSeries.create({
        title: 'GSSSB Junior Pharmacist 2026 – Complete Test Series Pack',
        slug: 'gsssb-pharmacist-2026-complete-prep-pack',
        description: 'Comprehensive 4-Folder preparation package for GSSSB Junior Pharmacist. Contains Full CBT Mocks, Past Year Papers (PYQs), High-Yield MCQ PDFs, and Subject-Wise Tests & Notes with 365-day validity.',
        category: 'Competitive Exam',
        examType: 'GSSSB',
        thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
        price: 499,
        discountPrice: 199,
        validityDays: 365,
        published: true,
        highlights: [
          '📁 Folder 1: 15 Full-Length CBT Mock Tests (Mixed Syllabus)',
          '📁 Folder 2: 10 Previous Year Question Papers (CBT & Downloadable PDFs)',
          '📁 Folder 3: 2000+ Mixed MCQ Practice PDFs',
          '📁 Folder 4: Subject-Wise Tests, MCQ PDFs & Quick Revision Notes',
          '🟢 1 Free Demo unlocked in every folder',
        ],
      });
      console.log('✨ Created GSSSB Test Series Pack');
    }

    // Seed Folder 1: CBT Mixed
    const existingCBT1 = await FolderItem.findOne({ testSeriesId: gsssbSeries._id, folderType: 'cbt_mixed' });
    if (!existingCBT1) {
      // 1 Free Demo CBT
      const demoPaper = await TestPaper.create({
        testSeriesId: gsssbSeries._id,
        title: 'GSSSB Pharmacist Official Model CBT 1 (Full Syllabus)',
        durationMinutes: 120,
        totalMarks: 120,
        positiveMarks: 1,
        negativeMarks: 0.25,
        difficulty: 'Medium',
        questions: samplePharmacologyQuestions,
        parentType: 'folder_item',
      });
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'cbt_mixed',
        contentType: 'cbt',
        title: 'GSSSB Pharmacist Official Model CBT 1 (Full Syllabus)',
        testPaperId: demoPaper._id,
        totalQuestions: 120,
        durationMinutes: 120,
        isFreeDemo: true, // UNLOCKED DEMO
        sortOrder: 1,
      });

      // 1 Locked CBT
      const lockedPaper = await TestPaper.create({
        testSeriesId: gsssbSeries._id,
        title: 'GSSSB Pharmacist High-Yield Mock CBT 2 (Full Syllabus)',
        durationMinutes: 120,
        totalMarks: 120,
        positiveMarks: 1,
        negativeMarks: 0.25,
        difficulty: 'Hard',
        questions: samplePharmacologyQuestions,
        parentType: 'folder_item',
      });
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'cbt_mixed',
        contentType: 'cbt',
        title: 'GSSSB Pharmacist High-Yield Mock CBT 2 (Full Syllabus)',
        testPaperId: lockedPaper._id,
        totalQuestions: 120,
        durationMinutes: 120,
        isFreeDemo: false, // LOCKED
        sortOrder: 2,
      });

      // Seed Folder 2: PYQs
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'pyq',
        contentType: 'pdf',
        title: 'GSSSB Junior Pharmacist 2023 Official Solved Question Paper',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        year: 2023,
        totalQuestions: 150,
        isFreeDemo: true, // UNLOCKED DEMO
        sortOrder: 1,
      });
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'pyq',
        contentType: 'pdf',
        title: 'GSSSB Junior Pharmacist 2021 Official Question Paper with Answer Key',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        year: 2021,
        totalQuestions: 150,
        isFreeDemo: false, // LOCKED
        sortOrder: 2,
      });

      // Seed Folder 3: MCQ PDFs
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'mcq_pdf',
        contentType: 'pdf',
        title: '500 Most Repeated Pharmacy MCQs with Explanations (Vol 1)',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        totalQuestions: 500,
        isFreeDemo: true, // UNLOCKED DEMO
        sortOrder: 1,
      });
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'mcq_pdf',
        contentType: 'pdf',
        title: '1000 High-Yield Clinical Pharmacy MCQs Bank (Vol 2)',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        totalQuestions: 1000,
        isFreeDemo: false, // LOCKED
        sortOrder: 2,
      });

      // Seed Folder 4: Subject-Wise
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'subject_wise',
        subjectName: 'Pharmacology',
        contentType: 'cbt',
        title: 'Pharmacology Sectional CBT (ANS, CNS, CVS)',
        testPaperId: demoPaper._id,
        totalQuestions: 50,
        durationMinutes: 45,
        isFreeDemo: true, // UNLOCKED DEMO
        sortOrder: 1,
      });
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'subject_wise',
        subjectName: 'Pharmacology',
        contentType: 'notes_pdf',
        title: 'Pharmacology Quick Revision Hand Notes (Drug Classifications)',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isFreeDemo: false, // LOCKED
        sortOrder: 2,
      });
      await FolderItem.create({
        testSeriesId: gsssbSeries._id,
        folderType: 'subject_wise',
        subjectName: 'Pharmaceutics',
        contentType: 'notes_pdf',
        title: 'Pharmaceutics Tablet & Capsule Technology Summary Notes',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isFreeDemo: true, // UNLOCKED DEMO
        sortOrder: 1,
      });
      console.log('✅ Seeded GSSSB 4-Folder Items');
    }

    // -------------------------------------------------------------
    // PILLAR 2: DIGITAL STUDY MATERIAL PACKAGES (B.PHARM / D.PHARM / QUICK REVISION)
    // -------------------------------------------------------------
    const samplePacks = [
      {
        title: 'Complete B.Pharm Study Material Package (Semesters 1-8)',
        slug: 'complete-bpharm-study-material-sem-1-8',
        description: 'Comprehensive curriculum notes and solved university papers covering all 8 semesters of B.Pharm as per PCI syllabus.',
        courseType: 'B.Pharm',
        scopeLabel: 'Semesters 1-8',
        price: 999,
        discountPrice: 499,
        isFree: false,
        validityDays: 365,
        published: true,
        thumbnail: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
        highlights: [
          'All 8 B.Pharm Semesters covered',
          'Human Anatomy, Pharmaceutics & Pharmacology notes',
          'Previous 5-year university solved question papers',
          'Downloadable offline PDFs for mobile & print',
        ],
        items: [
          {
            folderName: 'Semester 1',
            subjectName: 'Human Anatomy and Physiology I',
            chapterName: 'Chapter 1: Cellular Level of Organization',
            title: 'HAP-I: Cell, Tissues & Skeletal System Notes',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: true,
            pageCount: 38,
          },
          {
            folderName: 'Semester 1',
            subjectName: 'Pharmaceutics I',
            chapterName: 'Chapter 1: Dosage Forms & Prescriptions',
            title: 'Pharmaceutics-I: Posology & Dosage Forms Revision Guide',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: false,
            pageCount: 42,
          },
          {
            folderName: 'Semester 1',
            subjectName: 'Pharmaceutical Analysis',
            chapterName: 'Unit 1: Errors & Primary Standards',
            title: 'Analysis-I: Volumetric Titrations & Errors Sheet',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: false,
            pageCount: 29,
          },
          {
            folderName: 'Semester 4',
            subjectName: 'Pharmacology I',
            chapterName: 'Unit 2: Autonomic Nervous System',
            title: 'Pharmacology-I: ANS Drugs & Neurotransmission Handout',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: false,
            pageCount: 54,
          },
        ],
      },
      {
        title: 'D.Pharm 1st & 2nd Year Complete Notes & Solved Board Papers',
        slug: 'dpharm-complete-notes-and-board-papers',
        description: 'PCI ER-2020 curriculum notes for Diploma in Pharmacy, with annual board examination past year papers.',
        courseType: 'D.Pharm',
        scopeLabel: '1st & 2nd Year',
        price: 599,
        discountPrice: 299,
        isFree: false,
        validityDays: 365,
        published: true,
        thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        highlights: [
          'Aligned with latest PCI ER-2020 Diploma syllabus',
          'Pharmaceutics, Pharmacognosy & Social Pharmacy guides',
          '5-year state board solved examination papers',
        ],
        items: [
          {
            folderName: '1st Year',
            subjectName: 'Pharmaceutics',
            chapterName: 'Chapter 1: History & Pharmacopoeias',
            title: 'D.Pharm Pharmaceutics: Introduction & Packaging Notes',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: true,
            pageCount: 26,
          },
          {
            folderName: '2nd Year',
            subjectName: 'Pharmacology',
            chapterName: 'Board Exam Past Papers',
            title: 'D.Pharm 2nd Year: 5-Year Solved Board Exam Papers',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: false,
            pageCount: 65,
          },
        ],
      },
      {
        title: 'High-Yield Quick Revision Notes (All Pharmacy Subjects)',
        slug: 'high-yield-quick-revision-notes-all-subjects',
        description: 'Bullet point rapid revision sheets, drug classification lists, and mechanism charts for competitive pharmacist exams.',
        courseType: 'QuickRevision',
        scopeLabel: 'All Subjects',
        price: 299,
        discountPrice: 149,
        isFree: false,
        validityDays: 365,
        published: true,
        thumbnail: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
        highlights: [
          'High-yield one-liners for quick exam recall',
          'Complete pharmacology drug classification cheat-sheets',
          'Quick revision for GPAT, GSSSB, ESIC & RRB Pharmacist exams',
        ],
        items: [
          {
            folderName: 'Pharmacology',
            subjectName: '',
            chapterName: 'Drug Classification',
            title: 'Complete Pharmacology Drug Classification Cheat-Sheet',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: true,
            pageCount: 22,
          },
          {
            folderName: 'Pharmaceutical Chemistry',
            subjectName: '',
            chapterName: 'Reactions & Syntheses',
            title: 'Drug Structures, IUPAC & Important Reactions Quick Sheet',
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            isFreeDemo: false,
            pageCount: 31,
          },
        ],
      },
    ];

    for (const p of samplePacks) {
      const { items, ...packData } = p;
      const pack = await StudyPack.findOneAndUpdate(
        { slug: packData.slug },
        { ...packData, totalPdfs: items.length },
        { upsert: true, new: true }
      );

      for (const it of items) {
        await StudyPackItem.findOneAndUpdate(
          { packId: pack._id, title: it.title },
          { ...it, packId: pack._id },
          { upsert: true }
        );
      }
    }
    console.log('✅ Seeded Pillar 2 Study Material Packages (B.Pharm, D.Pharm, Quick Revision)');

    // -------------------------------------------------------------
    // PILLAR 3: SINGLE MODEL PAPERS (A-LA-CARTE)
    // -------------------------------------------------------------
    const sampleSingleModels = [
      {
        title: 'AIIMS Pharmacist 2026 Official Model Paper 1 (100 MCQs)',
        slug: 'aiims-pharmacist-model-paper-1',
        examType: 'AIIMS',
        description: 'Complete 100 MCQ test with exact AIIMS Grade-II exam pattern, timer, negative marking, and downloadable answer key PDF.',
        hasCBT: true,
        hasPdf: true,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        totalQuestions: 100,
        durationMinutes: 100,
        isFree: true, // Free Demo single model paper
        price: 0,
        discountPrice: 0,
        published: true,
      },
      {
        title: 'ESIC Pharmacist Recruitment Mock Paper 1 (125 MCQs)',
        slug: 'esic-pharmacist-mock-paper-1',
        examType: 'ESIC',
        description: '100 Pharmacy + 25 General Aptitude questions as per standard ESIC recruitment pattern.',
        hasCBT: true,
        hasPdf: true,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        totalQuestions: 125,
        durationMinutes: 120,
        isFree: false,
        price: 49,
        discountPrice: 29,
        published: true,
      },
      {
        title: 'BFUHS Pharmacist Official Model Paper 2026 (100 MCQs)',
        slug: 'bfuhs-pharmacist-model-paper-1',
        examType: 'BFUHS',
        description: 'Special practice model paper for Baba Farid University of Health Sciences pharmacist exam.',
        hasCBT: true,
        hasPdf: true,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        totalQuestions: 100,
        durationMinutes: 100,
        isFree: false,
        price: 49,
        discountPrice: 29,
        published: true,
      },
    ];

    for (const sm of sampleSingleModels) {
      await SingleModelPaper.findOneAndUpdate({ slug: sm.slug }, sm, { upsert: true });
    }
    console.log('✅ Seeded Pillar 3 Single Model Papers');

    // -------------------------------------------------------------
    // PILLAR 4: NON-PHARMA HUB (REASONING, MATHS, CURRENT AFFAIRS, GS/GK)
    // -------------------------------------------------------------
    const sampleNonPharma = [
      {
        title: 'Reasoning: Blood Relations & Coding-Decoding 50 MCQ Quiz',
        section: 'reasoning',
        topic: 'Blood Relations, Coding & Decoding',
        contentType: 'cbt',
        totalQuestions: 50,
        durationMinutes: 45,
        isFree: true,
        published: true,
      },
      {
        title: 'Quantitative Aptitude: Time & Work, Percentage & Ratio Formulas PDF',
        section: 'maths',
        topic: 'Arithmetic & Speed Maths',
        contentType: 'pdf',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isFree: true,
        published: true,
      },
      {
        title: 'Monthly Current Affairs Capsule – August 2026 (Healthcare & National)',
        section: 'current_affairs',
        topic: 'Monthly Round-up',
        contentType: 'pdf',
        relevanceMonth: 'August 2026',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        isFree: true,
        published: true,
      },
      {
        title: 'General Studies: Indian Constitution & General Science 100 MCQs Quiz',
        section: 'general_studies_gk',
        topic: 'Indian Polity & Science',
        contentType: 'cbt',
        totalQuestions: 100,
        durationMinutes: 60,
        isFree: true,
        published: true,
      },
    ];

    for (const np of sampleNonPharma) {
      await NonPharmaResource.findOneAndUpdate({ title: np.title }, np, { upsert: true });
    }
    console.log('✅ Seeded Pillar 4 Non-Pharma Resources');

    console.log('🎉 4-Pillar Database Seed Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAllPillars();
