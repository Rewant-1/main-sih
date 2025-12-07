const express = require('express');

// Admin Auth only - no user auth for admin portal
const adminAuthRoutes = require('./routes.adminAuth');
const adminRoutes = require('./routes.admin');

// Data routes - all require admin auth (enforced in route files)
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

// Admin-specific routes
const auditLogRoutes = require('./routes.auditLog.js');
const bulkImportRoutes = require('./routes.bulkImport.js');
const invitationRoutes = require('./routes.invitation.js');
const kycRoutes = require('./routes.kyc.js');
const analyticsRoutes = require('./routes.analytics.js');

const v1 = express.Router();

// Health check - public
v1.get('/ping', (req, res) => res.json({ success: true, message: 'pong' }));

// ============================================
// ADMIN AUTHENTICATION
// ============================================
// Admin-only auth (login, register, password reset)
v1.use('/admin/auth', adminAuthRoutes);

// ============================================
// ADMIN PROFILE MANAGEMENT
// ============================================
v1.use('/admins', adminRoutes);

// ============================================
// COLLEGE DATA ROUTES (All require admin auth)
// Each route file applies verifyAdmin middleware
// Data is automatically filtered by adminId
// ============================================
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

// ============================================
// ADMIN TOOLS
// ============================================
v1.use('/audit-logs', auditLogRoutes);
v1.use('/bulk-imports', bulkImportRoutes);
v1.use('/invitations', invitationRoutes);
v1.use('/kyc', kycRoutes);
v1.use('/analytics', analyticsRoutes);

module.exports = v1;
