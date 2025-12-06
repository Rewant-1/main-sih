const mongoose = require("mongoose");

const surveyResponseSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true,
        index: true
    },
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        questionText: String,
        answer: mongoose.Schema.Types.Mixed // Can be string, array, number
    }],
    
    isComplete: {
        type: Boolean,
        default: true
    },
    
    submittedAt: {
        type: Date,
        default: Date.now
    },
    
    timeSpent: {
        type: Number // in seconds
    }
}, { 
    timestamps: true 
});

// Compound index to ensure one response per user per survey
surveyResponseSchema.index({ surveyId: 1, userId: 1 }, { unique: true });

const SurveyResponseModel = mongoose.model("SurveyResponse", surveyResponseSchema);

module.exports = SurveyResponseModel;
