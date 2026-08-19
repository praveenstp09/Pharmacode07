import express from 'express';
import {
  getAdminStats,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
  getAdminPapersForSeries,
  createTestPaper,
  updateTestPaper,
  deleteTestPaper,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getAllOrders,
  getAllStudents,
  getNotifications,
  createNotification,
  deleteNotification,
  getContacts,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

// Stats
router.get('/stats', getAdminStats);

// Test Series CRUD
router.post('/test-series', createTestSeries);
router.put('/test-series/:id', updateTestSeries);
router.delete('/test-series/:id', deleteTestSeries);

// Test Papers CRUD
router.get('/test-series/:seriesId/papers', getAdminPapersForSeries);
router.post('/test-papers', createTestPaper);
router.put('/test-papers/:id', updateTestPaper);
router.delete('/test-papers/:id', deleteTestPaper);

// Study Materials CRUD
router.post('/materials', createMaterial);
router.put('/materials/:id', updateMaterial);
router.delete('/materials/:id', deleteMaterial);

// Coupons CRUD
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Orders & Students
router.get('/orders', getAllOrders);
router.get('/students', getAllStudents);

// Notifications & Contacts
router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', deleteNotification);
router.get('/contacts', getContacts);

export default router;
