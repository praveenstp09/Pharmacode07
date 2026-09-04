import TestAttempt from '../models/TestAttempt.js';
import TestPaper from '../models/TestPaper.js';
import TestSeries from '../models/TestSeries.js';
import User from '../models/User.js';
import FolderItem from '../models/FolderItem.js';
import Purchase from '../models/Purchase.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';
import AppError from '../utils/AppError.js';
import { paginateArray } from '../utils/paginate.js';

export const submitTestAttempt = async (userId, { paperId, answers, timeSpentSeconds }) => {
  if (!paperId || !answers || !Array.isArray(answers)) {
    throw new AppError('Invalid submission data', 400);
  }

  const paper = await TestPaper.findById(paperId);
  if (!paper) {
    throw new AppError('Test paper not found', 404);
  }

  // Access & Paywall Authorization Guard
  const user = await User.findById(userId);
  let hasAccess = user && user.role === 'admin';

  if (!hasAccess) {
    const folderItem = await FolderItem.findOne({ testPaperId: paper._id });
    if (folderItem && folderItem.isFreeDemo) {
      hasAccess = true;
    }

    if (!hasAccess && (paper.parentType === 'single_model' || !paper.testSeriesId)) {
      const modelPaper = await SingleModelPaper.findOne({
        $or: [{ _id: paper.parentId }, { testPaperId: paper._id }],
      });
      if (modelPaper) {
        if (modelPaper.isFree) {
          hasAccess = true;
        } else {
          const isSinglePurchased = user.purchasedSingleModels?.some(
            id => id.toString() === modelPaper._id.toString()
          );
          const singlePurchase = await Purchase.findOne({
            userId: user._id,
            itemType: 'SingleModelPaper',
            itemId: modelPaper._id,
            isActive: true,
            expiresAt: { $gt: new Date() },
          });
          if (isSinglePurchased || singlePurchase) hasAccess = true;
        }
      }
    }

    if (!hasAccess && (paper.parentType === 'non_pharma' || !paper.testSeriesId)) {
      const nonPharma = await NonPharmaResource.findOne({
        $or: [{ _id: paper.parentId }, { testPaperId: paper._id }],
      });
      if (nonPharma) {
        if (nonPharma.isFree || !nonPharma.isPaid || (nonPharma.price || 0) === 0) {
          hasAccess = true;
        } else {
          const isNonPharmaPurchased = user.purchasedNonPharma?.some(
            id => id.toString() === nonPharma._id.toString()
          );
          const nonPharmaPurchase = await Purchase.findOne({
            userId: user._id,
            itemType: 'NonPharmaResource',
            itemId: nonPharma._id,
            isActive: true,
            expiresAt: { $gt: new Date() },
          });
          if (isNonPharmaPurchased || nonPharmaPurchase) hasAccess = true;
        }
      }
    }

    const targetSeriesId = paper.testSeriesId || (paper.parentType === 'test_series' ? paper.parentId : null);
    if (!hasAccess && targetSeriesId) {
      const isSeriesPurchased = user.purchasedTests?.some(
        id => id.toString() === targetSeriesId.toString()
      );
      const seriesPurchase = await Purchase.findOne({
        userId: user._id,
        itemType: 'TestSeries',
        itemId: targetSeriesId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });
      if (isSeriesPurchased || seriesPurchase) hasAccess = true;
    }
  }

  if (!hasAccess) {
    throw new AppError('You must enroll in this test package to submit test attempts and view solutions.', 403);
  }

  const positiveMark = paper.positiveMarks !== undefined && paper.positiveMarks !== null ? Number(paper.positiveMarks) : 1;
  const negativeMark = paper.negativeMarks !== undefined && paper.negativeMarks !== null ? Number(paper.negativeMarks) : 0.25;
  const totalQuestions = paper.questions.length;

  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const formattedAnswers = paper.questions.map((q, index) => {
    const studentAnsObj = answers[index];
    const selectedOption = studentAnsObj !== undefined && studentAnsObj !== null
      ? (typeof studentAnsObj === 'object' ? studentAnsObj.selectedOption : studentAnsObj)
      : -1;
    const questionTime = (typeof studentAnsObj === 'object' && studentAnsObj.timeSpentSeconds) || 0;

    if (selectedOption === -1 || selectedOption === undefined || selectedOption === null) {
      unattemptedCount++;
      return {
        selectedOption: -1,
        timeSpentSeconds: questionTime,
        isCorrect: false,
      };
    } else if (selectedOption === q.correctOptionIndex) {
      correctCount++;
      score += positiveMark;
      return {
        selectedOption,
        timeSpentSeconds: questionTime,
        isCorrect: true,
      };
    } else {
      incorrectCount++;
      score -= negativeMark;
      return {
        selectedOption,
        timeSpentSeconds: questionTime,
        isCorrect: false,
      };
    }
  });

  score = Math.round(score * 100) / 100;
  const totalPossibleMarks = paper.totalMarks || (totalQuestions * positiveMark) || 1;
  const percentage = totalPossibleMarks > 0
    ? Math.max(0, Math.round(((score / totalPossibleMarks) * 100) * 100) / 100)
    : 0;

  const attempt = await TestAttempt.create({
    userId: user._id,
    testSeriesId: paper.testSeriesId || null,
    testPaperId: paper._id,
    score,
    totalMarks: totalPossibleMarks,
    correctCount,
    incorrectCount,
    unattemptedCount,
    percentage,
    timeSpentSeconds: timeSpentSeconds || 0,
    answers: formattedAnswers,
  });

  return {
    attemptId: attempt._id,
    result: {
      score,
      totalMarks: totalPossibleMarks,
      correctCount,
      incorrectCount,
      unattemptedCount,
      percentage,
      timeSpentSeconds: attempt.timeSpentSeconds,
    },
  };
};

