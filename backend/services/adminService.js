import User from '../models/User.js';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import TestAttempt from '../models/TestAttempt.js';
import Order from '../models/Order.js';
import Purchase from '../models/Purchase.js';
import Coupon from '../models/Coupon.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Notification from '../models/Notification.js';
import Contact from '../models/Contact.js';
import FolderItem from '../models/FolderItem.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';
import { uploadToCloudinaryOrLocal } from '../utils/upload.js';
import AppError from '../utils/AppError.js';
import { getCache, setCache, delCache } from '../utils/cache.js';

const ADMIN_STATS_CACHE_KEY = 'admin:stats';

export const invalidateAdminStatsCache = async () => {
  await delCache(ADMIN_STATS_CACHE_KEY);
};

const buildDailyTrend = (docs, days = 7) => {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = docs.filter(d => {
      const created = new Date(d.createdAt);
      return created >= dayStart && created <= dayEnd;
    }).length;

    const label = dayStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    result.push({ label, count });
  }
  return result;
};

const buildRevenueTrend = (orders, days = 7) => {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const revenue = orders
      .filter(o => {
        const created = new Date(o.createdAt);
        return created >= dayStart && created <= dayEnd;
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const label = dayStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    result.push({ label, amount: Math.round(revenue) });
  }
  return result;
};

export const fetchAdminStats = async () => {
  const cached = await getCache(ADMIN_STATS_CACHE_KEY);
  if (cached) return cached;

  const [
    totalStudents,
    totalAdmins,
    totalSeries,
    totalPapers,
    totalAttempts,
    totalFolderItems,
    totalStudyMaterials,
    totalSingleModels,
    totalNonPharma,
    totalCoupons,
    totalOrders,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'admin' }),
    TestSeries.countDocuments(),
    TestPaper.countDocuments(),
    TestAttempt.countDocuments(),
    FolderItem.countDocuments(),
    StudyMaterial.countDocuments(),
    SingleModelPaper.countDocuments(),
    NonPharmaResource.countDocuments(),
    Coupon.countDocuments(),
    Order.countDocuments({ paymentStatus: 'completed' }),
  ]);

  const completedOrders = await Order.find({ paymentStatus: 'completed' });
  const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentUsers, recentCompletedOrders, recentAttemptsRaw, latestUsers, recentOrders, recentAttempts, allSeries, bPharmCount, dPharmCount, examNotesCount] = await Promise.all([
    User.find({ role: 'student', createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 }),
    Order.find({ paymentStatus: 'completed', createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 }),
    TestAttempt.find({ createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 }),
    User.find({ role: 'student' }).select('name email mobile createdAt').sort({ createdAt: -1 }).limit(8),
    Order.find().populate('userId', 'name email mobile').sort({ createdAt: -1 }).limit(6),
    TestAttempt.find().populate('userId', 'name email').populate('testSeriesId', 'title').populate('testPaperId', 'title').sort({ completedAt: -1 }).limit(6),
    TestSeries.find().sort({ enrolledCount: -1 }).limit(5).select('title examType enrolledCount price discountPrice'),
    StudyMaterial.countDocuments({ courseType: 'B.Pharm' }),
    StudyMaterial.countDocuments({ courseType: 'D.Pharm' }),
    StudyMaterial.countDocuments({ courseType: 'Exam' }),
  ]);

  const registrationTrend = buildDailyTrend(recentUsers, 7);
  const revenueTrend = buildRevenueTrend(recentCompletedOrders, 7);
  const attemptsTrend = buildDailyTrend(recentAttemptsRaw, 7);

  const contentInventory = {
    testSeriesPacks: totalSeries,
    folderItems: totalFolderItems,
    studyMaterials: totalStudyMaterials,
    singleModelPapers: totalSingleModels,
    nonPharmaResources: totalNonPharma,
    totalCBTPapers: totalPapers,
  };

  const payload = {
    totalStudents,
    totalAdmins,
    totalSeries,
    totalPapers,
    totalAttempts,
    totalOrders,
    totalRevenue: Math.round(totalRevenue),
    registrationTrend,
    revenueTrend,
    attemptsTrend,
    latestUsers,
    recentOrders,
    recentAttempts,
    topSeries: allSeries,
    contentInventory,
    studyBreakdown: { bPharmCount, dPharmCount, examNotesCount },
    totalCoupons,
  };

  await setCache(ADMIN_STATS_CACHE_KEY, payload, 60);
  return payload;
};

// ======================== TEST SERIES CRUD ========================
export const createSeries = async (data) => {
  const series = await TestSeries.create(data);
  await invalidateAdminStatsCache();
  return series;
};

export const updateSeries = async (id, data) => {
  const series = await TestSeries.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!series) throw new AppError('Series not found', 404);
  await invalidateAdminStatsCache();
  return series;
};

