import StudyPack from '../models/StudyPack.js';
import StudyPackItem from '../models/StudyPackItem.js';
import Purchase from '../models/Purchase.js';
import AppError from '../utils/AppError.js';

const validatePricing = (data) => {
  const isFree = Boolean(data.isFree);
  if (!isFree) {
    const price = Number(data.price || 0);
    const discountPrice = data.discountPrice !== undefined && data.discountPrice !== null ? Number(data.discountPrice) : price;
    if (discountPrice > price) {
      throw new AppError(`Selling price (₹${discountPrice}) cannot be greater than MRP regular price (₹${price})`, 400);
    }
  }
};

export const listStudyPacks = async ({ courseType, search, page = 1, limit = 12 } = {}) => {
  const query = { published: true };

  if (courseType && courseType !== 'All') {
    query.courseType = courseType;
  }

  if (search && search.trim()) {
    const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
      { scopeLabel: { $regex: cleanSearch, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const skip = (pageNum - 1) * limitNum;

  const [packs, total] = await Promise.all([
    StudyPack.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    StudyPack.countDocuments(query),
  ]);

  return {
    packs,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

export const getStudyPackBySlug = async (slug, currentUser = null) => {
  const pack = await StudyPack.findOne({ slug, published: true });
  if (!pack) {
    throw new AppError('Study Material Package not found', 404);
  }

  const items = await StudyPackItem.find({ packId: pack._id, published: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const isAdmin = currentUser && currentUser.role === 'admin';
  const isPurchased = Boolean(
    currentUser &&
    Array.isArray(currentUser.purchasedStudyPacks) &&
    currentUser.purchasedStudyPacks.some((id) => id.toString() === pack._id.toString())
  );

  const isUnlocked = pack.isFree || isPurchased || isAdmin;

  const sanitizedItems = items.map((item) => {
    if (!isUnlocked && !item.isFreeDemo) {
      return { ...item, pdfUrl: '' };
    }
    return item;
  });

  return {
    pack,
    items: sanitizedItems,
    isUnlocked,
    isPurchased,
  };
};

// Admin: Get all packages (including unpublished)
export const getAllAdminPacks = async () => {
  return await StudyPack.find().sort({ createdAt: -1 }).lean();
};

export const createStudyPack = async (data) => {
  validatePricing(data);

  const slug =
    data.slug ||
    String(data.title || 'study-material-pack')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now();

  const pack = await StudyPack.create({
    ...data,
    slug,
  });

  return pack;
};

export const updateStudyPack = async (id, data) => {
  validatePricing(data);

  const pack = await StudyPack.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!pack) {
    throw new AppError('Study Material Package not found', 404);
  }

  return pack;
};

export const deleteStudyPack = async (id) => {
  const pack = await StudyPack.findById(id);
  if (!pack) {
    throw new AppError('Study Material Package not found', 404);
  }

  await StudyPackItem.deleteMany({ packId: pack._id });
  await Purchase.deleteMany({ itemType: 'StudyPack', itemId: pack._id });
  await pack.deleteOne();

  return { message: 'Package and all associated items deleted successfully' };
};

export const getItemsForPack = async (packId) => {
  return await StudyPackItem.find({ packId }).sort({ sortOrder: 1, createdAt: 1 }).lean();
};

export const addItemToPack = async (packId, data) => {
  const pack = await StudyPack.findById(packId);
  if (!pack) {
    throw new AppError('Parent Study Material Package not found', 404);
  }

  const isQuick = pack.courseType === 'QuickRevision' || (pack.title && pack.title.toLowerCase().includes('quick'));
  const folderName = (data.folderName || data.subjectName || 'General').trim();
  const subjectName = (data.subjectName || (isQuick ? folderName : '')).trim();

  const item = await StudyPackItem.create({
    ...data,
    folderName,
    subjectName,
    packId,
  });

  const totalPdfs = await StudyPackItem.countDocuments({ packId });
  await StudyPack.findByIdAndUpdate(packId, { totalPdfs });

  return item;
};

export const updateStudyPackItem = async (id, data) => {
  let updatePayload = { ...data };
  if (updatePayload.folderName && !updatePayload.subjectName) {
    updatePayload.subjectName = updatePayload.folderName.trim();
  }

  const item = await StudyPackItem.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new AppError('Study Material Item not found', 404);
  }

  return item;
};

export const deleteStudyPackItem = async (id) => {
  const item = await StudyPackItem.findById(id);
  if (!item) {
    throw new AppError('Study Material Item not found', 404);
  }

  const packId = item.packId;
  await item.deleteOne();

  const totalPdfs = await StudyPackItem.countDocuments({ packId });
  await StudyPack.findByIdAndUpdate(packId, { totalPdfs });

  return { message: 'Item deleted successfully' };
};
