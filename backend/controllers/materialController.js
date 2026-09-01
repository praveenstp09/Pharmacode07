import * as materialService from '../services/materialService.js';

export const getMaterials = async (req, res, next) => {
  try {
    const { data, meta } = await materialService.listMaterials(req.query);
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

export const getMaterialById = async (req, res, next) => {
  try {
    const result = await materialService.fetchMaterialById(req.params.id, req.user);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const trackDownload = async (req, res, next) => {
  try {
    const downloadCount = await materialService.incrementDownloadCount(req.params.id);
    res.json({
      success: true,
      downloadCount,
    });
  } catch (error) {
    next(error);
  }
};