export const fetchUserAttempts = async (userId, queryParams = {}) => {
  const rawAttempts = await TestAttempt.find({ userId })
    .populate('testSeriesId', 'title slug examType category')
    .populate('testPaperId', 'title paperNumber durationMinutes totalMarks parentType parentId testSeriesId questions')
    .sort({ completedAt: -1 })
    .lean();

  if (rawAttempts.length === 0) {
    return paginateArray([], queryParams);
  }

  const paperIds = [...new Set(rawAttempts.map(a => a.testPaperId?._id).filter(Boolean))];

  const [folderItems, singleModels, nonPharmas] = await Promise.all([
    FolderItem.find({ testPaperId: { $in: paperIds } })
      .populate('testSeriesId', 'title slug examType')
      .lean(),
    SingleModelPaper.find({ testPaperId: { $in: paperIds } }).lean(),
    NonPharmaResource.find({ testPaperId: { $in: paperIds } }).lean(),
  ]);

  const folderMap = new Map();
  folderItems.forEach(f => {
    if (f.testPaperId) folderMap.set(f.testPaperId.toString(), f);
  });

  const singleModelMap = new Map();
  singleModels.forEach(sm => {
    if (sm.testPaperId) singleModelMap.set(sm.testPaperId.toString(), sm);
  });

  const nonPharmaMap = new Map();
  nonPharmas.forEach(np => {
    if (np.testPaperId) nonPharmaMap.set(np.testPaperId.toString(), np);
  });

  const enriched = rawAttempts.map((att) => {
    let parentTitle = att.testSeriesId?.title || '';
    let testSeriesSlug = att.testSeriesId?.slug || '';
    let categoryBadge = 'Test Series';
    let subBadge = '';
    const paper = att.testPaperId;

    if (paper) {
      const paperKey = paper._id ? paper._id.toString() : '';
      const folderItem = folderMap.get(paperKey);
      const singleModel = singleModelMap.get(paperKey);
      const nonPharma = nonPharmaMap.get(paperKey);

      if (folderItem) {
        if (folderItem.testSeriesId) {
          parentTitle = folderItem.testSeriesId.title;
          testSeriesSlug = folderItem.testSeriesId.slug;
        }
        if (folderItem.folderType === 'model_papers' || folderItem.folderType === 'cbt_mixed') {
          categoryBadge = 'Model Paper';
        } else if (folderItem.folderType === 'previous_year_papers' || folderItem.folderType === 'pyq') {
          categoryBadge = 'Previous Year Paper';
          if (folderItem.year) subBadge = `${folderItem.year}`;
        } else if (folderItem.folderType === 'subject_wise_tests' || folderItem.folderType === 'subject_wise') {
          categoryBadge = 'Subject-Wise Test';
          if (folderItem.subjectName) subBadge = folderItem.subjectName;
        }
      } else if (singleModel) {
        parentTitle = singleModel.title;
        categoryBadge = 'Single Model Paper';
        if (singleModel.examType) subBadge = singleModel.examType;
      } else if (nonPharma) {
        parentTitle = nonPharma.title;
        categoryBadge = 'Non-Pharma Resource';
        if (nonPharma.section) subBadge = nonPharma.section;
      } else if (!parentTitle && paper.testSeriesId) {
        categoryBadge = 'Test Series Pack';
      }
    }

    return {
      ...att,
      parentTitle: parentTitle || 'PharmaCode CBT Paper',
      testSeriesSlug,
      categoryBadge,
      subBadge,
      paperTitle: paper?.title || 'Mock Test Paper',
      totalQuestions: paper?.questions ? paper.questions.length : (att.totalMarks || 100),
    };
  });

  return paginateArray(enriched, queryParams);
};

