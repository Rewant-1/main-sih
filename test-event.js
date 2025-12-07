// Test event creation directly
const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./src/model/model.event.js');

async function testEventCreation() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const eventData = {
            title: 'Test Event',
            date: new Date('2025-12-25T10:00:00'),
            venue: 'Test Venue',
            description: 'Test Description',
            adminId: 'test-admin-id',
            createdBy: null
        };

        console.log('Creating event with data:', JSON.stringify(eventData, null, 2));

        const newEvent = new Event(eventData);
        console.log('Event instance created, validating...');

        // Validate without saving
        const validationError = newEvent.validateSync();
        if (validationError) {
            console.error('Validation Error:', validationError.message);
            console.error('Error details:', JSON.stringify(validationError.errors, null, 2));
        } else {
            console.log('Validation passed!');
            const savedEvent = await newEvent.save();
            console.log('Event saved successfully:', savedEvent._id);

            // Clean up
            await Event.findByIdAndDelete(savedEvent._id);
            console.log('Test event deleted');
        }

    } catch (error) {
        console.error('Error:', error.name, error.message);
        if (error.errors) {
            console.error('Validation errors:', Object.keys(error.errors));
            for (const [field, err] of Object.entries(error.errors)) {
                console.error(`  ${field}: ${err.message}`);
            }
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testEventCreation();
