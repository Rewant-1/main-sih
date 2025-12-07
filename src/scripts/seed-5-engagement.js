/**
 * SEED SCRIPT 5: Surveys + Newsletters + Notifications + Connections + AuditLogs
 * Creates: 50 Surveys, 100 Newsletters, 1000 Notifications, 500 Connections, 500 AuditLogs
 * 
 * Run: node src/scripts/seed-5-engagement.js
 * Prerequisite: Run seed-1, seed-2, seed-3, seed-4 first
 */

const mongoose = require('mongoose');
require('dotenv').config();

const AdminModel = require('../model/model.admin');
const UserModel = require('../model/model.user');
const SurveyModel = require('../model/model.survey');
const NewsletterModel = require('../model/model.newsletter');
const NotificationModel = require('../model/model.notification');
const ConnectionModel = require('../model/model.connections');
const AuditLogModel = require('../model/model.auditLog');

// ============================================
// SURVEY DATA
// ============================================
const SURVEY_TEMPLATES = [
    {
        title: 'Alumni Employment Survey {year}',
        description: 'Help us understand the career trajectories of our alumni community.',
        questions: [
            { text: 'What is your current employment status?', type: 'single_choice', options: ['Employed Full-time', 'Employed Part-time', 'Self-employed', 'Freelancer', 'Looking for opportunities', 'Further studies'] },
            { text: 'How would you rate your overall job satisfaction?', type: 'rating' },
            { text: 'What skills from your education are most useful in your career?', type: 'multiple_choice', options: ['Technical Skills', 'Problem Solving', 'Communication', 'Leadership', 'Teamwork', 'Critical Thinking'] },
            { text: 'Would you recommend your company to fellow alumni?', type: 'single_choice', options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] },
            { text: 'Any suggestions to improve our alumni services?', type: 'long' }
        ]
    },
    {
        title: 'Campus Improvement Feedback',
        description: 'Share your thoughts on how we can improve campus facilities.',
        questions: [
            { text: 'How often do you visit the campus?', type: 'single_choice', options: ['Frequently', 'Occasionally', 'Rarely', 'Never'] },
            { text: 'Rate the current campus facilities', type: 'rating' },
            { text: 'Which facilities need the most improvement?', type: 'multiple_choice', options: ['Library', 'Labs', 'Sports Complex', 'Cafeteria', 'Auditorium', 'Hostels'] },
            { text: 'Would you contribute to a campus development fund?', type: 'single_choice', options: ['Yes, definitely', 'Maybe', 'No'] },
            { text: 'Share specific improvement suggestions', type: 'long' }
        ]
    },
    {
        title: 'Mentorship Program Interest',
        description: 'Help us understand interest in alumni-student mentorship.',
        questions: [
            { text: 'Are you interested in being a mentor?', type: 'single_choice', options: ['Yes', 'Maybe', 'No'] },
            { text: 'How many hours per month can you dedicate?', type: 'single_choice', options: ['1-2 hours', '3-5 hours', '5-10 hours', '10+ hours'] },
            { text: 'Which areas can you mentor in?', type: 'multiple_choice', options: ['Career Guidance', 'Technical Skills', 'Interview Prep', 'Entrepreneurship', 'Higher Studies', 'Work-Life Balance'] },
            { text: 'Preferred mentorship format', type: 'single_choice', options: ['One-on-one', 'Group sessions', 'Online workshops', 'Any format'] },
            { text: 'Any specific topics you\'d like to cover?', type: 'long' }
        ]
    },
    {
        title: 'Event Preferences Survey',
        description: 'Help us plan events that matter to you.',
        questions: [
            { text: 'What type of events do you prefer?', type: 'multiple_choice', options: ['Technical Workshops', 'Networking Events', 'Cultural Programs', 'Sports', 'Career Fairs', 'Reunions'] },
            { text: 'Preferred event format', type: 'single_choice', options: ['In-person only', 'Virtual only', 'Hybrid', 'No preference'] },
            { text: 'Best day for events', type: 'single_choice', options: ['Weekday evening', 'Saturday', 'Sunday', 'Any day'] },
            { text: 'Rate our past events', type: 'rating' },
            { text: 'Suggest topics for future events', type: 'long' }
        ]
    }
];

