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
  bulkAddQuestionsToPaper,
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
  toggleContactResolved,
  deleteContact,
  addFolderItemToSeries,
  updateFolderItem,
  deleteFolderItem,
  uploadFileEndpoint,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

// Stats
router.get('/stats', getAdminStats);

// Test Series CRUD
router.post('/test-series', createTestSeries);
router.put('/test-series/:id', updateTestSeries);
router.delete('/test-series/:id', deleteTestSeries);

// Test Series 4-Folder Items
router.post('/test-series/:seriesId/folders', addFolderItemToSeries);
router.put('/folders/:id', updateFolderItem);
router.delete('/folders/:id', deleteFolderItem);

// Direct File Upload (PDFs / Images via Cloudinary or Local)
router.post('/upload', upload.single('file'), uploadFileEndpoint);

// Test Papers CRUD
router.get('/test-series/:seriesId/papers', getAdminPapersForSeries);
router.post('/test-papers', createTestPaper);
router.put('/test-papers/:id', updateTestPaper);
router.delete('/test-papers/:id', deleteTestPaper);
router.post('/test-papers/:id/bulk-questions', bulkAddQuestionsToPaper);

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

// Student Inquiries & Queries
router.get('/contacts', getContacts);
router.put('/contacts/:id/resolve', toggleContactResolved);
router.patch('/contacts/:id/resolve', toggleContactResolved);
router.put('/contacts/:id', toggleContactResolved);
router.patch('/contacts/:id', toggleContactResolved);
router.delete('/contacts/:id', deleteContact);

export default router;
