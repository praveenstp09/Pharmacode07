import StudyMaterial from '../models/StudyMaterial.js';
import User from '../models/User.js';

// @desc    Get all study materials / PYQs
// @route   GET /api/materials
// @access  Public
export const getMaterials = async (req, res) => {
  try {
    const { category, examType, subject, isPaid, search } = req.query;
    let query = { published: true };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (examType && examType !== 'All') {
      query.examType = examType;
    }
    if (subject && subject !== 'All') {
      query.subject = subject;
    }
    if (isPaid !== undefined && isPaid !== '') {
      query.isPaid = isPaid === 'true';
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const materials = await StudyMaterial.find(query).sort({ year: -1, createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single study material & download check
// @route   GET /api/materials/:id
// @access  Public/Private
export const getMaterialById = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    let isUnlocked = !material.isPaid; // Free materials are unlocked for everyone

    if (material.isPaid && req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        const isPurchased = user.purchasedMaterials.some(
          id => id.toString() === material._id.toString()
        );
        const isAdmin = user.role === 'admin';
        isUnlocked = isPurchased || isAdmin;
      }
    }

    res.json({
      success: true,
      data: material,
      isUnlocked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
