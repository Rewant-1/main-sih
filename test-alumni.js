const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const AlumniModel = require('./src/model/model.alumni');

        // Test create
        const testAlumni = await AlumniModel.create({
            userId: new mongoose.Types.ObjectId(),
            adminId: 'TEST_COL',
            verified: true,
            graduationYear: 2020,
            degreeUrl: 'https://test.com/degree.pdf',
            skills: ['JavaScript'],
            experience: [{
                title: 'Software Engineer',
                company: 'Test Corp'
            }],
            education: [{
                degree: 'B.Tech',
                institution: 'Test University'
            }],
            privacySettings: {
                showEmail: true,
                showPhone: false,
                showLocation: true,
                profileVisibility: 'public'
            }
        });
        console.log('Alumni Created:', testAlumni._id);

        await AlumniModel.deleteOne({ _id: testAlumni._id });
        console.log('Test Alumni deleted');
        console.log('SUCCESS - Alumni model works correctly!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.message);
        if (e.errors) {
            Object.keys(e.errors).forEach(key => {
                console.log(`  Field: ${key}, Message: ${e.errors[key].message}`);
            });
        }
        await mongoose.disconnect();
        process.exit(1);
    }
}
test();
