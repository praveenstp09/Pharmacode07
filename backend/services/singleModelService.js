import SingleModelPaper from '../models/SingleModelPaper.js';
import TestPaper from '../models/TestPaper.js';
import TestAttempt from '../models/TestAttempt.js';
import Purchase from '../models/Purchase.js';
import AppError from '../utils/AppError.js';
import { paginateArray } from '../utils/paginate.js';

export const listSingleModelPapers = async (queryParams) => {
  const { examType, isFree, search } = queryParams;
  const query = { published: true };

  if (examType && examType !== 'All') query.examType = examType;
  if (isFree !== undefined) query.isFree = isFree === 'true';
  if (search) {
    const cleanSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.title = { $regex: cleanSearch, $options: 'i' };
  }

  const papers = await SingleModelPaper.find(query)
    .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty')
    .sort({ createdAt: -1 });

  const sanitized = papers.map(p => {
    const obj = p.toObject();
    if (!obj.isFree) {
      obj.pdfUrl = '';
    }
    return obj;
  });

  return paginateArray(sanitized, queryParams);
};

export const fetchSingleModelBySlug = async (slug, currentUser) => {
  const paper = await SingleModelPaper.findOne({ slug, published: true })
    .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty');

  if (!paper) {
    throw new AppError('Model Paper not found', 404);
  }

  let isUnlocked = paper.isFree;
  if (currentUser) {
    if (currentUser.role === 'admin') {
      isUnlocked = true;
    } else {
      const purchase = await Purchase.findOne({
        userId: currentUser._id,
        itemType: 'SingleModelPaper',
        itemId: paper._id,
        expiresAt: { $gt: new Date() },
        isActive: true,
      });
      if (purchase) isUnlocked = true;
    }
  }

  const paperData = paper.toObject();
  if (!isUnlocked) {
    paperData.pdfUrl = '';
  }

  return {
    data: paperData,
    isUnlocked,
  };
};

export const createModelPaper = async (data) => {
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
  } = data;

  if (!title) {
    throw new AppError('Title is required', 400);
  }

  const slug =
    data.slug ||
    String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now();

  let testPaperId = null;

  if (hasCBT && Array.isArray(questions) && questions.length > 0) {
    const pos = positiveMarks !== undefined && positiveMarks !== '' ? Number(positiveMarks) : 1;
    const neg = negativeMarks !== undefined && negativeMarks !== '' ? Number(negativeMarks) : 0.25;
    const dur = Number(durationMinutes) || 100;
    const testPaper = await TestPaper.create({
      title,
      durationMinutes: dur,
      totalMarks: totalMarks || (questions.length * pos),
      positiveMarks: pos,
      negativeMarks: neg,
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

  if (testPaperId) {
    await TestPaper.findByIdAndUpdate(testPaperId, { parentId: modelPaper._id });
  }

  return modelPaper;
};

export const updateModelPaper = async (id, updates) => {
  const paper = await SingleModelPaper.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!paper) {
    throw new AppError('Model Paper not found', 404);
  }
  return paper;
};

export const deleteModelPaper = async (id) => {
  const paper = await SingleModelPaper.findById(id);
  if (!paper) {
    throw new AppError('Model Paper not found', 404);
  }
  if (paper.testPaperId) {
    await TestPaper.findByIdAndDelete(paper.testPaperId);
    await TestAttempt.deleteMany({ testPaperId: paper.testPaperId });
  }
  await Purchase.deleteMany({ itemType: 'SingleModelPaper', itemId: paper._id });
  await paper.deleteOne();
};