export const fetchAttemptDetails = async (attemptId, currentUser) => {
  const attempt = await TestAttempt.findById(attemptId)
    .populate('testSeriesId', 'title slug examType')
    .populate('testPaperId');

  if (!attempt) {
    throw new AppError('Attempt not found', 404);
  }

  if (attempt.userId.toString() !== currentUser.id && currentUser.role !== 'admin') {
    throw new AppError('Unauthorized access to this test result', 403);
  }

  const paper = attempt.testPaperId;
  if (!paper) {
    throw new AppError('The test paper associated with this attempt has been deleted or is no longer available.', 404);
  }

  let parentTitle = attempt.testSeriesId?.title || '';
  let parentSlug = attempt.testSeriesId?.slug || '';
  let topicName = '';
  let sectionName = '';

  if (paper.parentType === 'non_pharma' || !attempt.testSeriesId) {
    const nonPharma = await NonPharmaResource.findOne({
      $or: [{ testPaperId: paper._id }, { _id: paper.parentId }],
    });
    if (nonPharma) {
      const sectionLabels = {
        reasoning: 'Reasoning Ability',
        maths: 'Quantitative Aptitude',
        current_affairs: 'Current Affairs',
        general_studies_gk: 'General Studies & GK',
      };
      parentTitle = sectionLabels[nonPharma.section] || nonPharma.title;
      topicName = nonPharma.topic || '';
      sectionName = nonPharma.section || '';
    }
  }

  if (!parentTitle && paper.parentType === 'single_model') {
    const singleModel = await SingleModelPaper.findOne({
      $or: [{ testPaperId: paper._id }, { _id: paper.parentId }],
    });
    if (singleModel) {
      parentTitle = singleModel.title;
      sectionName = singleModel.examType || '';
    }
  }

  const detailedQuestions = paper.questions.map((q, idx) => {
    const studentAns = attempt.answers[idx] || { selectedOption: -1, isCorrect: false, timeSpentSeconds: 0 };
    return {
      questionNumber: idx + 1,
      questionText: q.questionText,
      options: q.options,
      questionTextHindi: q.questionTextHindi || '',
      optionsHindi: q.optionsHindi || [],
      correctOptionIndex: q.correctOptionIndex,
      selectedOption: studentAns.selectedOption,
      isCorrect: studentAns.isCorrect,
      timeSpentSeconds: studentAns.timeSpentSeconds,
      explanation: q.explanation,
      explanationHindi: q.explanationHindi || '',
      subject: q.subject,
      topic: q.topic || topicName,
      imageUrl: q.imageUrl,
    };
  });

  return {
    _id: attempt._id,
    testSeriesTitle: parentTitle || attempt.testSeriesId?.title || paper.title,
    testSeriesSlug: parentSlug,
    testPaperTitle: paper.title,
    topic: topicName,
    section: sectionName,
    paperId: paper._id,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    positiveMarks: paper.positiveMarks !== undefined && paper.positiveMarks !== null ? Number(paper.positiveMarks) : 1,
    negativeMarks: paper.negativeMarks !== undefined && paper.negativeMarks !== null ? Number(paper.negativeMarks) : 0.25,
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    unattemptedCount: attempt.unattemptedCount,
    percentage: attempt.percentage,
    timeSpentSeconds: attempt.timeSpentSeconds,
    completedAt: attempt.completedAt,
    questions: detailedQuestions,
  };
};
