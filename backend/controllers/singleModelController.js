import SingleModelPaper from '../models/SingleModelPaper.js';
import TestPaper from '../models/TestPaper.js';
import Purchase from '../models/Purchase.js';

// Get all single model papers (Public)
export const getSingleModelPapers = async (req, res) => {
  try {
    const { examType, isFree, search } = req.query;
    const query = { published: true };

    if (examType && examType !== 'All') query.examType = examType;
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const papers = await SingleModelPaper.find(query)
      .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: papers.length,
      data: papers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single model paper by slug
export const getSingleModelPaperBySlug = async (req, res) => {
  try {
    const paper = await SingleModelPaper.findOne({ slug: req.params.slug, published: true })
      .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty');

    if (!paper) {
      return res.status(404).json({ success: false, message: 'Model Paper not found' });
    }

    let isUnlocked = paper.isFree;
    if (req.user) {
      if (req.user.role === 'admin') {
        isUnlocked = true;
      } else {
        const purchase = await Purchase.findOne({
          userId: req.user._id,
          itemType: 'SingleModelPaper',
          itemId: paper._id,
          expiresAt: { $gt: new Date() },
          isActive: true,
        });
        if (purchase) isUnlocked = true;
      }
    }

    res.json({
      success: true,
      data: paper,
      isUnlocked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create Single Model Paper
export const createSingleModelPaper = async (req, res) => {
  try {
    const {
      title,
      examType,
      hasCBT,
      hasPdf,
      pdfUrl,
      price,
      discountPrice,
      isFree,
      description,
      questions,
      durationMinutes,
      totalMarks,
      positiveMarks,
      negativeMarks,
      difficulty,
    } = req.body;

    const slug =
      req.body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
        '-' +
        Date.now();

    let testPaperId = null;

    // If CBT is enabled and questions provided, create TestPaper
    if (hasCBT && Array.isArray(questions) && questions.length > 0) {
      const testPaper = await TestPaper.create({
        title,
        durationMinutes: durationMinutes || 100,
        totalMarks: totalMarks || questions.length,
        positiveMarks: positiveMarks || 1,
        negativeMarks: negativeMarks || 0.25,
        difficulty: difficulty || 'Medium',
        questions,
        parentType: 'single_model',
      });
      testPaperId = testPaper._id;
    }

    const modelPaper = await SingleModelPaper.create({
      title,
      slug,
      description: description || '',
      examType,
      hasCBT: !!hasCBT,
      testPaperId,
      hasPdf: !!hasPdf,
      pdfUrl: pdfUrl || '',
      totalQuestions: questions ? questions.length : 100,
      durationMinutes: durationMinutes || 100,
      isFree: !!isFree,
      price: price !== undefined ? price : 49,
      discountPrice: discountPrice !== undefined ? discountPrice : 29,
      published: true,
    });

    res.status(201).json({
      success: true,
      message: 'Single Model Paper created successfully!',
      data: modelPaper,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update Single Model Paper
export const updateSingleModelPaper = async (req, res) => {
  try {
    const paper = await SingleModelPaper.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Model Paper not found' });
    }
    res.json({ success: true, message: 'Updated successfully', data: paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Single Model Paper
export const deleteSingleModelPaper = async (req, res) => {
  try {
    const paper = await SingleModelPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Model Paper not found' });
    }
    if (paper.testPaperId) {
      await TestPaper.findByIdAndDelete(paper.testPaperId);
    }
    await paper.deleteOne();
    res.json({ success: true, message: 'Single Model Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
