import StudyMaterial from '../models/StudyMaterial.js';
import User from '../models/User.js';

// @desc    Get all study materials / notes with B.Pharm, D.Pharm & Exam taxonomy filters
// @route   GET /api/materials
// @access  Public
export const getMaterials = async (req, res) => {
  try {
    const { courseType, semesterOrYear, subject, materialType, category, examType, isPaid, search } =
      req.query;
    let query = { published: true };

    if (courseType && courseType !== 'All') query.courseType = courseType;
    if (semesterOrYear && semesterOrYear !== 'All') query.semesterOrYear = semesterOrYear;
    if (subject && subject !== 'All') query.subject = subject;
    if (materialType && materialType !== 'All') query.materialType = materialType;
    if (category && category !== 'All') query.category = category;
    if (examType && examType !== 'All') query.examType = examType;
    if (isPaid !== undefined && isPaid !== '') query.isPaid = isPaid === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const materials = await StudyMaterial.find(query).sort({ year: -1, createdAt: -1 });

    // Sanitize: strip fileUrl for paid materials in public list
    const sanitizedMaterials = materials.map(m => {
      const obj = m.toObject();
      if (obj.isPaid) {
        obj.fileUrl = '';
      }
      return obj;
    });

    res.json({
      success: true,
      count: sanitizedMaterials.length,
      data: sanitizedMaterials,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single study material & check access
// @route   GET /api/materials/:id
// @access  Public/Private
export const getMaterialById = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    let isUnlocked = !material.isPaid;

    if (material.isPaid && req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        const isPurchased = user.purchasedMaterials?.some(
          id => id.toString() === material._id.toString()
        );
        const isAdmin = user.role === 'admin';
        isUnlocked = isPurchased || isAdmin;
      }
    }

    const materialData = material.toObject();
    if (!isUnlocked) {
      materialData.fileUrl = ''; // Hide paid URL from locked users
    }

    res.json({
      success: true,
      data: materialData,
      isUnlocked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Track download / view count for study material
// @route   POST /api/materials/:id/track-download
// @access  Public
export const trackDownload = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    res.json({ success: true, downloadCount: material.downloadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
