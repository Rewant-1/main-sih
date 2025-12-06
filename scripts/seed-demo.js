/**
 * Seed Demo Data Script
 * Populates the database with realistic Indian-context demo data
 * Run with: npm run seed-demo
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const UserModel = require('./src/model/model.user');
const AlumniModel = require('./src/model/model.alumni');
const StudentModel = require('./src/model/model.student');
const JobModel = require('./src/model/model.job');
const EventModel = require('./src/model/model.event');
const CampaignModel = require('./src/model/model.campaign');
const SuccessStoryModel = require('./src/model/model.successStory');
const SurveyModel = require('./src/model/model.survey');

const { MONGO_URI } = require('./config');

// Indian names for realistic data
const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Kavya', 'Arjun', 'Meera',
    'Karan', 'Pooja', 'Siddharth', 'Ritika', 'Aditya', 'Nisha', 'Varun', 'Shruti', 'Nikhil', 'Divya'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Gupta', 'Singh', 'Reddy', 'Nair', 'Joshi', 'Verma', 'Iyer',
    'Mehta', 'Rao', 'Agarwal', 'Pillai', 'Chatterjee', 'Mishra', 'Das', 'Malhotra', 'Kapoor', 'Shah'];

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT'];
const degrees = ['B.Tech', 'M.Tech', 'MBA', 'Ph.D'];
const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'AWS', 'Docker', 'Kubernetes', 'Java', 'SQL', 'MongoDB'];
const companies = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Wipro', 'Accenture', 'Deloitte', 'Goldman Sachs', 'JP Morgan', 'Adobe'];
const designations = ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'Architect', 'CTO', 'Founder'];
const cities = [
    { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSkills() {
    const count = Math.floor(Math.random() * 5) + 2;
    const shuffled = [...skills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

async function seedDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Promise.all([
            UserModel.deleteMany({}),
            AlumniModel.deleteMany({}),
            StudentModel.deleteMany({}),
            JobModel.deleteMany({}),
            EventModel.deleteMany({}),
            CampaignModel.deleteMany({}),
            SuccessStoryModel.deleteMany({}),
            SurveyModel.deleteMany({}),
        ]);

        // Create Admin user
        console.log('👤 Creating admin user...');
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const adminUser = await UserModel.create({
            name: 'Admin User',
            email: 'admin@college.edu',
            passwordHash: adminPasswordHash,
            userType: 'Admin',
        });
        console.log('✅ Admin created: admin@college.edu / admin123');

        // Create Alumni users
        console.log('👥 Creating alumni users...');
        const alumniUsers = [];
        const alumniProfiles = [];

        for (let i = 0; i < 20; i++) {
            const firstName = randomElement(firstNames);
            const lastName = randomElement(lastNames);
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
            const passwordHash = await bcrypt.hash('password123', 10);
            const gradYear = 2018 + Math.floor(Math.random() * 6); // 2018-2023
            const location = randomElement(cities);

            const user = await UserModel.create({
                name: `${firstName} ${lastName}`,
                email,
                passwordHash,
                userType: 'Alumni',
            });
            alumniUsers.push(user);

            const alumni = await AlumniModel.create({
                userId: user._id,
                verified: Math.random() > 0.3, // 70% verified
                graduationYear: gradYear,
                degreeUrl: `https://drive.google.com/degree/${user._id}`,
                skills: randomSkills(),
                degree: randomElement(degrees),
                department: randomElement(departments),
                enrollmentNumber: `${randomElement(departments).substring(0, 3).toUpperCase()}${gradYear}${String(i + 1).padStart(3, '0')}`,
                employmentStatus: 'employed',
                currentCompany: randomElement(companies),
                designation: randomElement(designations),
                industry: 'Technology',
                linkedIn: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                github: `https://github.com/${firstName.toLowerCase()}${i}`,
                location: {
                    city: location.city,
                    state: location.state,
                    country: 'India',
                    coordinates: { lat: location.lat, lng: location.lng },
                },
                phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
                profileCompletion: Math.floor(60 + Math.random() * 40),
            });
            alumniProfiles.push(alumni);

            // Link profile to user
            user.profileDetails = alumni._id;
            await user.save();
        }
        console.log(`✅ Created ${alumniUsers.length} alumni users`);

        // Create Jobs
        console.log('💼 Creating jobs...');
        const jobTitles = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'ML Engineer'];
        for (let i = 0; i < 10; i++) {
            await JobModel.create({
                title: randomElement(jobTitles),
                company: randomElement(companies),
                location: randomElement(cities).city,
                type: randomElement(['full-time', 'part-time', 'internship', 'contract']),
                description: 'We are looking for talented individuals to join our team.',
                skillsRequired: randomSkills().slice(0, 4),
                postedBy: randomElement(alumniProfiles)._id,
            });
        }
        console.log('✅ Created 10 jobs');

        // Create Events
        console.log('📅 Creating events...');
        const eventTypes = ['webinar', 'meetup', 'hackathon', 'workshop', 'conference'];
        const eventTitles = ['AI/ML Workshop', 'Career Fair 2025', 'Alumni Meetup', 'Tech Talk', 'Startup Summit', 'Hackathon 2025'];
        for (let i = 0; i < 6; i++) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 60) + 10);
            await EventModel.create({
                title: eventTitles[i],
                description: 'Join us for an exciting event!',
                date: futureDate,
                venue: `${randomElement(cities).city}, India`,
                createdBy: adminUser._id,
                registeredUsers: alumniUsers.slice(0, Math.floor(Math.random() * 10) + 5).map(u => u._id),
            });
        }
        console.log('✅ Created 6 events');

        // Create Campaigns
        console.log('🎯 Creating campaigns...');
        const campaignData = [
            { title: 'Green Campus Initiative', category: 'sustainability', target: 500000 },
            { title: 'Student Scholarship Fund', category: 'scholarship', target: 1000000 },
            { title: 'New Library Building', category: 'infrastructure', target: 2000000 },
            { title: 'Research Lab Equipment', category: 'research', target: 750000 },
        ];
        for (const camp of campaignData) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3);
            const raised = Math.floor(Math.random() * camp.target * 0.7);

            await CampaignModel.create({
                title: camp.title,
                tagline: `Support our ${camp.title.toLowerCase()}`,
                description: `Help us achieve our goal for ${camp.title}. Your contribution makes a difference!`,
                category: camp.category,
                targetAmount: camp.target,
                raisedAmount: raised,
                minimumDonation: 100,
                currency: 'INR',
                startDate,
                endDate,
                beneficiaries: 'Students and Faculty',
                expectedOutcomes: ['Improved facilities', 'Better learning environment', 'Enhanced research capabilities'],
                organizer: adminUser._id,
                status: 'active',
                isVerified: true,
                supportersCount: Math.floor(raised / 5000),
            });
        }
        console.log('✅ Created 4 campaigns');

        // Create Success Stories
        console.log('🌟 Creating success stories...');
        const storyCategories = ['career_growth', 'entrepreneurship', 'research_innovation', 'social_impact'];
        for (let i = 0; i < 5; i++) {
            const alumni = randomElement(alumniProfiles);
            const user = alumniUsers.find(u => u._id.equals(alumni.userId));
            await SuccessStoryModel.create({
                title: `From Campus to ${randomElement(['CTO', 'Founder', 'Tech Lead', 'Director'])}`,
                content: `My journey from being a student to becoming a successful professional has been incredible. The skills I learned and connections I made at this institution shaped my career.`,
                excerpt: 'An inspiring journey of growth and success.',
                category: randomElement(storyCategories),
                alumni: alumni._id,
                alumniName: user.name,
                alumniDesignation: alumni.designation,
                alumniCompany: alumni.currentCompany,
                graduationYear: alumni.graduationYear,
                tags: ['success', 'career', 'inspiration'],
                views: Math.floor(Math.random() * 500) + 100,
                status: 'published',
                isFeatured: i < 2,
                isVerified: true,
                createdBy: adminUser._id,
                publishedAt: new Date(),
            });
        }
        console.log('✅ Created 5 success stories');

        // Create Survey
        console.log('📋 Creating survey...');
        await SurveyModel.create({
            title: 'Alumni Feedback Survey 2025',
            description: 'Help us improve by sharing your feedback',
            questions: [
                { text: 'How would you rate your overall experience?', type: 'rating', isRequired: true, order: 1 },
                { text: 'What skills do you think should be added to the curriculum?', type: 'long', isRequired: false, order: 2 },
                { text: 'Would you recommend our institution?', type: 'single_choice', options: ['Yes', 'No', 'Maybe'], isRequired: true, order: 3 },
            ],
            targetAudience: 'alumni',
            status: 'active',
            isAnonymous: true,
            createdBy: adminUser._id,
        });
        console.log('✅ Created 1 survey');

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin Login:');
        console.log('  Email: admin@college.edu');
        console.log('  Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedDatabase();
