import User from '../models/User.js';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';

// Auto-seed if database has 0 test series
export const autoSeedIfEmpty = async () => {
  try {
    const seriesCount = await TestSeries.countDocuments();
    if (seriesCount > 0) return; // Already seeded

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
      title: 'GSSSB Junior Pharmacist 2026 – 120 MCQ Model Test Series Pack',
      slug: 'gsssb-junior-pharmacist-2026-mock-test-series',
      description:
        'Complete high-yield preparation pack for GSSSB Junior Pharmacist Exam. Includes 120 MCQs per mock test covering Pharmacology, Pharmaceutics, Pharmacognosy, Jurisprudence, HAP, and Clinical Pharmacy with instant scoring and detailed answers.',
      category: 'Competitive Exam',
      examType: 'GSSSB',
      thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      totalTests: 5,
      totalQuestions: 600,
      price: 499,
      discountPrice: 199,
      isFree: false,
      published: true,
      highlights: [
        '5 Full-Length Mock Papers (120 MCQs each)',
        'Negative marking (-0.25) & Real exam timer',
        'Subject-wise analysis & Detailed explanations',
        'Instant Result & Reattempt facility',
      ],
    });

    // 120 Sample Questions generator
    const pharmacyQuestions = [
      {
        questionText: 'Which of the following is considered the drug of choice for the treatment of Anaphylactic Shock?',
        options: ['Adrenaline (Epinephrine)', 'Atropine', 'Dopamine', 'Hydrocortisone'],
        correctOptionIndex: 0,
        explanation: 'Adrenaline acts on alpha-1, beta-1, and beta-2 adrenergic receptors causing vasoconstriction, cardiac stimulation, and bronchodilation.',
        subject: 'Pharmacology',
      },
      {
        questionText: 'Which Schedule of the Drugs and Cosmetics Act, 1940 prescribes the Good Manufacturing Practices (GMP)?',
        options: ['Schedule M', 'Schedule H', 'Schedule Y', 'Schedule P'],
        correctOptionIndex: 0,
        explanation: 'Schedule M prescribes Good Manufacturing Practices (GMP) and requirements of premises, plant, and equipment for pharmaceutical products.',
        subject: 'Pharmaceutical Jurisprudence',
      },
      {
        questionText: 'Which of the following opiate analgesics has the highest potency compared to Morphine?',
        options: ['Codeine', 'Fentanyl', 'Pethidine', 'Tramadol'],
        correctOptionIndex: 1,
        explanation: 'Fentanyl is approximately 50 to 100 times more potent than morphine as an opioid analgesic.',
        subject: 'Pharmacology',
      },
      {
        questionText: 'The process of grinding an insoluble substance to a fine powder while wet is known as:',
        options: ['Trituration', 'Levigation', 'Pulverization by intervention', 'Elutriation'],
        correctOptionIndex: 1,
        explanation: 'Levigation is wet grinding where a paste is formed by adding a small amount of liquid.',
        subject: 'Pharmaceutics',
      },
      {
        questionText: 'Which of the following is a loop diuretic?',
        options: ['Hydrochlorothiazide', 'Furosemide', 'Spironolactone', 'Acetazolamide'],
        correctOptionIndex: 1,
        explanation: 'Furosemide acts on the thick ascending limb of the loop of Henle.',
        subject: 'Pharmacology',
      },
      {
        questionText: 'Eugenia caryophyllata is the botanical source of which crude drug?',
        options: ['Cinnamon', 'Clove', 'Cardamom', 'Fennel'],
        correctOptionIndex: 1,
        explanation: 'Clove consists of dried flower buds of Eugenia caryophyllata (family Myrtaceae).',
        subject: 'Pharmacognosy',
      },
      {
        questionText: 'What is the standard storage temperature for "Cold" storage as per IP (Indian Pharmacopoeia)?',
        options: ['Between 2°C and 8°C', 'Between 8°C and 25°C', 'Below 0°C', 'Between 15°C and 30°C'],
        correctOptionIndex: 0,
        explanation: 'As per IP, "Cold" is defined as temperature between 2°C and 8°C.',
        subject: 'Pharmaceutics',
      },
      {
        questionText: 'Which vitamin is chemically known as Cyanocobalamin?',
        options: ['Vitamin B1', 'Vitamin B6', 'Vitamin B12', 'Vitamin B9'],
        correctOptionIndex: 2,
        explanation: 'Vitamin B12 is cyanocobalamin and contains cobalt.',
        subject: 'Biochemistry',
      },
      {
        questionText: 'Sublingually administered Nitroglycerin is primarily used in the management of:',
        options: ['Angina Pectoris', 'Hypertension crisis', 'Arrhythmia', 'Cardiac arrest'],
        correctOptionIndex: 0,
        explanation: 'Sublingual Nitroglycerin produces rapid venodilation, reducing preload in acute angina pectoris.',
        subject: 'Hospital & Clinical Pharmacy',
      },
      {
        questionText: 'Which organism is used as the biological indicator for Steam Sterilization (Autoclaving)?',
        options: ['Bacillus subtilis', 'Geobacillus stearothermophilus', 'Clostridium sporogenes', 'Bacillus pumilus'],
        correctOptionIndex: 1,
        explanation: 'Geobacillus stearothermophilus spores are used for moist heat autoclave sterilization.',
        subject: 'Microbiology',
      },
    ];

    // Build 120 questions
    let full120Q = [];
    while (full120Q.length < 120) {
      pharmacyQuestions.forEach(q => {
        if (full120Q.length < 120) {
          full120Q.push({
            ...q,
            questionText: `[Q${full120Q.length + 1}] ${q.questionText}`,
          });
        }
      });
    }

    // Mock Paper 1
    await TestPaper.create({
      testSeriesId: gsssbSeries._id,
      title: 'GSSSB Junior Pharmacist Mock Test 1 (120 MCQs Full Syllabus)',
      paperNumber: 1,
      durationMinutes: 120,
      totalMarks: 120,
      positiveMarks: 1,
      negativeMarks: 0.25,
      difficulty: 'Medium',
      questions: full120Q,
      published: true,
    });

    // Mock Papers 2..5
    for (let i = 2; i <= 5; i++) {
      await TestPaper.create({
        testSeriesId: gsssbSeries._id,
        title: `GSSSB Junior Pharmacist Mock Test ${i} (120 MCQs)`,
        paperNumber: i,
        durationMinutes: 120,
        totalMarks: 120,
        positiveMarks: 1,
        negativeMarks: 0.25,
        difficulty: 'Medium',
        questions: full120Q,
        published: true,
      });
    }

    // 3. UPSSSC Series
    const upssscSeries = await TestSeries.create({
      title: 'UPSSSC Pharmacist 2026 Special Mock Test Series',
      slug: 'upsssc-pharmacist-2026-mock-series',
      description: 'Targeted mock test papers designed strictly as per latest UPSSSC Pharmacist recruitment exam syllabus.',
      category: 'Competitive Exam',
      examType: 'UPSSSC',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
      totalTests: 3,
      totalQuestions: 360,
      price: 399,
      discountPrice: 149,
      isFree: false,
      published: true,
      highlights: [
        '3 Full Syllabus Mock Tests (120 MCQs each)',
        'Comprehensive solutions included',
      ],
    });

    for (let i = 1; i <= 3; i++) {
      await TestPaper.create({
        testSeriesId: upssscSeries._id,
        title: `UPSSSC Pharmacist Mock Test ${i}`,
        paperNumber: i,
        durationMinutes: 120,
        totalMarks: 120,
        questions: full120Q.slice(0, 120),
        published: true,
      });
    }

    // 4. Free Demo Test
    const freeSeries = await TestSeries.create({
      title: 'Pharmacy Competitive Exams – Free Demo Mock Test (25 MCQs)',
      slug: 'free-pharmacy-demo-mock-test',
      description: 'Try our test-taking platform for free. Experience real exam timer, question palette, and detailed solution analysis.',
      category: 'Model Paper',
      examType: 'All Exams',
      thumbnail: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
      totalTests: 1,
      totalQuestions: 25,
      price: 0,
      discountPrice: 0,
      isFree: true,
      published: true,
      highlights: ['Free forever', '25 High-yield questions', 'Instant result & explanations'],
    });

    await TestPaper.create({
      testSeriesId: freeSeries._id,
      title: 'Free Demo Mock Paper (25 Questions)',
      paperNumber: 1,
      durationMinutes: 30,
      totalMarks: 25,
      questions: full120Q.slice(0, 25),
      published: true,
    });

    // Auto-enroll sample student in GSSSB series
    student.purchasedTests.push(gsssbSeries._id);
    await student.save();

    // 5. Study Materials
    await StudyMaterial.create([
      {
        title: 'Pharmacology Essential Drug Classification Chart (2026 Edition)',
        slug: 'pharmacology-drug-classification-chart-2026',
        description: 'Color-coded summary chart of all major autonomic, cardiovascular, and CNS drugs with mechanisms of action.',
        category: 'Drug Lists',
        subject: 'Pharmacology',
        examType: 'All Exams',
        year: 2026,
        isPaid: false,
        price: 0,
        discountPrice: 0,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        published: true,
      },
      {
        title: 'GSSSB Junior Pharmacist 500 High-Yield One-Liner Notes PDF',
        slug: 'gsssb-pharmacist-500-one-liners',
        description: 'Quick revision one-liners compiled from past 10 years of pharmacist recruitment exam papers.',
        category: 'Notes',
        subject: 'General Pharmacy',
        examType: 'GSSSB',
        year: 2026,
        isPaid: true,
        price: 99,
        discountPrice: 49,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        published: true,
      },
      {
        title: 'UPSSSC Pharmacist Official Previous Year Question Paper with Answer Key',
        slug: 'upsssc-pharmacist-pyq-solved',
        description: 'Fully solved previous year exam paper with detailed explanation for every question.',
        category: 'PYQ',
        subject: 'General Pharmacy',
        examType: 'UPSSSC',
        year: 2024,
        isPaid: false,
        price: 0,
        discountPrice: 0,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        published: true,
      },
    ]);

    // 6. Coupons
    await Coupon.create([
      {
        code: 'PHARMA10',
        discountPercent: 10,
        maxDiscount: 100,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        minOrderValue: 99,
        usageLimit: 500,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'WELCOME50',
        discountPercent: 50,
        maxDiscount: 150,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        minOrderValue: 199,
        usageLimit: 200,
        usedCount: 0,
        isActive: true,
      },
    ]);

    console.log('✅ Auto-seed completed successfully!');
  } catch (err) {
    console.error('⚠️ Auto-seed Error:', err.message);
  }
};
