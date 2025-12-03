const express = require('express');
const authRoutes = require('./routes.auth');
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

const v1 = express.Router();

v1.use('/auth', authRoutes);
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

module.exports = v1;