// ============================================
// NEWSLETTER DATA
// ============================================
const NEWSLETTER_TEMPLATES = [
    {
        title: 'Alumni Connect - Monthly Digest',
        subject: 'Your Monthly Update from {college}',
        template: 'digest',
        content: '<h1>Monthly Alumni Digest</h1><p>Stay connected with the latest updates from your alma mater.</p><h2>Campus News</h2><p>Exciting developments happening on campus...</p><h2>Alumni Spotlight</h2><p>Featured alumni achievements this month...</p><h2>Upcoming Events</h2><p>Don\'t miss these upcoming events...</p>'
    },
    {
        title: 'Career Opportunities Newsletter',
        subject: 'New Job Opportunities for {college} Alumni',
        template: 'announcement',
        content: '<h1>Latest Job Opportunities</h1><p>Exclusive opportunities shared by our alumni network.</p><h2>Featured Positions</h2><p>Top companies are hiring our alumni...</p><h2>Referral Program</h2><p>Refer a fellow alumnus and earn rewards...</p>'
    },
    {
        title: 'Upcoming Events Alert',
        subject: 'Don\'t Miss These Upcoming Events!',
        template: 'event',
        content: '<h1>Events This Month</h1><p>Mark your calendars for these exciting events!</p><h2>Webinars</h2><p>Expert sessions lined up for you...</p><h2>Reunions</h2><p>Batch reunions and networking events...</p>'
    },
    {
        title: 'Giving Campaign Update',
        subject: 'Thank You for Your Generous Support',
        template: 'campaign',
        content: '<h1>Campaign Progress Update</h1><p>Thanks to your support, we\'re making progress!</p><h2>Funds Raised</h2><p>See how your contributions are making an impact...</p><h2>Success Stories</h2><p>Beneficiaries share their gratitude...</p>'
    },
    {
        title: 'Achievement Announcements',
        subject: 'Celebrating Our Alumni Achievements',
        template: 'announcement',
        content: '<h1>Alumni Achievements</h1><p>Celebrating the success of our community!</p><h2>Awards & Recognition</h2><p>Alumni who made us proud...</p><h2>Promotions & Milestones</h2><p>Career achievements to celebrate...</p>'
    }
];

// ============================================
// NOTIFICATION DATA
// ============================================
const NOTIFICATION_TYPES = [
    { type: 'connection_request', title: '{name} wants to connect', icon: 'user-plus' },
    { type: 'connection_accepted', title: '{name} accepted your connection request', icon: 'user-check' },
    { type: 'message', title: 'New message from {name}', icon: 'message' },
    { type: 'job_posted', title: 'New job opportunity: {title}', icon: 'briefcase' },
    { type: 'job_application', title: 'Your application for {title} was received', icon: 'file-text' },
    { type: 'event_reminder', title: 'Reminder: {event} is tomorrow', icon: 'calendar' },
    { type: 'event_registration', title: 'You\'re registered for {event}', icon: 'check-circle' },
    { type: 'campaign_update', title: '{campaign} reached a new milestone!', icon: 'trending-up' },
    { type: 'donation_thankyou', title: 'Thank you for your donation!', icon: 'heart' },
    { type: 'story_approved', title: 'Your success story has been published!', icon: 'star' },
    { type: 'approval_pending', title: 'Your submission is under review', icon: 'clock' },
    { type: 'card_issued', title: 'Your alumni card is ready!', icon: 'credit-card' },
    { type: 'general', title: '{message}', icon: 'bell' }
];

