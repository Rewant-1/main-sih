// Central export for all models
const UserModel = require('./model.user');
const AlumniModel = require('./model.alumni');
const StudentModel = require('./model.student');
const AdminModel = require('./model.admin');
const JobModel = require('./model.job');
const JobApplicationModel = require('./model.jobApplication');
const EventModel = require('./model.event');
const ChatModel = require('./model.chat');
const ConnectionModel = require('./model.connections');
const PostModel = require('./model.post');
const CampaignModel = require('./model.campaign');
const DonationModel = require('./model.donation');
const SuccessStoryModel = require('./model.successStory');
const AlumniCardModel = require('./model.alumniCard');
const NotificationModel = require('./model.notification');
const ActivityModel = require('./model.activity');
const SurveyModel = require('./model.survey');
const SurveyResponseModel = require('./model.surveyResponse');
const NewsletterModel = require('./model.newsletter');

// Models only in frontend-admin backend
const AnalyticsEventModel = require('./model.analyticsEvent');
const AnalyticsSummaryModel = require('./model.analyticsSummary');
const AuditLogModel = require('./model.auditLog');
const BulkImportModel = require('./model.bulkImport');
const CollegeModel = require('./model.college');
const InvitationModel = require('./model.invitation');
const KYCModel = require('./model.kyc');
const MessageModel = require('./model.message');
const UniversityModel = require('./model.university');

module.exports = {
    UserModel,
    AlumniModel,
    StudentModel,
    AdminModel,
    JobModel,
    JobApplicationModel,
    EventModel,
    ChatModel,
    ConnectionModel,
    PostModel,
    CampaignModel,
    DonationModel,
    SuccessStoryModel,
    AlumniCardModel,
    NotificationModel,
    ActivityModel,
    SurveyModel,
    SurveyResponseModel,
    NewsletterModel,
    // Admin-specific models
    AnalyticsEventModel,
    AnalyticsSummaryModel,
    AuditLogModel,
    BulkImportModel,
    CollegeModel,
    InvitationModel,
    KYCModel,
    MessageModel,
    UniversityModel
};
