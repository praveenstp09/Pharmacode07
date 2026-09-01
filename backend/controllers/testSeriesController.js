import * as testSeriesService from '../services/testSeriesService.js';

export const getTestSeries = async (req, res, next) => {
  try {
    const { data, meta } = await testSeriesService.listTestSeries(req.query);
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

export const getTestSeriesBySlug = async (req, res, next) => {
  try {
    const data = await testSeriesService.getSeriesDetailsBySlug(req.params.slug, req.user);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestPaperForAttempt = async (req, res, next) => {
  try {
    const data = await testSeriesService.getPaperForTestAttempt(req.params.paperId, req.user);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getPracticeMCQs = async (req, res, next) => {
  try {
    const selected = await testSeriesService.samplePracticeMCQs(req.query.subject, req.query.limit);
    res.json({
      success: true,
      count: selected.length,
      data: selected,
    });
  } catch (error) {
    next(error);
  }
};