export const deleteSeries = async (id) => {
  const series = await TestSeries.findById(id);
  if (!series) throw new AppError('Series not found', 404);

  await TestPaper.deleteMany({ testSeriesId: series._id });
  await FolderItem.deleteMany({ testSeriesId: series._id });
  await TestAttempt.deleteMany({ testSeriesId: series._id });
  await Purchase.deleteMany({ itemType: 'TestSeries', itemId: series._id });
  await series.deleteOne();
  await invalidateAdminStatsCache();
};

// ======================== TEST PAPERS CRUD ========================
export const getAdminPapersForSeries = async (seriesId) => {
  return await TestPaper.find({ testSeriesId: seriesId }).sort({ paperNumber: 1 });
};

export const createTestPaper = async (data) => {
  const paper = await TestPaper.create(data);

  if (paper.testSeriesId) {
    const papers = await TestPaper.find({ testSeriesId: paper.testSeriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(paper.testSeriesId, {
      totalTests: papers.length,
      totalQuestions: totalQ,
    });
  }

  await invalidateAdminStatsCache();
  return paper;
};

export const updateTestPaper = async (id, data) => {
  const paper = await TestPaper.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!paper) throw new AppError('Paper not found', 404);

  if (paper.testSeriesId) {
    const papers = await TestPaper.find({ testSeriesId: paper.testSeriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(paper.testSeriesId, {
      totalTests: papers.length,
      totalQuestions: totalQ,
    });
  }

  return paper;
};

export const deleteTestPaper = async (id) => {
  const paper = await TestPaper.findById(id);
  if (!paper) throw new AppError('Paper not found', 404);

  const seriesId = paper.testSeriesId;
  await FolderItem.updateMany({ testPaperId: paper._id }, { testPaperId: null });
  await SingleModelPaper.updateMany({ testPaperId: paper._id }, { testPaperId: null });
  await NonPharmaResource.updateMany({ testPaperId: paper._id }, { testPaperId: null });

  await paper.deleteOne();

  if (seriesId) {
    const papers = await TestPaper.find({ testSeriesId: seriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(seriesId, {
      totalTests: papers.length,
      totalQuestions: totalQ,
    });
  }

  await invalidateAdminStatsCache();
};

export const bulkAddQuestionsToPaper = async (id, questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new AppError('Please provide an array of questions', 400);
  }

  const paper = await TestPaper.findById(id);
  if (!paper) throw new AppError('Test Paper not found', 404);

  paper.questions.push(...questions);
  await paper.save();

  if (paper.testSeriesId) {
    const papers = await TestPaper.find({ testSeriesId: paper.testSeriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(paper.testSeriesId, {
      totalQuestions: totalQ,
    });
  }

  return {
    totalQuestions: paper.questions.length,
    paperTitle: paper.title,
  };
};

// ======================== STUDY MATERIALS CRUD ========================
export const createMaterial = async (data) => {
  const material = await StudyMaterial.create(data);
  await invalidateAdminStatsCache();
  return material;
};

export const updateMaterial = async (id, data) => {
  const material = await StudyMaterial.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!material) throw new AppError('Material not found', 404);
  return material;
};

export const deleteMaterial = async (id) => {
  const material = await StudyMaterial.findById(id);
  if (!material) throw new AppError('Material not found', 404);
  await material.deleteOne();
  await invalidateAdminStatsCache();
};

// ======================== COUPONS CRUD ========================
export const getCoupons = async () => {
  return await Coupon.find().sort({ createdAt: -1 });
};

export const createCoupon = async ({ code, discountPercent, maxDiscount, minOrderValue, expiryDays, expiryDate }) => {
  if (!code || !discountPercent) {
    throw new AppError('Please provide coupon code and discount percentage', 400);
  }

  const finalExpiry = expiryDate
    ? new Date(expiryDate)
    : new Date(Date.now() + (Number(expiryDays) || 30) * 24 * 60 * 60 * 1000);

  return await Coupon.create({
    code: code.toUpperCase().trim(),
    discountPercent: Number(discountPercent),
    maxDiscount: Number(maxDiscount) || 500,
    minOrderValue: Number(minOrderValue) || 0,
    expiryDate: finalExpiry,
  });
};

export const deleteCoupon = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  await coupon.deleteOne();
  await invalidateAdminStatsCache();
};

// ======================== ORDERS & STUDENTS ========================
export const getAllOrders = async () => {
  return await Order.find().populate('userId', 'name email mobile').sort({ createdAt: -1 });
};

export const getAllStudents = async (search) => {
  let query = { role: 'student' };
  if (search) {
    const cleanSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: cleanSearch, $options: 'i' } },
      { email: { $regex: cleanSearch, $options: 'i' } },
      { mobile: { $regex: cleanSearch, $options: 'i' } },
    ];
  }
  return await User.find(query)
    .select('-password -resetPasswordToken -resetPasswordExpires -refreshToken -refreshTokenExpires')
    .populate('purchasedTests', 'title examType')
    .sort({ createdAt: -1 });
};

// ======================== NOTIFICATIONS & CONTACTS ========================
export const getNotifications = async () => {
  return await Notification.find().sort({ createdAt: -1 });
};

export const createNotification = async (data) => {
  return await Notification.create(data);
};

export const deleteNotification = async (id) => {
  await Notification.findByIdAndDelete(id);
};

export const getContacts = async () => {
  return await Contact.find().sort({ createdAt: -1 });
};

export const toggleContactResolved = async (id) => {
  const contact = await Contact.findById(id);
  if (!contact) throw new AppError('Inquiry not found', 404);

  contact.isResolved = !contact.isResolved;
  contact.isRead = true;
  contact.resolvedAt = contact.isResolved ? new Date() : null;
  await contact.save();
  return contact;
};

export const deleteContact = async (id) => {
  const contact = await Contact.findByIdAndDelete(id);
  if (!contact) throw new AppError('Inquiry not found', 404);
};

// ======================== TEST SERIES FOLDER ITEMS ========================
export const getFolderItemsForSeries = async (seriesId) => {
  return await FolderItem.find({ testSeriesId: seriesId })
    .populate('testPaperId', 'title durationMinutes totalMarks positiveMarks negativeMarks difficulty questions')
    .sort({ folderType: 1, createdAt: 1 });
};

export const addFolderItemToSeries = async (seriesId, data) => {
  const {
    folderType,
    contentType,
    title,
    subjectName,
    pdfUrl,
    year,
    isFreeDemo,
    questions,
    durationMinutes,
    totalMarks,
    positiveMarks,
    negativeMarks,
    difficulty,
  } = data;

  const series = await TestSeries.findById(seriesId);
  if (!series) throw new AppError('Series not found', 404);

  let testPaperId = null;

  const pos = positiveMarks !== undefined && positiveMarks !== '' ? Number(positiveMarks) : 1;
  const neg = negativeMarks !== undefined && negativeMarks !== '' ? Number(negativeMarks) : 0.25;
  const dur = Number(durationMinutes) || 100;

  if ((contentType === 'cbt' || folderType === 'pyq' || folderType === 'subject_wise') && Array.isArray(questions) && questions.length > 0) {
    const paper = await TestPaper.create({
      testSeriesId: series._id,
      title,
      durationMinutes: dur,
      totalMarks: totalMarks || (questions.length * pos),
      positiveMarks: pos,
      negativeMarks: neg,
      difficulty: difficulty || 'Medium',
      questions,
      parentType: 'folder_item',
    });
    testPaperId = paper._id;
  }

  const item = await FolderItem.create({
    testSeriesId: series._id,
    folderType,
    contentType: folderType === 'subject_wise' ? 'cbt' : contentType,
    title,
    subjectName: subjectName || '',
    testPaperId,
    pdfUrl: pdfUrl || '',
    year: year || 2026,
    totalQuestions: questions && questions.length > 0 ? questions.length : 100,
    durationMinutes: durationMinutes || 100,
    isFreeDemo: !!isFreeDemo,
    published: true,
  });

  if (testPaperId) {
    await TestPaper.findByIdAndUpdate(testPaperId, { parentId: item._id });
  }

  // Recalculate totals on series
  const allItems = await FolderItem.find({ testSeriesId: series._id });
  const cbtCount = allItems.filter(i => i.contentType === 'cbt' || i.testPaperId).length;
  const pdfCount = allItems.filter(i => i.pdfUrl).length;
  series.totalTests = cbtCount;
  series.totalPdfs = pdfCount;
  await series.save();

  await invalidateAdminStatsCache();
  return item;
};

export const updateFolderItem = async (id, data) => {
  const item = await FolderItem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!item) throw new AppError('Item not found', 404);
  return item;
};

export const deleteFolderItem = async (id) => {
  const item = await FolderItem.findById(id);
  if (!item) throw new AppError('Item not found', 404);

  if (item.testPaperId) {
    await TestPaper.findByIdAndDelete(item.testPaperId);
  }
  await item.deleteOne();

  const allItems = await FolderItem.find({ testSeriesId: item.testSeriesId });
  const cbtCount = allItems.filter(i => i.contentType === 'cbt').length;
  const pdfCount = allItems.filter(i => i.contentType !== 'cbt').length;
  await TestSeries.findByIdAndUpdate(item.testSeriesId, {
    totalTests: cbtCount,
    totalPdfs: pdfCount,
  });

  await invalidateAdminStatsCache();
};

export const processFileUpload = async (file, folderName) => {
  if (!file) {
    throw new AppError('No file uploaded', 400);
  }
  const folder = folderName ? String(folderName).replace(/[^a-zA-Z0-9_-]/g, '') : 'pharmacode_docs';
  return await uploadToCloudinaryOrLocal(file, folder);
};
