import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import FolderItem from '../models/FolderItem.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import TestAttempt from '../models/TestAttempt.js';
import AppError from '../utils/AppError.js';
import { getCache, setCache } from '../utils/cache.js';
import { paginateArray } from '../utils/paginate.js';

export const listTestSeries = async (queryParams) => {
  const { category, examType, search, sort } = queryParams;
  let query = { published: true };

  if (category && category !== 'All') {
    query.category = category;
  }
  if (examType && examType !== 'All') {
    query.examType = examType;
  }
  if (search) {
    const cleanSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.title = { $regex: cleanSearch, $options: 'i' };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price-low') sortOption = { discountPrice: 1 };
  if (sort === 'price-high') sortOption = { discountPrice: -1 };
  if (sort === 'rating') sortOption = { totalQuestions: -1 };

  // Cache key for search & filters
  const cacheKey = `series_list:${JSON.stringify({ category, examType, search, sort })}`;
  const cached = await getCache(cacheKey);
  if (cached) return paginateArray(cached, queryParams);

  const rawSeries = await TestSeries.find(query).sort(sortOption).lean();
  if (rawSeries.length === 0) {
    return paginateArray([], queryParams);
  }

  const seriesIds = rawSeries.map(s => s._id);

  // Parallel bulk aggregations for all series at once (2 queries instead of 2 * N queries)
  const [paperAgg, folderAgg] = await Promise.all([
    TestPaper.aggregate([
      { $match: { testSeriesId: { $in: seriesIds } } },
      {
        $project: {
          testSeriesId: 1,
          questionCount: { $size: { $ifNull: ['$questions', []] } },
        },
      },
      {
        $group: {
          _id: '$testSeriesId',
          totalQuestions: { $sum: '$questionCount' },
          paperCount: { $sum: 1 },
        },
      },
    ]),
    FolderItem.aggregate([
      { $match: { testSeriesId: { $in: seriesIds } } },
      {
        $group: {
          _id: '$testSeriesId',
          cbtCount: {
            $sum: { $cond: [{ $eq: ['$contentType', 'cbt'] }, 1, 0] },
          },
          pdfCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$contentType', 'cbt'] },
                    { $gt: [{ $strLenCP: { $ifNull: ['$pdfUrl', ''] } }, 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const paperMap = new Map();
  paperAgg.forEach(p => paperMap.set(p._id.toString(), p));

  const folderMap = new Map();
  folderAgg.forEach(f => folderMap.set(f._id.toString(), f));

  const series = rawSeries.map(s => {
    const sId = s._id.toString();
    const pData = paperMap.get(sId);
    const fData = folderMap.get(sId);

    const totalCalculatedQuestions = pData ? pData.totalQuestions : 0;
    const cbtCount = (fData ? fData.cbtCount : 0) || (pData ? pData.paperCount : 0);
    const pdfCount = fData ? fData.pdfCount : 0;

    return {
      ...s,
      totalQuestions: totalCalculatedQuestions > 0 ? totalCalculatedQuestions : (s.totalQuestions || 0),
      totalTests: cbtCount > 0 ? cbtCount : (s.totalTests || (pData ? pData.paperCount : 0) || 0),
      totalPdfs: pdfCount > 0 ? pdfCount : (s.totalPdfs || 0),
    };
  });

  // Cache raw computed series for 30 seconds
  await setCache(cacheKey, series, 30);
  return paginateArray(series, queryParams);
};

export const getSeriesDetailsBySlug = async (slug, currentUser) => {
  const series = await TestSeries.findOne({ slug, published: true });
  if (!series) {
    throw new AppError('Test Series not found', 404);
  }

  let isFullUnlocked = series.isFree;
  const userAttemptMap = {};

  if (currentUser) {
    if (currentUser.role === 'admin') {
      isFullUnlocked = true;
    } else {
      const hasDirectPurchase = currentUser.purchasedTests?.some(
        id => id.toString() === series._id.toString()
      );
      const purchaseRecord = await Purchase.findOne({
        userId: currentUser._id,
        itemType: 'TestSeries',
        itemId: series._id,
        expiresAt: { $gt: new Date() },
        isActive: true,
      });

      if (hasDirectPurchase || purchaseRecord) {
        isFullUnlocked = true;
      }
    }

    // Fetch user's previous test attempts
    const attempts = await TestAttempt.find({ userId: currentUser._id })
      .select('testPaperId score totalMarks percentage completedAt')
      .sort({ completedAt: -1 })
      .lean();

    attempts.forEach(att => {
      const paperIdStr = att.testPaperId?.toString();
      if (paperIdStr) {
        if (!userAttemptMap[paperIdStr]) {
          userAttemptMap[paperIdStr] = {
            attemptId: att._id,
            score: att.score,
            totalMarks: att.totalMarks,
            percentage: att.percentage,
            completedAt: att.completedAt,
            attemptCount: 1,
          };
        } else {
          userAttemptMap[paperIdStr].attemptCount += 1;
        }
      }
    });
  }

  // Fetch all items inside the 4 folders
  const folderItems = await FolderItem.find({ testSeriesId: series._id, published: true })
    .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty')
    .sort({ sortOrder: 1, createdAt: 1 });

  const folders = {
    cbtMixed: [],
    pyqs: [],
    subjectWise: {},
  };

  folderItems.forEach(item => {
    const isItemUnlocked = isFullUnlocked || item.isFreeDemo;
    const paperIdStr = item.testPaperId ? item.testPaperId._id.toString() : item._id.toString();
    const userAttempt = userAttemptMap[paperIdStr] || null;

    const formattedItem = {
      _id: item._id,
      title: item.title,
      contentType: item.contentType,
      folderType: item.folderType,
      subjectName: item.subjectName,
      year: item.year,
      totalQuestions: item.totalQuestions,
      durationMinutes: item.durationMinutes,
      isFreeDemo: item.isFreeDemo,
      isLocked: !isItemUnlocked,
      testPaperId: item.testPaperId ? item.testPaperId._id : null,
      paperDetails: item.testPaperId || null,
      positiveMarks: item.testPaperId?.positiveMarks !== undefined && item.testPaperId?.positiveMarks !== null ? item.testPaperId.positiveMarks : 1,
      negativeMarks: item.testPaperId?.negativeMarks !== undefined && item.testPaperId?.negativeMarks !== null ? item.testPaperId.negativeMarks : 0.25,
      pdfUrl: isItemUnlocked ? item.pdfUrl : '',
      isAttempted: !!userAttempt,
      latestAttempt: userAttempt,
    };

    if (item.folderType === 'model_papers' || item.folderType === 'cbt_mixed') {
      folders.cbtMixed.push(formattedItem);
    } else if (item.folderType === 'previous_year_papers' || item.folderType === 'pyq') {
      folders.pyqs.push(formattedItem);
    } else if (item.folderType === 'subject_wise_tests' || item.folderType === 'subject_wise') {
      const sub = item.subjectName || 'General';
      if (!folders.subjectWise[sub]) folders.subjectWise[sub] = [];
      folders.subjectWise[sub].push(formattedItem);
    }
  });

  const legacyPapers = await TestPaper.find({ testSeriesId: series._id, published: true })
    .select('title paperNumber durationMinutes totalMarks positiveMarks negativeMarks difficulty questions')
    .sort({ paperNumber: 1 });

  return {
    series,
    isUnlocked: isFullUnlocked,
    folders,
    stats: {
      cbtMixedCount: folders.cbtMixed.length,
      pyqsCount: folders.pyqs.length,
      subjectCount: Object.keys(folders.subjectWise).length,
      totalFolderItems: folderItems.length,
    },
    legacyPapers: legacyPapers.map((p, idx) => {
      const paperIdStr = p._id.toString();
      const userAttempt = userAttemptMap[paperIdStr] || null;

      return {
        _id: p._id,
        title: p.title,
        paperNumber: p.paperNumber,
        durationMinutes: p.durationMinutes,
        totalMarks: p.totalMarks,
        positiveMarks: p.positiveMarks !== undefined && p.positiveMarks !== null ? p.positiveMarks : 1,
        negativeMarks: p.negativeMarks !== undefined && p.negativeMarks !== null ? p.negativeMarks : 0.25,
        isFreeDemo: idx === 0,
        isLocked: !isFullUnlocked && idx !== 0,
        questionsCount: p.questions ? p.questions.length : 0,
        isAttempted: !!userAttempt,
        latestAttempt: userAttempt,
      };
    }),
  };
};

export const getPaperForTestAttempt = async (paperId, currentUser) => {
  const paper = await TestPaper.findById(paperId).populate('testSeriesId');
  if (!paper) {
    throw new AppError('Test Paper not found', 404);
  }

  const series = paper.testSeriesId;
  const user = await User.findById(currentUser.id);
  const isAdmin = user.role === 'admin';

  const folderItem = await FolderItem.findOne({ testPaperId: paper._id });
  const isFreeDemo = folderItem?.isFreeDemo || false;

  let hasAccess = isAdmin || isFreeDemo;

  if (!hasAccess && series) {
    const isPurchased = user.purchasedTests?.some(
      id => id.toString() === series._id.toString()
    );
    const purchaseRecord = await Purchase.findOne({
      userId: user._id,
      itemType: 'TestSeries',
      itemId: series._id,
      expiresAt: { $gt: new Date() },
      isActive: true,
    });

    if (isPurchased || purchaseRecord || series.isFree) {
      hasAccess = true;
    }
  }

  if (!hasAccess && paper.parentType === 'single_model') {
    const singleModel = await SingleModelPaper.findOne({
      $or: [{ testPaperId: paper._id }, { _id: paper.parentId }],
    });

    if (singleModel) {
      if (singleModel.isFree) {
        hasAccess = true;
      } else {
        const isPurchased = user.purchasedSingleModels?.some(
          id => id.toString() === singleModel._id.toString()
        );
        const purchase = await Purchase.findOne({
          userId: user._id,
          itemType: 'SingleModelPaper',
          itemId: singleModel._id,
          expiresAt: { $gt: new Date() },
          isActive: true,
        });
        if (isPurchased || purchase) hasAccess = true;
      }
    }
  }

  if (!hasAccess && paper.parentType === 'non_pharma') {
    hasAccess = true;
  }

  if (!hasAccess) {
    throw new AppError('This test paper is locked. Please purchase the full package to unlock.', 403);
  }

  let nonPharmaTopic = '';
  let nonPharmaSection = '';
  let displayParentTitle = series ? series.title : paper.title;

  if (paper.parentType === 'non_pharma' || !series) {
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
      displayParentTitle = sectionLabels[nonPharma.section] || nonPharma.title;
      nonPharmaTopic = nonPharma.topic || '';
      nonPharmaSection = nonPharma.section || '';
    }
  }

  if (paper.parentType === 'single_model' && !series) {
    const singleModel = await SingleModelPaper.findOne({
      $or: [{ testPaperId: paper._id }, { _id: paper.parentId }],
    });
    if (singleModel) {
      displayParentTitle = singleModel.title;
      nonPharmaSection = singleModel.examType || '';
    }
  }

  const sanitizedQuestions = paper.questions.map((q, idx) => ({
    _id: q._id,
    index: idx,
    questionText: q.questionText,
    options: q.options,
    questionTextHindi: q.questionTextHindi || '',
    optionsHindi: q.optionsHindi || [],
    subject: q.subject,
    topic: q.topic || nonPharmaTopic,
    imageUrl: q.imageUrl,
  }));

  return {
    _id: paper._id,
    testSeriesId: series ? series._id : null,
    testSeriesTitle: displayParentTitle,
    title: paper.title,
    topic: nonPharmaTopic || (paper.questions?.[0]?.topic) || '',
    section: nonPharmaSection || '',
    paperNumber: paper.paperNumber,
    durationMinutes: paper.durationMinutes,
    totalMarks: paper.totalMarks,
    positiveMarks: paper.positiveMarks !== undefined && paper.positiveMarks !== null ? Number(paper.positiveMarks) : 1,
    negativeMarks: paper.negativeMarks !== undefined && paper.negativeMarks !== null ? Number(paper.negativeMarks) : 0.25,
    difficulty: paper.difficulty,
    questions: sanitizedQuestions,
  };
};

export const samplePracticeMCQs = async (subject, limit = 20) => {
  const sampleLimit = Math.min(Math.max(1, parseInt(limit) || 20), 100);

  const pipeline = [
    { $match: { published: true } },
    { $unwind: '$questions' },
  ];

  if (subject && subject !== 'All') {
    const cleanSubject = String(subject).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    pipeline.push({
      $match: { 'questions.subject': { $regex: new RegExp(`^${cleanSubject}$`, 'i') } },
    });
  }

  pipeline.push(
    { $sample: { size: sampleLimit } },
    {
      $project: {
        _id: '$questions._id',
        questionText: '$questions.questionText',
        options: '$questions.options',
        correctOptionIndex: '$questions.correctOptionIndex',
        explanation: '$questions.explanation',
        subject: '$questions.subject',
        topic: '$questions.topic',
        imageUrl: '$questions.imageUrl',
      },
    }
  );

  return await TestPaper.aggregate(pipeline);
};
