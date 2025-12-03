const Survey = require("../model/model.survey.js");

const createSurvey = async (surveyData) => {
  const survey = new Survey(surveyData);
  return await survey.save();
};

const getSurveys = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const surveys = await Survey.find(filters)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Survey.countDocuments(filters);
  
  return {
    surveys,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

const getSurveyById = async (id) => {
  return await Survey.findById(id)
    .populate('createdBy', 'name email')
    .populate('responses.respondent', 'name email');
};

const updateSurvey = async (id, updateData) => {
  updateData.updatedAt = new Date();
  return await Survey.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteSurvey = async (id) => {
  return await Survey.findByIdAndDelete(id);
};

const submitResponse = async (surveyId, responseData) => {
  const survey = await Survey.findById(surveyId);
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

const getSurveyAnalytics = async (surveyId) => {
  const survey = await Survey.findById(surveyId);
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

const getOverallAnalytics = async () => {
  const totalSurveys = await Survey.countDocuments();
  const activeSurveys = await Survey.countDocuments({ status: 'active' });
  
  const responseStats = await Survey.aggregate([
    { $unwind: '$responses' },
    { $group: { _id: null, totalResponses: { $sum: 1 } } }
  ]);
  
  const avgCompletionRate = await Survey.aggregate([
    {
      $project: {
        completionRate: {
          $cond: {
            if: { $gt: [{ $size: '$responses' }, 0] },
            then: {
              $multiply: [
                { $divide: [
                  { $size: { $filter: { input: '$responses', as: 'r', cond: { $ne: ['$$r.completedAt', null] } } } },
                  { $size: '$responses' }
                ] },
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
