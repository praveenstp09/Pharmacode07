import * as nonPharmaService from '../services/nonPharmaService.js';

export const getNonPharmaResources = async (req, res, next) => {
  try {
    const { data, meta } = await nonPharmaService.listNonPharmaResources(req.query);
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

export const createNonPharmaResource = async (req, res, next) => {
  try {
    const resource = await nonPharmaService.createResource(req.body);
    res.status(201).json({
      success: true,
      message: 'Non-Pharma resource created successfully!',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNonPharmaResource = async (req, res, next) => {
  try {
    const resource = await nonPharmaService.updateResource(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Updated successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNonPharmaResource = async (req, res, next) => {
  try {
    await nonPharmaService.deleteResource(req.params.id);
    res.json({
      success: true,
      message: 'Non-Pharma resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
