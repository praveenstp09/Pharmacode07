import * as studyPackService from '../services/studyPackService.js';

export const getPublishedPacks = async (req, res, next) => {
  try {
    const result = await studyPackService.listStudyPacks(req.query);
    res.status(200).json({
      success: true,
      data: result.packs,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getPackDetails = async (req, res, next) => {
  try {
    const result = await studyPackService.getStudyPackBySlug(req.params.slug, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Admin Controllers
export const adminGetAllPacks = async (req, res, next) => {
  try {
    const packs = await studyPackService.getAllAdminPacks();
    res.status(200).json({
      success: true,
      data: packs,
    });
  } catch (error) {
    next(error);
  }
};

export const adminCreatePack = async (req, res, next) => {
  try {
    const pack = await studyPackService.createStudyPack(req.body);
    res.status(201).json({
      success: true,
      data: pack,
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdatePack = async (req, res, next) => {
  try {
    const pack = await studyPackService.updateStudyPack(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: pack,
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeletePack = async (req, res, next) => {
  try {
    const result = await studyPackService.deleteStudyPack(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetPackItems = async (req, res, next) => {
  try {
    const items = await studyPackService.getItemsForPack(req.params.packId);
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const adminAddItemToPack = async (req, res, next) => {
  try {
    const item = await studyPackService.addItemToPack(req.params.packId, req.body);
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateItem = async (req, res, next) => {
  try {
    const item = await studyPackService.updateStudyPackItem(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteItem = async (req, res, next) => {
  try {
    const result = await studyPackService.deleteStudyPackItem(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
