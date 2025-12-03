/*
  Demo seeding script to create an admin user, a verified alumni, and a student.
  Usage (PowerShell):
    $env:MONGODB_URI='your_mongo_uri'; $env:JWT_SECRET='secret'; node scripts/seed-demo.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserModel = require('../src/model/model.user');
const AlumniModel = require('../src/model/model.alumni');
const StudentModel = require('../src/model/model.student');

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGO_URI) {
    console.error('Please set MONGODB_URI in your environment');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Create an Admin user directly using native insert (bypass Mongoose schema enum validation)
  const adminEmail = 'admin@demo.local';
  const existingAdmin = await db.collection('users').findOne({ email: adminEmail });
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
    const insertResult = await db.collection('users').insertOne({
      name: 'Demo Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      userType: 'Admin',
      createdAt: new Date(),
    });
    console.log('Admin user created:', insertResult.insertedId.toString());
  } else {
    console.log('Admin already exists');
  }

  // Create a verified alumni using Mongoose model
  const alumniEmail = 'alumni@demo.local';
  const existingAlumniUser = await UserModel.findOne({ email: alumniEmail });
  if (!existingAlumniUser) {
    const hashedPassword = await bcrypt.hash('AlumniPass123!', 10);
    const user = await UserModel.create({
      name: 'Demo Alumni',
      email: alumniEmail,
      passwordHash: hashedPassword,
      userType: 'Alumni',
    });

    const alumni = await AlumniModel.create({
      userId: user._id,
      graduationYear: 2019,
      degreeUrl: 'https://example.com/degree.pdf',
      verified: true,
    });

    user.profileDetails = alumni._id;
    await user.save();

    console.log('Verified alumni created:', user._id.toString());
  } else {
    console.log('Alumni already exists');
  }

  // Create a student via model
  const studentEmail = 'student@demo.local';
  const existingStudent = await UserModel.findOne({ email: studentEmail });
  if (!existingStudent) {
    const hashedPassword = await bcrypt.hash('StudentPass123!', 10);
    const user = await UserModel.create({
      name: 'Demo Student',
      email: studentEmail,
      passwordHash: hashedPassword,
      userType: 'Student',
    });

    const student = await StudentModel.create({
      userId: user._id,
      academic: {
        entryDate: new Date('2022-07-01'),
        degreeType: 'B.Tech',
        degreeName: 'Computer Science',
        isCompleted: false,
        currentYear: 3,
      },
    });

    user.profileDetails = student._id;
    await user.save();

    console.log('Student created:', user._id.toString());
  } else {
    console.log('Student already exists');
  }

  console.log('\nDemo users created:');
  console.log('Admin: admin@demo.local / AdminPass123!');
  console.log('Alumni: alumni@demo.local / AlumniPass123! (verified)');
  console.log('Student: student@demo.local / StudentPass123!');

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
