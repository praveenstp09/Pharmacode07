import * as attemptService from '../services/attemptService.js';

export const submitAttempt = async (req, res, next) => {
  try {
    const data = await attemptService.submitTestAttempt(req.user.id, req.body);
    res.status(201).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttempts = async (req, res, next) => {
  try {
    const { data, meta } = await attemptService.fetchUserAttempts(req.user.id, req.query);
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

export const getAttemptById = async (req, res, next) => {
  try {
    const data = await attemptService.fetchAttemptDetails(req.params.attemptId, req.user);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
