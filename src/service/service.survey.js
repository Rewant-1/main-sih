const Survey = require("../model/model.survey.js");

// Create survey - requires adminId
const createSurvey = async (surveyData, adminId) => {
  surveyData.adminId = adminId;
  const survey = new Survey(surveyData);
  return await survey.save();
};

// Get surveys - filtered by adminId (college isolation)
const getSurveys = async (adminId, filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = { adminId, ...filters };

  const surveys = await Survey.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Survey.countDocuments(query);

  return {
    surveys,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

// Get survey by ID - verify adminId ownership
const getSurveyById = async (id, adminId) => {
  return await Survey.findOne({ _id: id, adminId })
    .populate('createdBy', 'name email')
    .populate('responses.respondent', 'name email');
};

// Update survey - verify adminId ownership
const updateSurvey = async (id, updateData, adminId) => {
  updateData.updatedAt = new Date();
  return await Survey.findOneAndUpdate(
    { _id: id, adminId },
    updateData,
    { new: true }
  );
};

// Delete survey - verify adminId ownership
const deleteSurvey = async (id, adminId) => {
  return await Survey.findOneAndDelete({ _id: id, adminId });
};

// Submit response - verify survey belongs to college
const submitResponse = async (surveyId, responseData, adminId) => {
  const survey = await Survey.findOne({ _id: surveyId, adminId });
  if (!survey) throw new Error("Survey not found");

  if (survey.status !== 'active') {
    throw new Error("Survey is not active");
  }

  // Check if user already responded (if not anonymous and no multiple responses)
  if (responseData.respondent && !survey.allowMultipleResponses) {
    const existingResponse = survey.responses.find(
      r => r.respondent?.toString() === responseData.respondent.toString()
    );
    if (existingResponse) {
      throw new Error("You have already responded to this survey");
    }
  }

  survey.responses.push(responseData);
  return await survey.save();
};

// Get survey analytics - verify adminId ownership
const getSurveyAnalytics = async (surveyId, adminId) => {
  const survey = await Survey.findOne({ _id: surveyId, adminId });
  if (!survey) throw new Error("Survey not found");

  const totalResponses = survey.responses.length;
  const completedResponses = survey.responses.filter(r => r.completedAt).length;

  // Device distribution
  const deviceStats = {};
  survey.responses.forEach(r => {
    const device = r.device || 'unknown';
    deviceStats[device] = (deviceStats[device] || 0) + 1;
  });

  // Average time spent
  const timesSpent = survey.responses.filter(r => r.timeSpent).map(r => r.timeSpent);
  const avgTimeSpent = timesSpent.length > 0
    ? Math.round(timesSpent.reduce((a, b) => a + b, 0) / timesSpent.length)
    : 0;

  // Question-wise analytics
  const questionAnalytics = survey.questions.map(q => {
    const answers = survey.responses
      .map(r => r.answers.find(a => a.questionId?.toString() === q._id.toString())?.answer)
      .filter(a => a !== undefined);

    if (q.type === 'multiple_choice' || q.type === 'single_choice') {
      const distribution = {};
      answers.flat().forEach(a => {
        distribution[a] = (distribution[a] || 0) + 1;
      });
      return { questionId: q._id, text: q.text, type: q.type, distribution, totalAnswers: answers.length };
    }

    if (q.type === 'rating') {
      const avg = answers.length > 0
        ? answers.reduce((a, b) => a + parseInt(b), 0) / answers.length
        : 0;
      return { questionId: q._id, text: q.text, type: q.type, average: Math.round(avg * 10) / 10, totalAnswers: answers.length };
    }

    return { questionId: q._id, text: q.text, type: q.type, totalAnswers: answers.length };
  });

  return {
    totalResponses,
    completedResponses,
    completionRate: totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0,
    deviceStats,
    avgTimeSpent,
    questionAnalytics
  };
};

// Get overall analytics - filtered by adminId
const getOverallAnalytics = async (adminId) => {
  const matchStage = { adminId };

  const totalSurveys = await Survey.countDocuments(matchStage);
  const activeSurveys = await Survey.countDocuments({ ...matchStage, status: 'active' });

  const responseStats = await Survey.aggregate([
    { $match: matchStage },
    { $unwind: '$responses' },
    { $group: { _id: null, totalResponses: { $sum: 1 } } }
  ]);

  const avgCompletionRate = await Survey.aggregate([
    { $match: matchStage },
    {
      $project: {
        completionRate: {
          $cond: {
            if: { $gt: [{ $size: '$responses' }, 0] },
            then: {
              $multiply: [
                {
                  $divide: [
                    { $size: { $filter: { input: '$responses', as: 'r', cond: { $ne: ['$$r.completedAt', null] } } } },
                    { $size: '$responses' }
                  ]
                },
                100
              ]
            },
            else: 0
          }
        }
      }
    },
    { $group: { _id: null, avgRate: { $avg: '$completionRate' } } }
  ]);

  return {
    totalSurveys,
    activeSurveys,
    totalResponses: responseStats[0]?.totalResponses || 0,
    avgCompletionRate: Math.round(avgCompletionRate[0]?.avgRate || 0)
  };
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
