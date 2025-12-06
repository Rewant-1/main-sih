const express = require('express');
const authRoutes = require('./routes.auth');
const adminRoutes = require('./routes.admin');
const studentRoutes = require('./routes.student');
const connectionRoutes = require('./routes.connection');
const alumniRoutes = require('./routes.alumni');
const chatRoutes = require('./routes.chat.js');
const eventRoutes = require('./routes.event.js');
const jobRoutes = require('./routes.job.js');
const messageRoutes = require('./routes.message.js');
const postRoutes = require('./routes.post.js');
const userRoutes = require('./routes.user.js');
const campaignRoutes = require('./routes.campaign.js');
const surveyRoutes = require('./routes.survey.js');
const successStoryRoutes = require('./routes.successStory.js');
const newsletterRoutes = require('./routes.newsletter.js');
// New routes for Data Integrity & Analytics
const auditLogRoutes = require('./routes.auditLog.js');
const bulkImportRoutes = require('./routes.bulkImport.js');
const invitationRoutes = require('./routes.invitation.js');
const kycRoutes = require('./routes.kyc.js');
const analyticsRoutes = require('./routes.analytics.js');

const v1 = express.Router();

// Simple health check for API and dev/local debugging
v1.get('/ping', (req, res) => res.json({ success: true, message: 'pong' }));

v1.use('/auth', authRoutes);
v1.use('/admins', adminRoutes);
v1.use('/students', studentRoutes);
v1.use('/connections', connectionRoutes);
v1.use('/alumni', alumniRoutes);
v1.use('/chats', chatRoutes);
v1.use('/events', eventRoutes);
v1.use('/jobs', jobRoutes);
v1.use('/messages', messageRoutes);
v1.use('/posts', postRoutes);
v1.use('/users', userRoutes);
v1.use('/campaigns', campaignRoutes);
v1.use('/surveys', surveyRoutes);
v1.use('/success-stories', successStoryRoutes);
v1.use('/newsletters', newsletterRoutes);
// New routes
v1.use('/audit-logs', auditLogRoutes);
v1.use('/bulk-imports', bulkImportRoutes);
v1.use('/invitations', invitationRoutes);
v1.use('/kyc', kycRoutes);
v1.use('/analytics', analyticsRoutes);

module.exports = v1;
