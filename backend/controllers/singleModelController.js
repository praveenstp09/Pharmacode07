import * as singleModelService from '../services/singleModelService.js';

export const getSingleModelPapers = async (req, res, next) => {
  try {
    const { data, meta } = await singleModelService.listSingleModelPapers(req.query);
    res.json({
      success: true,
      count: data.length,
      data,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleModelPaperBySlug = async (req, res, next) => {
  try {
    const result = await singleModelService.fetchSingleModelBySlug(req.params.slug, req.user);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const createSingleModelPaper = async (req, res, next) => {
  try {
    const paper = await singleModelService.createModelPaper(req.body);
    res.status(201).json({
      success: true,
      message: 'Single Model Paper created successfully!',
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSingleModelPaper = async (req, res, next) => {
  try {
    const paper = await singleModelService.updateModelPaper(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Updated successfully',
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSingleModelPaper = async (req, res, next) => {
  try {
    await singleModelService.deleteModelPaper(req.params.id);
    res.json({
      success: true,
      message: 'Single Model Paper deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
