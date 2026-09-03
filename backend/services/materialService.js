import StudyMaterial from '../models/StudyMaterial.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { paginateArray } from '../utils/paginate.js';

export const listMaterials = async (queryParams, currentUser) => {
  const { courseType, semesterOrYear, subject, materialType, category, examType, isPaid, search } = queryParams;
  let query = { published: true };

  if (courseType && courseType !== 'All') query.courseType = courseType;
  if (semesterOrYear && semesterOrYear !== 'All') query.semesterOrYear = semesterOrYear;
  if (subject && subject !== 'All') query.subject = subject;
  if (materialType && materialType !== 'All') query.materialType = materialType;
  if (category && category !== 'All') query.category = category;
  if (examType && examType !== 'All') query.examType = examType;
  if (isPaid !== undefined && isPaid !== '') query.isPaid = isPaid === 'true';
  if (search) {
    const cleanSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.title = { $regex: cleanSearch, $options: 'i' };
  }

  const materials = await StudyMaterial.find(query).sort({ year: -1, createdAt: -1 });

  let userPurchasedIds = [];
  let isAdmin = false;

  if (currentUser) {
    const user = await User.findById(currentUser.id || currentUser._id);
    if (user) {
      isAdmin = user.role === 'admin';
      userPurchasedIds = (user.purchasedMaterials || []).map(p => (p?._id || p).toString());
    }
  }

  // Preserve fileUrl for free materials, admin, or purchased materials
  const sanitized = materials.map(m => {
    const obj = m.toObject();
    const isUnlocked = !obj.isPaid || isAdmin || userPurchasedIds.includes(obj._id.toString());
    if (!isUnlocked) {
      obj.fileUrl = '';
    }
    return obj;
  });

  return paginateArray(sanitized, queryParams);
};

export const fetchMaterialById = async (id, currentUser) => {
  const material = await StudyMaterial.findById(id);
  if (!material) {
    throw new AppError('Study material not found', 404);
  }

  let isUnlocked = !material.isPaid;

  if (material.isPaid && currentUser) {
    const user = await User.findById(currentUser.id);
    if (user) {
      const isPurchased = user.purchasedMaterials?.some(
        pId => pId.toString() === material._id.toString()
      );
      const isAdmin = user.role === 'admin';
      isUnlocked = isPurchased || isAdmin;
    }
  }

  const materialData = material.toObject();
  if (!isUnlocked) {
    materialData.fileUrl = '';
  }

  return {
    data: materialData,
    isUnlocked,
  };
};

export const incrementDownloadCount = async (id) => {
  const material = await StudyMaterial.findByIdAndUpdate(
    id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );
  if (!material) {
    throw new AppError('Material not found', 404);
  }
  return material.downloadCount;
};
