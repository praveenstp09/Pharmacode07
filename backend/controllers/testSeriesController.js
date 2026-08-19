import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import User from '../models/User.js';

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

// @desc    Get single test series by slug with its test papers summary
// @route   GET /api/test-series/:slug
// @access  Public
export const getTestSeriesBySlug = async (req, res) => {
  try {
    const series = await TestSeries.findOne({ slug: req.params.slug, published: true });
    if (!series) {
      return res.status(404).json({ success: false, message: 'Test Series not found' });
    }

    // Get list of test papers belonging to this series (without questions)
    const papers = await TestPaper.find({ testSeriesId: series._id, published: true })
      .select('title paperNumber durationMinutes totalMarks positiveMarks negativeMarks difficulty questions')
      .sort({ paperNumber: 1 });

    // Sanitize paper list: include question count instead of full question details
    const papersSummary = papers.map(p => ({
      _id: p._id,
      title: p.title,
      paperNumber: p.paperNumber,
      durationMinutes: p.durationMinutes,
      totalMarks: p.totalMarks,
      positiveMarks: p.positiveMarks,
      negativeMarks: p.negativeMarks,
      difficulty: p.difficulty,
      questionsCount: p.questions ? p.questions.length : 0,
    }));

    res.json({
      success: true,
      data: {
        series,
        papers: papersSummary,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single test paper for attempt (Protected: Checks purchase or free)
// @route   GET /api/test-series/paper/:paperId
// @access  Private
export const getTestPaperForAttempt = async (req, res) => {
  try {
    const paper = await TestPaper.findById(req.params.paperId).populate('testSeriesId');
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Test Paper not found' });
    }

    const series = paper.testSeriesId;
    const user = await User.findById(req.user.id);

    // Verify access
    const isPurchased = user.purchasedTests.some(
      id => id.toString() === series._id.toString()
    );
    const isAdmin = user.role === 'admin';
    const isFree = series.isFree;

    if (!isPurchased && !isAdmin && !isFree) {
      return res.status(403).json({
        success: false,
        message: 'You have not purchased this test series. Please purchase to unlock.',
        isLocked: true,
      });
    }

    // Return paper with questions, but HIDE correctOptionIndex and explanation during active attempt!
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
        testSeriesId: series._id,
        testSeriesTitle: series.title,
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

    let matchQuery = { published: true };
    const papers = await TestPaper.find(matchQuery);

    let allQuestions = [];
    papers.forEach(p => {
      p.questions.forEach(q => {
        if (!subject || subject === 'All' || q.subject.toLowerCase() === subject.toLowerCase()) {
          allQuestions.push({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation,
            subject: q.subject,
            topic: q.topic,
          });
        }
      });
    });

    // Shuffle
    allQuestions.sort(() => 0.5 - Math.random());
    const selected = allQuestions.slice(0, parseInt(limit));

    res.json({
      success: true,
      count: selected.length,
      data: selected,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
