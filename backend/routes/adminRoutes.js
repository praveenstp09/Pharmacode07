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
  getFolderItemsForSeries,
  updateFolderItem,
  deleteFolderItem,
  uploadFileEndpoint,
  getAdminTestSeries,
  getAdminSingleModels,
  getAdminNonPharma,
} from '../controllers/adminController.js';
import {
  adminGetAllPacks,
  adminCreatePack,
  adminUpdatePack,
  adminDeletePack,
  adminGetPackItems,
  adminAddItemToPack,
  adminUpdateItem,
  adminDeleteItem,
} from '../controllers/studyPackController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

// Stats
router.get('/stats', getAdminStats);

// Full Admin Catalog Listings (includes draft & unpublished items)
router.get('/test-series', getAdminTestSeries);
router.get('/single-models', getAdminSingleModels);
router.get('/non-pharma', getAdminNonPharma);

// Test Series CRUD
router.post('/test-series', createTestSeries);
router.put('/test-series/:id', updateTestSeries);
router.delete('/test-series/:id', deleteTestSeries);

// Test Series Folder Items
router.get('/test-series/:seriesId/folders', getFolderItemsForSeries);
router.post('/test-series/:seriesId/folders', addFolderItemToSeries);
router.put('/folders/:id', updateFolderItem); // ORPHANED: Reserved for direct folder item inline updating
router.delete('/folders/:id', deleteFolderItem);

// Direct File Upload (PDFs / Images via Cloudinary or Local)
router.post('/upload', upload.single('file'), uploadFileEndpoint);

// Test Papers CRUD (ORPHANED: Superseded by folder items architecture & bulk question parser)
router.get('/test-series/:seriesId/papers', getAdminPapersForSeries);
router.post('/test-papers', createTestPaper);
router.put('/test-papers/:id', updateTestPaper);
router.delete('/test-papers/:id', deleteTestPaper);
router.post('/test-papers/:id/bulk-questions', bulkAddQuestionsToPaper);

// Study Materials CRUD
router.post('/materials', createMaterial);
router.put('/materials/:id', updateMaterial);
router.delete('/materials/:id', deleteMaterial);

// Study Material Packages CRUD
router.get('/study-packs', adminGetAllPacks);
router.post('/study-packs', adminCreatePack);
router.put('/study-packs/:id', adminUpdatePack);
router.delete('/study-packs/:id', adminDeletePack);
router.get('/study-packs/:packId/items', adminGetPackItems);
router.post('/study-packs/:packId/items', adminAddItemToPack);
router.put('/study-pack-items/:id', adminUpdateItem); // ORPHANED: Reserved for study pack item inline updating
router.delete('/study-pack-items/:id', adminDeleteItem);

// Coupons CRUD
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Orders & Students
router.get('/orders', getAllOrders);
router.get('/students', getAllStudents);

// Notifications (ORPHANED: Reserved for future global banner notifications)
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
