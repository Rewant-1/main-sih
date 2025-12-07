const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const AlumniModel = require('./src/model/model.alumni');
        console.log('Model loaded');

        console.log('Creating test document...');
        const doc = await AlumniModel.create({
            userId: new mongoose.Types.ObjectId(),
            adminId: 'TEST_COL',
            verified: true,
            graduationYear: 2020,
            degreeUrl: 'https://test.com/degree.pdf'
        });
        console.log('SUCCESS! Created:', doc._id);

        await AlumniModel.deleteOne({ _id: doc._id });
        console.log('Deleted test doc');

        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.message);
        if (e.errors) {
            console.log('Validation errors:');
            Object.keys(e.errors).forEach(k => console.log('  ' + k + ': ' + e.errors[k].message));
        }
        await mongoose.disconnect();
        process.exit(1);
    }
}
test();