// ============================================
// AUDIT LOG DATA
// ============================================
const AUDIT_ACTIONS = [
    { action: 'CREATE', resources: ['User', 'Alumni', 'Student', 'Job', 'Event', 'Campaign', 'Survey', 'Newsletter', 'SuccessStory'] },
    { action: 'UPDATE', resources: ['User', 'Alumni', 'Job', 'Event', 'Campaign', 'Survey', 'Newsletter'] },
    { action: 'DELETE', resources: ['Job', 'Event', 'Post', 'Campaign', 'Survey'] },
    { action: 'APPROVE', resources: ['Alumni', 'SuccessStory', 'Campaign'] },
    { action: 'VERIFY', resources: ['Alumni', 'KYC'] },
    { action: 'LOGIN', resources: ['User'] },
    { action: 'BULK_IMPORT', resources: ['User', 'Alumni', 'Student'] }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = (startYear, endYear) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seedEngagement() {
    try {
        console.log('🚀 Starting Seed Script 5: Surveys + Newsletters + Notifications + Connections + AuditLogs');
        console.log('========================================================================================\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGO_DB_NAME || 'sih_2025'
        });
        console.log(`✅ Connected to MongoDB (Database: ${process.env.MONGO_DB_NAME || 'sih_2025'})\n`);

        // Clear existing data
        console.log('🗑️  Clearing existing engagement data...');
        await SurveyModel.deleteMany({});
        await NewsletterModel.deleteMany({});
        await NotificationModel.deleteMany({});
        await ConnectionModel.deleteMany({});
        await AuditLogModel.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Get references
        const admins = await AdminModel.find({});
        const users = await UserModel.find({});

        console.log(`📊 Found ${admins.length} Admins and ${users.length} Users\n`);

        // Group by adminId
        const adminsByCollege = {};
        admins.forEach(admin => {
            if (!adminsByCollege[admin.adminId]) adminsByCollege[admin.adminId] = [];
            adminsByCollege[admin.adminId].push(admin);
        });

        const usersByCollege = {};
        users.forEach(user => {
            if (!usersByCollege[user.adminId]) usersByCollege[user.adminId] = [];
            usersByCollege[user.adminId].push(user);
        });

        // ============================================
        // CREATE SURVEYS (10 per college = 50 total)
        // ============================================
        console.log('📊 Creating Surveys...');
        let surveyCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const admin = adminsByCollege[adminId][0];
            const collegeUsers = usersByCollege[adminId] || [];

            for (let i = 0; i < 10; i++) {
                const template = getRandomElement(SURVEY_TEMPLATES);
                const year = getRandomInt(2019, 2024);
                const startDate = getRandomDate(year, year);
                const endDate = new Date(startDate.getTime() + getRandomInt(14, 60) * 24 * 60 * 60 * 1000);
                const isActive = new Date() > startDate && new Date() < endDate;

                // Generate random responses
                const responses = [];
                const respondentCount = getRandomInt(10, 50);
                for (let j = 0; j < respondentCount; j++) {
                    if (collegeUsers.length === 0) break;
                    const respondent = getRandomElement(collegeUsers);
                    responses.push({
                        respondent: respondent._id,
                        answers: template.questions.map((q, idx) => ({
                            questionId: new mongoose.Types.ObjectId(),
                            answer: q.type === 'rating' ? getRandomInt(1, 5) :
                                q.type === 'single_choice' ? getRandomElement(q.options) :
                                    q.type === 'multiple_choice' ? getRandomElements(q.options, getRandomInt(1, 3)) :
                                        'Sample response text for this question.'
                        })),
                        completedAt: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
                        timeSpent: getRandomInt(60, 600),
                        device: getRandomElement(['desktop', 'mobile', 'tablet'])
                    });
                }

                await SurveyModel.create({
                    adminId: adminId,
                    title: template.title.replace('{year}', year.toString()),
                    description: template.description,
                    coverImage: `https://picsum.photos/seed/survey${surveyCount}/800/400`,
                    questions: template.questions.map((q, idx) => ({
                        text: q.text,
                        questionText: q.text,
                        type: q.type,
                        questionType: q.type,
                        options: q.options || [],
                        isRequired: idx < 3,
                        order: idx
                    })),
                    responses: responses,
                    targetAudience: getRandomElement(['all', 'alumni', 'students']),
                    startDate: startDate,
                    endDate: endDate,
                    isScheduled: true,
                    isAnonymous: Math.random() > 0.5,
                    allowMultipleResponses: false,
                    showResults: Math.random() > 0.5,
                    status: isActive ? 'active' : (new Date() > endDate ? 'closed' : 'draft'),
                    responseCount: responses.length,
                    createdBy: admin._id,
                    createdAt: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
                    updatedAt: endDate
                });
                surveyCount++;
            }
            console.log(`   ✅ ${adminId}: 10 surveys created`);
        }

        console.log(`\n📊 Total Surveys Created: ${surveyCount}\n`);

        // ============================================
        // CREATE NEWSLETTERS (20 per college = 100 total)
        // ============================================
        console.log('📧 Creating Newsletters...');
        let newsletterCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const admin = adminsByCollege[adminId][0];

            for (let i = 0; i < 20; i++) {
                const template = getRandomElement(NEWSLETTER_TEMPLATES);
                const sentDate = getRandomDate(2019, 2024);
                const isSent = sentDate < new Date();

                await NewsletterModel.create({
                    adminId: adminId,
                    title: template.title,
                    subject: template.subject.replace('{college}', admin.instituteName.split(' ')[0]),
                    content: template.content,
                    htmlContent: template.content,
                    previewText: 'Check out the latest updates from your alumni network...',
                    template: template.template,
                    coverImage: `https://picsum.photos/seed/newsletter${newsletterCount}/800/400`,
                    targetAudience: getRandomElement(['all', 'alumni', 'students']),
                    recipients: getRandomElement(['all', 'alumni', 'students']),
                    recipientCount: isSent ? getRandomInt(100, 1000) : 0,
                    scheduledAt: sentDate,
                    scheduledFor: sentDate,
                    sentAt: isSent ? sentDate : null,
                    openCount: isSent ? getRandomInt(30, 500) : 0,
                    clickCount: isSent ? getRandomInt(10, 200) : 0,
                    stats: isSent ? {
                        sent: getRandomInt(100, 1000),
                        delivered: getRandomInt(90, 950),
                        opened: getRandomInt(30, 500),
                        clicked: getRandomInt(10, 200),
                        bounced: getRandomInt(0, 50)
                    } : null,
                    status: isSent ? 'sent' : getRandomElement(['draft', 'scheduled']),
                    category: getRandomElement(['announcement', 'update', 'event', 'achievement', 'general']),
                    tags: getRandomElements(['monthly', 'career', 'events', 'achievements', 'campus'], 3),
                    isFeatured: Math.random() > 0.8,
                    createdBy: admin._id,
                    createdAt: new Date(sentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
                    updatedAt: sentDate
                });
                newsletterCount++;
            }
            console.log(`   ✅ ${adminId}: 20 newsletters created`);
        }

        console.log(`\n📊 Total Newsletters Created: ${newsletterCount}\n`);

        // ============================================
        // CREATE NOTIFICATIONS (200 per college = 1000 total)
        // ============================================
        console.log('🔔 Creating Notifications...');
        let notificationCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeUsers = usersByCollege[adminId] || [];

            for (let i = 0; i < 200; i++) {
                if (collegeUsers.length === 0) continue;

                const user = getRandomElement(collegeUsers);
                const notifType = getRandomElement(NOTIFICATION_TYPES);
                const createdDate = getRandomDate(2019, 2024);
                const isRead = Math.random() > 0.4;

                const title = notifType.title
                    .replace('{name}', getRandomElement(['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Singh']))
                    .replace('{title}', getRandomElement(['Software Engineer at Google', 'Product Manager at Amazon', 'Data Scientist at Meta']))
                    .replace('{event}', getRandomElement(['Annual Alumni Meet', 'Tech Talk', 'Career Fair', 'Workshop']))
                    .replace('{campaign}', getRandomElement(['Scholarship Fund', 'Lab Equipment', 'Library Renovation']))
                    .replace('{message}', getRandomElement(['Welcome to the alumni network!', 'Profile update successful', 'New features available']));

                await NotificationModel.create({
                    adminId: adminId,
                    userId: user._id,
                    type: notifType.type,
                    title: title,
                    message: `This is a notification about ${notifType.type.replace('_', ' ')}.`,
                    icon: notifType.icon,
                    link: `/${notifType.type.replace('_', '-')}`,
                    read: isRead,
                    readAt: isRead ? new Date(createdDate.getTime() + getRandomInt(1, 24) * 60 * 60 * 1000) : null,
                    priority: getRandomElement(['low', 'medium', 'high']),
                    emailSent: Math.random() > 0.5,
                    pushSent: Math.random() > 0.7,
                    createdAt: createdDate
                });
                notificationCount++;
            }
            console.log(`   ✅ ${adminId}: 200 notifications created`);
        }

        console.log(`\n📊 Total Notifications Created: ${notificationCount}\n`);

        // ============================================
        // CREATE CONNECTIONS (100 per college = 500 total)
        // ============================================
        console.log('🤝 Creating Connections...');
        let connectionCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeUsers = usersByCollege[adminId] || [];

            for (let i = 0; i < 100; i++) {
                if (collegeUsers.length < 2) continue;

                const user1 = getRandomElement(collegeUsers);
                let user2 = getRandomElement(collegeUsers);
                while (user2._id.toString() === user1._id.toString()) {
                    user2 = getRandomElement(collegeUsers);
                }

                const createdDate = getRandomDate(2019, 2024);
                const status = getRandomElement(['accepted', 'accepted', 'accepted', 'pending', 'rejected']);

                await ConnectionModel.create({
                    sender: user1._id,
                    receiver: user2._id,
                    status: status,
                    createdAt: createdDate,
                    updatedAt: status !== 'pending' ? new Date(createdDate.getTime() + getRandomInt(1, 72) * 60 * 60 * 1000) : createdDate
                });
                connectionCount++;
            }
            console.log(`   ✅ ${adminId}: 100 connections created`);
        }

        console.log(`\n📊 Total Connections Created: ${connectionCount}\n`);

        // ============================================
        // CREATE AUDIT LOGS (100 per college = 500 total)
        // ============================================
        console.log('📋 Creating Audit Logs...');
        let auditCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeAdmins = adminsByCollege[adminId];

            for (let i = 0; i < 100; i++) {
                const actionData = getRandomElement(AUDIT_ACTIONS);
                const resource = getRandomElement(actionData.resources);
                const admin = getRandomElement(collegeAdmins);
                const createdDate = getRandomDate(2019, 2024);

                await AuditLogModel.create({
                    adminId: adminId,
                    action: actionData.action,
                    resourceType: resource,
                    resourceId: new mongoose.Types.ObjectId(),
                    actor: admin._id,
                    actorType: 'Admin',
                    actorEmail: admin.email,
                    changes: actionData.action === 'UPDATE' ? [{
                        field: getRandomElement(['status', 'name', 'email', 'verified']),
                        oldValue: 'old_value',
                        newValue: 'new_value'
                    }] : [],
                    ipAddress: `192.168.${getRandomInt(1, 255)}.${getRandomInt(1, 255)}`,
                    userAgent: getRandomElement([
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
                    ]),
                    status: 'success',
                    metadata: {
                        source: getRandomElement(['admin_panel', 'api', 'bulk_import']),
                        version: '1.0'
                    },
                    createdAt: createdDate
                });
                auditCount++;
            }
            console.log(`   ✅ ${adminId}: 100 audit logs created`);
        }

        console.log(`\n📊 Total Audit Logs Created: ${auditCount}\n`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('========================================================================================');
        console.log('🎉 SEED SCRIPT 5 COMPLETED SUCCESSFULLY');
        console.log('========================================================================================');
        console.log(`   Surveys: ${surveyCount}`);
        console.log(`   Newsletters: ${newsletterCount}`);
        console.log(`   Notifications: ${notificationCount}`);
        console.log(`   Connections: ${connectionCount}`);
        console.log(`   Audit Logs: ${auditCount}`);
        console.log('\n✅ ALL SEED SCRIPTS COMPLETED! Database is now fully populated.\n');

        // Final summary
        console.log('========================================================================================');
        console.log('📊 COMPLETE DATABASE SUMMARY');
        console.log('========================================================================================');
        console.log('   Colleges: 5');
        console.log('   Admins: 10 (2 per college)');
        console.log('   Users: 500 (100 per college - 60 Alumni + 40 Students)');
        console.log('   Alumni Profiles: 300');
        console.log('   Student Profiles: 200');
        console.log('   Alumni Cards: ~200');
        console.log('   Jobs: 200');
        console.log('   Events: 100');
        console.log('   Posts: 300');
        console.log('   Campaigns: 50');
        console.log('   Donations: 500');
        console.log('   Success Stories: 100');
        console.log('   Surveys: 50');
        console.log('   Newsletters: 100');
        console.log('   Notifications: 1000');
        console.log('   Connections: 500');
        console.log('   Audit Logs: 500');
        console.log('========================================================================================\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error in seed script:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedEngagement();
