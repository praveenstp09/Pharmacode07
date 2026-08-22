import User from '../models/User.js';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import FolderItem from '../models/FolderItem.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';

// Auto-seed if database has 0 test series
export const autoSeedIfEmpty = async () => {
  try {
    const seriesCount = await TestSeries.countDocuments();
    if (seriesCount > 0) {
      // Check if folder items exist, if not seed them
      const folderItemCount = await FolderItem.countDocuments();
      if (folderItemCount === 0) {
        console.log('🌱 Populating Test Series 4-Folders...');
        const seriesList = await TestSeries.find();
        for (const s of seriesList) {
          const papers = await TestPaper.find({ testSeriesId: s._id });
          for (let idx = 0; idx < papers.length; idx++) {
            const p = papers[idx];
            await FolderItem.create({
              testSeriesId: s._id,
              folderType: 'cbt_mixed',
              contentType: 'cbt',
              title: p.title,
              testPaperId: p._id,
              totalQuestions: p.questions ? p.questions.length : 100,
              durationMinutes: p.durationMinutes,
              isFreeDemo: idx === 0, // 1st item is free demo
              sortOrder: idx + 1,
              published: true,
            });
          }

          // Add sample PYQ (CBT + PDF) and Subject-Wise CBT items
          await FolderItem.create({
            testSeriesId: s._id,
            folderType: 'pyq',
            contentType: 'pdf',
            title: `${s.examType} Official Solved Previous Year Paper`,
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            year: 2023,
            isFreeDemo: true, // Free demo
            sortOrder: 1,
          });

          await FolderItem.create({
            testSeriesId: s._id,
            folderType: 'subject_wise',
            subjectName: 'Pharmacology',
            contentType: 'cbt',
            title: 'Pharmacology High-Yield 100 MCQs Practice CBT Exam',
            isFreeDemo: true, // Free demo
            totalQuestions: 100,
            durationMinutes: 90,
            sortOrder: 1,
          });
        }
      }

      // Check Single Model Papers
      const singleCount = await SingleModelPaper.countDocuments();
      if (singleCount === 0) {
        await SingleModelPaper.create([
          {
            title: 'AIIMS Pharmacist 2026 Official Model Paper 1 (100 MCQs)',
            slug: 'aiims-pharmacist-model-paper-1',
            examType: 'AIIMS',
            description: '100 MCQs test with exact AIIMS Grade-II exam pattern, timer, negative marking, and downloadable answer key PDF.',
            hasCBT: true,
            hasPdf: true,
            pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            totalQuestions: 100,
            durationMinutes: 100,
            isFree: true,
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
        ]);
      }

      // Check Non-Pharma
      const nonPharmaCount = await NonPharmaResource.countDocuments();
      if (nonPharmaCount === 0) {
        await NonPharmaResource.create([
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
        ]);
      }

      return;
    }

    console.log('🌱 Empty database detected. Auto-seeding Pharmacode07Exams data...');

    // 1. Create Admin & Student
    const admin = await User.create({
      name: 'Pharmacode Admin',
      email: 'admin@pharmacode07.com',
      mobile: '9336331163',
      password: 'Admin@123',
      role: 'admin',
    });

    const student = await User.create({
      name: 'Rohan Sharma',
      email: 'student@gmail.com',
      mobile: '9876543210',
      password: 'Student@123',
      role: 'student',
    });

    // 2. GSSSB Junior Pharmacist (Featured Product)
    const gsssbSeries = await TestSeries.create({
      title: 'GSSSB Junior Pharmacist 2026 – Complete Test Series Pack',
      slug: 'gsssb-junior-pharmacist-2026-mock-test-series',
      description:
        'Complete high-yield preparation pack for GSSSB Junior Pharmacist Exam. Includes 4 sub-folders: Full CBT Mocks, Past Year Papers (PYQs), High-Yield MCQ PDFs, and Subject-Wise Tests & Notes with 365-day validity.',
      category: 'Competitive Exam',
      examType: 'GSSSB',
      thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      totalTests: 5,
      totalQuestions: 600,
      price: 499,
      discountPrice: 199,
      validityDays: 365,
      isFree: false,
      published: true,
      highlights: [
        '5 Full-Length Mock Papers (120 MCQs each)',
        'Negative marking (-0.25) & Real exam timer',
        'Subject-wise analysis & Detailed explanations',
        'Instant Result & Reattempt facility',
      ],
    });

    console.log('✅ Auto-seed completed successfully!');
  } catch (err) {
    console.error('⚠️ Auto-seed Error:', err.message);
  }
};
