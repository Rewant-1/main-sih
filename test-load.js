const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Loading Alumni model...');
        const AlumniModel = require('./src/model/model.alumni');
        console.log('Alumni model loaded successfully');

        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.log('ERROR loading model:', e.message);
        console.log('Stack:', e.stack);
        await mongoose.disconnect();
        process.exit(1);
    }
}
test();
