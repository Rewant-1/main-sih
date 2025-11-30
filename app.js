const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./src/routes/routes.auth');
// const studentRoutes = require('./src/routes/routes.student');
// const alumniRoutes = require('./src/routes/routes.alumni');
// const chatRoutes = require('./src/routes/routes.chat.js');
// const eventRoutes = require('./src/routes/routes.event.js');
// const jobRoutes = require('./src/routes/routes.job.js');
// const messageRoutes = require('./src/routes/routes.message.js');
// const postRoutes = require('./src/routes/routes.post.js');
// const userRoutes = require('./src/routes/routes.user.js');
require('dotenv').config();

const app = express();
const port = 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGODB_URI;
mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/auth', authRoutes);
// app.use('/students', studentRoutes);
// app.use('/alumni', alumniRoutes);
// app.use('/chats', chatRoutes);
// app.use('/events', eventRoutes);
// app.use('/jobs', jobRoutes);
// app.use('/messages', messageRoutes);
// app.use('/posts', postRoutes);
// app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
