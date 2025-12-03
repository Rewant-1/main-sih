const SurveyService = require("../service/service.survey.js");

const createSurvey = async (req, res) => {
  try {
    const survey = await SurveyService.createSurvey({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSurveys = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filters = {};
    if (status) filters.status = status;
    
    const surveys = await SurveyService.getSurveys(filters, page, limit);
    res.status(200).json({ success: true, data: surveys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSurveyById = async (req, res) => {
  try {
    const survey = await SurveyService.getSurveyById(req.params.id);
    if (survey) {
      res.status(200).json({ success: true, data: survey });
    } else {
      res.status(404).json({ success: false, message: "Survey not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSurvey = async (req, res) => {
  try {
    const survey = await SurveyService.updateSurvey(req.params.id, req.body);
    res.status(200).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSurvey = async (req, res) => {
  try {
    await SurveyService.deleteSurvey(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitResponse = async (req, res) => {
  try {
    const { answers, timeSpent, device } = req.body;
    const survey = await SurveyService.submitResponse(req.params.id, {
      respondent: req.user?.userId,
      answers,
      timeSpent,
      device
    });
    res.status(200).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSurveyAnalytics = async (req, res) => {
  try {
    const analytics = await SurveyService.getSurveyAnalytics(req.params.id);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOverallAnalytics = async (req, res) => {
  try {
    const analytics = await SurveyService.getOverallAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitResponse,
  getSurveyAnalytics,
  getOverallAnalytics
};
