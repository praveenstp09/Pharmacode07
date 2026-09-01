import * as adminService from '../services/adminService.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const data = await adminService.fetchAdminStats();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== TEST SERIES CRUD ========================
export const createTestSeries = async (req, res, next) => {
  try {
    const series = await adminService.createSeries(req.body);
    res.status(201).json({ success: true, data: series });
  } catch (error) {
    next(error);
  }
};

export const updateTestSeries = async (req, res, next) => {
  try {
    const series = await adminService.updateSeries(req.params.id, req.body);
    res.json({ success: true, data: series });
  } catch (error) {
    next(error);
  }
};

export const deleteTestSeries = async (req, res, next) => {
  try {
    await adminService.deleteSeries(req.params.id);
    res.json({ success: true, message: 'Test Series and all associated content deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ======================== TEST PAPERS CRUD ========================
export const getAdminPapersForSeries = async (req, res, next) => {
  try {
    const papers = await adminService.getAdminPapersForSeries(req.params.seriesId);
    res.json({ success: true, count: papers.length, data: papers });
  } catch (error) {
    next(error);
  }
};

export const createTestPaper = async (req, res, next) => {
  try {
    const paper = await adminService.createTestPaper(req.body);
    res.status(201).json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
};

export const updateTestPaper = async (req, res, next) => {
  try {
    const paper = await adminService.updateTestPaper(req.params.id, req.body);
    res.json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
};

export const deleteTestPaper = async (req, res, next) => {
  try {
    await adminService.deleteTestPaper(req.params.id);
    res.json({ success: true, message: 'Test Paper deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const bulkAddQuestionsToPaper = async (req, res, next) => {
  try {
    const result = await adminService.bulkAddQuestionsToPaper(req.params.id, req.body.questions);
    res.json({
      success: true,
      message: `Successfully imported questions into ${result.paperTitle}!`,
      totalQuestions: result.totalQuestions,
    });
  } catch (error) {
    next(error);
  }
};

// ======================== STUDY MATERIALS CRUD ========================
export const createMaterial = async (req, res, next) => {
  try {
    const material = await adminService.createMaterial(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    next(error);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const material = await adminService.updateMaterial(req.params.id, req.body);
    res.json({ success: true, data: material });
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    await adminService.deleteMaterial(req.params.id);
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ======================== COUPONS CRUD ========================
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await adminService.getCoupons();
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await adminService.createCoupon(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await adminService.deleteCoupon(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

// ======================== ORDERS & STUDENTS ========================
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getAllOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getAllStudents = async (req, res, next) => {
  try {
    const students = await adminService.getAllStudents(req.query.search);
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// ======================== NOTIFICATIONS & CONTACTS ========================
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await adminService.getNotifications();
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notification = await adminService.createNotification(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await adminService.deleteNotification(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await adminService.getContacts();
    res.json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
};

export const toggleContactResolved = async (req, res, next) => {
  try {
    const contact = await adminService.toggleContactResolved(req.params.id);
    res.json({
      success: true,
      message: `Inquiry marked as ${contact.isResolved ? 'Resolved' : 'Pending'}`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    await adminService.deleteContact(req.params.id);
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ======================== TEST SERIES FOLDER ITEMS ========================
export const getFolderItemsForSeries = async (req, res, next) => {
  try {
    const items = await adminService.getFolderItemsForSeries(req.params.seriesId);
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const addFolderItemToSeries = async (req, res, next) => {
  try {
    const item = await adminService.addFolderItemToSeries(req.params.seriesId, req.body);
    res.status(201).json({
      success: true,
      message: 'Item added to folder successfully!',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFolderItem = async (req, res, next) => {
  try {
    const item = await adminService.updateFolderItem(req.params.id, req.body);
    res.json({ success: true, message: 'Folder item updated', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteFolderItem = async (req, res, next) => {
  try {
    await adminService.deleteFolderItem(req.params.id);
    res.json({ success: true, message: 'Item deleted from folder' });
  } catch (error) {
    next(error);
  }
};

// ======================== FILE UPLOADS (CLOUDINARY / LOCAL) ========================
export const uploadFileEndpoint = async (req, res, next) => {
  try {
    const uploadResult = await adminService.processFileUpload(req.file, req.body.folder);
    res.json({
      success: true,
      message: 'File uploaded successfully!',
      data: uploadResult,
    });
  } catch (error) {
    next(error);
  }
};
