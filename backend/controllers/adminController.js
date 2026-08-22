import User from '../models/User.js';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import TestAttempt from '../models/TestAttempt.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Notification from '../models/Notification.js';
import Contact from '../models/Contact.js';
import FolderItem from '../models/FolderItem.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';
import { uploadToCloudinaryOrLocal } from '../utils/upload.js';

// Helper: build array of last N days {date, count}
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

// @desc    Get Admin dashboard analytics & stats (Rich)
// @route   GET /api/admin/stats
// @access  Admin
export const getAdminStats = async (req, res) => {
  try {
    // ── Core Counts ──
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalSeries = await TestSeries.countDocuments();
    const totalPapers = await TestPaper.countDocuments();
    const totalAttempts = await TestAttempt.countDocuments();
    const totalFolderItems = await FolderItem.countDocuments();
    const totalStudyMaterials = await StudyMaterial.countDocuments();
    const totalSingleModels = await SingleModelPaper.countDocuments();
    const totalNonPharma = await NonPharmaResource.countDocuments();
    const totalCoupons = await Coupon.countDocuments();
    const totalOrders = await Order.countDocuments({ paymentStatus: 'completed' });

    // ── Revenue ──
    const completedOrders = await Order.find({ paymentStatus: 'completed' });
    const totalRevenue = completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    // ── 7-Day Trends ──
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.find({ role: 'student', createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 });
    const recentCompletedOrders = await Order.find({ paymentStatus: 'completed', createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 });
    const recentAttemptsRaw = await TestAttempt.find({ createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: -1 });

    const registrationTrend = buildDailyTrend(recentUsers, 7);
    const revenueTrend = buildRevenueTrend(recentCompletedOrders, 7);
    const attemptsTrend = buildDailyTrend(recentAttemptsRaw, 7);

    // ── Recent 8 Users ──
    const latestUsers = await User.find({ role: 'student' })
      .select('name email mobile createdAt')
      .sort({ createdAt: -1 })
      .limit(8);

    // ── Recent 6 Orders ──
    const recentOrders = await Order.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(6);

    // ── Recent 6 Test Attempts ──
    const recentAttempts = await TestAttempt.find()
      .populate('userId', 'name email')
      .populate('testSeriesId', 'title')
      .populate('testPaperId', 'title')
      .sort({ completedAt: -1 })
      .limit(6);

    // ── Top 5 Test Series (by enrollments) ──
    const allSeries = await TestSeries.find().sort({ enrolledCount: -1 }).limit(5).select('title examType enrolledCount price discountPrice');

    // ── Content Inventory by Pillar ──
    const contentInventory = {
      testSeriesPacks: totalSeries,
      folderItems: totalFolderItems,
      studyMaterials: totalStudyMaterials,
      singleModelPapers: totalSingleModels,
      nonPharmaResources: totalNonPharma,
      totalCBTPapers: totalPapers,
    };

    // ── Study Material Breakdown ──
    const bPharmCount = await StudyMaterial.countDocuments({ courseType: 'B.Pharm' });
    const dPharmCount = await StudyMaterial.countDocuments({ courseType: 'D.Pharm' });
    const examNotesCount = await StudyMaterial.countDocuments({ courseType: 'Exam' });

    res.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== TEST SERIES CRUD ========================
export const createTestSeries = async (req, res) => {
  try {
    const series = await TestSeries.create(req.body);
    res.status(201).json({ success: true, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTestSeries = async (req, res) => {
  try {
    const series = await TestSeries.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!series) return res.status(404).json({ success: false, message: 'Series not found' });
    res.json({ success: true, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestSeries = async (req, res) => {
  try {
    const series = await TestSeries.findById(req.params.id);
    if (!series) return res.status(404).json({ success: false, message: 'Series not found' });
    
    // Also delete associated test papers and folder items
    await TestPaper.deleteMany({ testSeriesId: series._id });
    await FolderItem.deleteMany({ testSeriesId: series._id });
    await series.deleteOne();

    res.json({ success: true, message: 'Test Series, papers, and folder items deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== TEST PAPERS CRUD ========================
export const getAdminPapersForSeries = async (req, res) => {
  try {
    const papers = await TestPaper.find({ testSeriesId: req.params.seriesId }).sort({ paperNumber: 1 });
    res.json({ success: true, count: papers.length, data: papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestPaper = async (req, res) => {
  try {
    const paper = await TestPaper.create(req.body);
    
    // Update totalTests and totalQuestions in parent TestSeries
    const papers = await TestPaper.find({ testSeriesId: paper.testSeriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(paper.testSeriesId, {
      totalTests: papers.length,
      totalQuestions: totalQ,
    });

    res.status(201).json({ success: true, data: paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTestPaper = async (req, res) => {
  try {
    const paper = await TestPaper.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });

    // Update counts in parent TestSeries
    const papers = await TestPaper.find({ testSeriesId: paper.testSeriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(paper.testSeriesId, {
      totalTests: papers.length,
      totalQuestions: totalQ,
    });

    res.json({ success: true, data: paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestPaper = async (req, res) => {
  try {
    const paper = await TestPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });
    
    const seriesId = paper.testSeriesId;
    await FolderItem.updateMany({ testPaperId: paper._id }, { testPaperId: null });
    await SingleModelPaper.updateMany({ testPaperId: paper._id }, { testPaperId: null });
    await NonPharmaResource.updateMany({ testPaperId: paper._id }, { testPaperId: null });

    await paper.deleteOne();

    // Update counts
    if (seriesId) {
      const papers = await TestPaper.find({ testSeriesId: seriesId });
      const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
      await TestSeries.findByIdAndUpdate(seriesId, {
        totalTests: papers.length,
        totalQuestions: totalQ,
      });
    }

    res.json({ success: true, message: 'Test Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkAddQuestionsToPaper = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of questions' });
    }

    const paper = await TestPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: 'Test Paper not found' });

    paper.questions.push(...questions);
    await paper.save();

    // Update totalQuestions in TestSeries
    const papers = await TestPaper.find({ testSeriesId: paper.testSeriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(paper.testSeriesId, {
      totalQuestions: totalQ,
    });

    res.json({
      success: true,
      message: `Successfully imported ${questions.length} questions into ${paper.title}!`,
      totalQuestions: paper.questions.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== STUDY MATERIALS CRUD ========================
export const createMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.create(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    await material.deleteOne();
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== COUPONS CRUD ========================
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, maxDiscount, minOrderValue, expiryDays, expiryDate } = req.body;
    
    if (!code || !discountPercent) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code and discount percentage' });
    }

    const finalExpiry = expiryDate 
      ? new Date(expiryDate) 
      : new Date(Date.now() + (Number(expiryDays) || 30) * 24 * 60 * 60 * 1000);

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      maxDiscount: Number(maxDiscount) || 500,
      minOrderValue: Number(minOrderValue) || 0,
      expiryDate: finalExpiry,
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== ORDERS & STUDENTS ========================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'student' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }
    const students = await User.find(query)
      .populate('purchasedTests', 'title examType')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== NOTIFICATIONS & CONTACTS ========================
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleContactResolved = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Inquiry not found' });

    contact.isResolved = !contact.isResolved;
    contact.isRead = true;
    contact.resolvedAt = contact.isResolved ? new Date() : null;
    await contact.save();

    res.json({
      success: true,
      message: `Inquiry marked as ${contact.isResolved ? 'Resolved' : 'Pending'}`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== TEST SERIES FOLDER ITEMS ========================
export const addFolderItemToSeries = async (req, res) => {
  try {
    const { seriesId } = req.params;
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
      difficulty,
    } = req.body;

    const series = await TestSeries.findById(seriesId);
    if (!series) return res.status(404).json({ success: false, message: 'Series not found' });

    let testPaperId = null;

    if ((contentType === 'cbt' || folderType === 'pyq' || folderType === 'subject_wise') && Array.isArray(questions) && questions.length > 0) {
      const paper = await TestPaper.create({
        testSeriesId: series._id,
        title,
        durationMinutes: durationMinutes || 100,
        totalMarks: totalMarks || questions.length,
        positiveMarks: 1,
        negativeMarks: 0.25,
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

    res.status(201).json({
      success: true,
      message: 'Item added to folder successfully!',
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFolderItem = async (req, res) => {
  try {
    const item = await FolderItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Folder item updated', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFolderItem = async (req, res) => {
  try {
    const item = await FolderItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.testPaperId) {
      await TestPaper.findByIdAndDelete(item.testPaperId);
    }
    await item.deleteOne();

    // Recalculate totals on series
    const allItems = await FolderItem.find({ testSeriesId: item.testSeriesId });
    const cbtCount = allItems.filter(i => i.contentType === 'cbt').length;
    const pdfCount = allItems.filter(i => i.contentType !== 'cbt').length;
    await TestSeries.findByIdAndUpdate(item.testSeriesId, {
      totalTests: cbtCount,
      totalPdfs: pdfCount,
    });

    res.json({ success: true, message: 'Item deleted from folder' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== FILE UPLOADS (CLOUDINARY / LOCAL) ========================
export const uploadFileEndpoint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'pharmacode_docs';
    const uploadResult = await uploadToCloudinaryOrLocal(req.file, folder);

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      data: uploadResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
