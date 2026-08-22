import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import FolderItem from '../models/FolderItem.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';

// @desc    Get all published test series
// @route   GET /api/test-series
// @access  Public
export const getTestSeries = async (req, res) => {
  try {
    const { category, examType, search, sort } = req.query;
    let query = { published: true };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (examType && examType !== 'All') {
      query.examType = examType;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { discountPrice: 1 };
    if (sort === 'price-high') sortOption = { discountPrice: -1 };
    if (sort === 'rating') sortOption = { totalQuestions: -1 };

    const series = await TestSeries.find(query).sort(sortOption);

    res.json({
      success: true,
      count: series.length,
      data: series,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single test series by slug with 4-Folder items breakdown & Demo / Lock state
// @route   GET /api/test-series/:slug
// @access  Public (Optionally authenticated)
export const getTestSeriesBySlug = async (req, res) => {
  try {
    const series = await TestSeries.findOne({ slug: req.params.slug, published: true });
    if (!series) {
      return res.status(404).json({ success: false, message: 'Test Series not found' });
    }

    // Check if current user has active purchased access or is admin
    let isFullUnlocked = series.isFree;
    if (req.user) {
      if (req.user.role === 'admin') {
        isFullUnlocked = true;
      } else {
        const hasDirectPurchase = req.user.purchasedTests?.some(
          id => id.toString() === series._id.toString()
        );
        const purchaseRecord = await Purchase.findOne({
          userId: req.user._id,
          itemType: 'TestSeries',
          itemId: series._id,
          expiresAt: { $gt: new Date() },
          isActive: true,
        });

        if (hasDirectPurchase || purchaseRecord) {
          isFullUnlocked = true;
        }
      }
    }

    // Fetch all items inside the 4 folders
    const folderItems = await FolderItem.find({ testSeriesId: series._id, published: true })
      .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty')
      .sort({ sortOrder: 1, createdAt: 1 });

    // Group items into the 4 structured folders
    const folders = {
      cbtMixed: [],
      pyqs: [],
      mcqPdfs: [],
      subjectWise: {}, // { "Pharmacology": [ ...items ] }
    };

    folderItems.forEach(item => {
      const isItemUnlocked = isFullUnlocked || item.isFreeDemo;
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
        pdfUrl: isItemUnlocked ? item.pdfUrl : '', // Hide PDF URL if locked
      };

      if (item.folderType === 'cbt_mixed') {
        folders.cbtMixed.push(formattedItem);
      } else if (item.folderType === 'pyq') {
        folders.pyqs.push(formattedItem);
      } else if (item.folderType === 'mcq_pdf') {
        folders.mcqPdfs.push(formattedItem);
      } else if (item.folderType === 'subject_wise') {
        const sub = item.subjectName || 'General';
        if (!folders.subjectWise[sub]) folders.subjectWise[sub] = [];
        folders.subjectWise[sub].push(formattedItem);
      }
    });

    // Also get standard test papers if any existed in legacy format
    const legacyPapers = await TestPaper.find({ testSeriesId: series._id, published: true })
      .select('title paperNumber durationMinutes totalMarks positiveMarks negativeMarks difficulty questions')
      .sort({ paperNumber: 1 });

    res.json({
      success: true,
      data: {
        series,
        isUnlocked: isFullUnlocked,
        folders,
        stats: {
          cbtMixedCount: folders.cbtMixed.length,
          pyqsCount: folders.pyqs.length,
          mcqPdfsCount: folders.mcqPdfs.length,
          subjectCount: Object.keys(folders.subjectWise).length,
          totalFolderItems: folderItems.length,
        },
        legacyPapers: legacyPapers.map((p, idx) => ({
          _id: p._id,
          title: p.title,
          paperNumber: p.paperNumber,
          durationMinutes: p.durationMinutes,
          totalMarks: p.totalMarks,
          isFreeDemo: idx === 0, // 1st paper is free demo
          isLocked: !isFullUnlocked && idx !== 0,
          questionsCount: p.questions ? p.questions.length : 0,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single test paper for attempt (Checks purchase, admin, or free demo)
// @route   GET /api/test-series/paper/:paperId
// @access  Private (or authenticated guest)
export const getTestPaperForAttempt = async (req, res) => {
  try {
    const paper = await TestPaper.findById(req.params.paperId).populate('testSeriesId');
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Test Paper not found' });
    }

    const series = paper.testSeriesId;
    const user = await User.findById(req.user.id);
    const isAdmin = user.role === 'admin';

    // Check if this paper is attached to a FolderItem with isFreeDemo
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

    // Check if it's a single model paper or non-pharma paper
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
      hasAccess = true; // Non-pharma free quizzes
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'This test paper is locked. Please purchase the full test series package to unlock all tests.',
        isLocked: true,
      });
    }

    // Return paper questions (HIDE correctOptionIndex & explanation during attempt)
    const sanitizedQuestions = paper.questions.map((q, idx) => ({
      _id: q._id,
      index: idx,
      questionText: q.questionText,
      options: q.options,
      subject: q.subject,
      topic: q.topic,
      imageUrl: q.imageUrl,
    }));

    res.json({
      success: true,
      data: {
        _id: paper._id,
        testSeriesId: series ? series._id : null,
        testSeriesTitle: series ? series.title : paper.title,
        title: paper.title,
        paperNumber: paper.paperNumber,
        durationMinutes: paper.durationMinutes,
        totalMarks: paper.totalMarks,
        positiveMarks: paper.positiveMarks,
        negativeMarks: paper.negativeMarks,
        difficulty: paper.difficulty,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get free practice MCQs (Subject-wise)
// @route   GET /api/test-series/practice/mcqs
// @access  Public
export const getPracticeMCQs = async (req, res) => {
  try {
    const { subject, limit = 20 } = req.query;
    const sampleLimit = Math.min(Math.max(1, parseInt(limit) || 20), 100);

    const pipeline = [
      { $match: { published: true } },
      { $unwind: '$questions' },
    ];

    if (subject && subject !== 'All') {
      pipeline.push({
        $match: { 'questions.subject': { $regex: new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
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

    const selected = await TestPaper.aggregate(pipeline);

    res.json({
      success: true,
      count: selected.length,
      data: selected,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
