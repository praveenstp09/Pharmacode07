import NonPharmaResource from '../models/NonPharmaResource.js';
import TestPaper from '../models/TestPaper.js';
import Purchase from '../models/Purchase.js';

// Get non-pharma resources by section (Public)
export const getNonPharmaResources = async (req, res) => {
  try {
    const { section, contentType, isFree, search } = req.query;
    const query = { published: true };

    if (section) query.section = section;
    if (contentType) query.contentType = contentType;
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const resources = await NonPharmaResource.find(query)
      .populate('testPaperId', 'durationMinutes totalMarks totalQuestions positiveMarks negativeMarks difficulty')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create Non-Pharma Resource
export const createNonPharmaResource = async (req, res) => {
  try {
    const {
      title,
      section,
      topic,
      contentType,
      pdfUrl,
      relevanceMonth,
      isFree,
      price,
      questions,
      durationMinutes,
      totalMarks,
      difficulty,
    } = req.body;

    let testPaperId = null;

    if (contentType === 'cbt' && Array.isArray(questions) && questions.length > 0) {
      const testPaper = await TestPaper.create({
        title: `${section.toUpperCase()} - ${title}`,
        durationMinutes: durationMinutes || 30,
        totalMarks: totalMarks || questions.length,
        positiveMarks: 1,
        negativeMarks: 0.25,
        difficulty: difficulty || 'Medium',
        questions,
        parentType: 'non_pharma',
      });
      testPaperId = testPaper._id;
    }

    const resource = await NonPharmaResource.create({
      title,
      section,
      topic: topic || '',
      contentType,
      testPaperId,
      pdfUrl: pdfUrl || '',
      totalQuestions: questions ? questions.length : 25,
      durationMinutes: durationMinutes || 30,
      relevanceMonth: relevanceMonth || '',
      isFree: isFree !== undefined ? isFree : true,
      price: price || 0,
      published: true,
    });

    res.status(201).json({
      success: true,
      message: 'Non-Pharma resource created successfully!',
      data: resource,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update Non-Pharma Resource
export const updateNonPharmaResource = async (req, res) => {
  try {
    const resource = await NonPharmaResource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Updated successfully', data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete Non-Pharma Resource
export const deleteNonPharmaResource = async (req, res) => {
  try {
    const resource = await NonPharmaResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    if (resource.testPaperId) {
      await TestPaper.findByIdAndDelete(resource.testPaperId);
    }
    await resource.deleteOne();
    res.json({ success: true, message: 'Non-Pharma resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
