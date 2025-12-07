const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear cached models
        delete mongoose.connection.models['Alumni'];

        // Define a simple schema inline
        const testAlumniSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
            adminId: { type: String, required: true },
            graduationYear: { type: Number, required: true },
            degreeUrl: { type: String, required: true }
        });

        const TestAlumni = mongoose.model('TestAlumni', testAlumniSchema);

        const doc = await TestAlumni.create({
            userId: new mongoose.Types.ObjectId(),
            adminId: 'TEST_COL',
            graduationYear: 2020,
            degreeUrl: 'https://test.com/degree.pdf'
        });
        console.log('Created:', doc._id);

        await TestAlumni.deleteOne({ _id: doc._id });
        console.log('SUCCESS - Mongoose is working!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.log('ERROR:', e.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}
test();
