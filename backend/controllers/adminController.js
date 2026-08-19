import User from '../models/User.js';
import TestSeries from '../models/TestSeries.js';
import TestPaper from '../models/TestPaper.js';
import TestAttempt from '../models/TestAttempt.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Notification from '../models/Notification.js';
import Contact from '../models/Contact.js';

// @desc    Get Admin dashboard analytics & stats
// @route   GET /api/admin/stats
// @access  Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSeries = await TestSeries.countDocuments();
    const totalPapers = await TestPaper.countDocuments();
    const totalAttempts = await TestAttempt.countDocuments();
    const totalOrders = await Order.countDocuments({ paymentStatus: 'completed' });
    
    // Calculate total revenue
    const completedOrders = await Order.find({ paymentStatus: 'completed' });
    const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 test attempts
    const recentAttempts = await TestAttempt.find()
      .populate('userId', 'name email')
      .populate('testSeriesId', 'title')
      .populate('testPaperId', 'title')
      .sort({ completedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalSeries,
        totalPapers,
        totalAttempts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue),
        recentOrders,
        recentAttempts,
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
    
    // Also delete associated test papers
    await TestPaper.deleteMany({ testSeriesId: series._id });
    await series.deleteOne();

    res.json({ success: true, message: 'Test Series and associated papers deleted' });
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
    await paper.deleteOne();

    // Update counts
    const papers = await TestPaper.find({ testSeriesId: seriesId });
    const totalQ = papers.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
    await TestSeries.findByIdAndUpdate(seriesId, {
      totalTests: papers.length,
      totalQuestions: totalQ,
    });

    res.json({ success: true, message: 'Test Paper deleted successfully' });
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
    const coupon = await Coupon.create(req.body);
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
