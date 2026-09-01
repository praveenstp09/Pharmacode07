import NonPharmaResource from '../models/NonPharmaResource.js';
import TestPaper from '../models/TestPaper.js';
import TestAttempt from '../models/TestAttempt.js';
import AppError from '../utils/AppError.js';
import { paginateArray } from '../utils/paginate.js';

export const listNonPharmaResources = async (queryParams) => {
  const { section, contentType, isFree, search } = queryParams;
  const query = { published: true };

  if (section) query.section = section;
  if (contentType) query.contentType = contentType;
  if (isFree !== undefined) query.isFree = isFree === 'true';
  if (search) {
    const cleanSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.title = { $regex: cleanSearch, $options: 'i' };
  }

  const resources = await NonPharmaResource.find(query)
    .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty')
    .sort({ createdAt: -1 });

  return paginateArray(resources, queryParams);
};

export const createResource = async (data) => {
  const {
    title,
    section,
    topic,
    contentType,
    pdfUrl,
    relevanceMonth,
    isFree,
    price,
    questions,
    durationMinutes,
    totalMarks,
    difficulty,
  } = data;

  if (!title || !section || !contentType) {
    throw new AppError('Title, section, and contentType are required', 400);
  }

  let testPaperId = null;

  if (contentType === 'cbt' && Array.isArray(questions) && questions.length > 0) {
    const testPaper = await TestPaper.create({
      title: `${String(section).toUpperCase()} - ${title}`,
      durationMinutes: durationMinutes || 30,
      totalMarks: totalMarks || questions.length,
      positiveMarks: 1,
      negativeMarks: 0.25,
      difficulty: difficulty || 'Medium',
      questions,
      parentType: 'non_pharma',
    });
    testPaperId = testPaper._id;
  }

  const freeFlag = isFree !== undefined ? isFree : true;
  const resource = await NonPharmaResource.create({
    title,
    section,
    topic: topic || '',
    contentType,
    testPaperId,
    pdfUrl: pdfUrl || '',
    totalQuestions: questions ? questions.length : 25,
    durationMinutes: durationMinutes || 30,
    relevanceMonth: relevanceMonth || '',
    isFree: freeFlag,
    isPaid: !freeFlag && (price || 0) > 0,
    price: price || 0,
    published: true,
  });

  if (testPaperId) {
    await TestPaper.findByIdAndUpdate(testPaperId, { parentId: resource._id });
  }

  return resource;
};

export const updateResource = async (id, updates) => {
  const resource = await NonPharmaResource.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  return resource;
};

export const deleteResource = async (id) => {
  const resource = await NonPharmaResource.findById(id);
  if (!resource) {
    throw new AppError('Resource not found', 404);
  }
  if (resource.testPaperId) {
    await TestPaper.findByIdAndDelete(resource.testPaperId);
    await TestAttempt.deleteMany({ testPaperId: resource.testPaperId });
  }
  await resource.deleteOne();
};
