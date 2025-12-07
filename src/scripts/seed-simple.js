/**
 * SIMPLE SEED SCRIPT - Delhi University Colleges
 * Creates: 5 Colleges, 10 Admins, 250 Users (Alumni + Students)
 * 
 * Run: node src/scripts/seed-simple.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const AdminModel = require('../model/model.admin');
const UserModel = require('../model/model.user');
const AlumniModel = require('../model/model.alumni');
const StudentModel = require('../model/model.student');

// ============================================
// DELHI UNIVERSITY COLLEGES
// ============================================
const COLLEGES = [
    {
        adminId: 'FOT_DU',
        instituteName: 'Faculty of Technology, University of Delhi',
        address: { street: 'Chhatra Marg', city: 'New Delhi', state: 'Delhi', country: 'India' },
        phone: '+91-11-27666001',
        bio: 'Newly established engineering faculty of Delhi University'
    },
    {
        adminId: 'STEPHENS_DU',
        instituteName: "St. Stephen's College",
        address: { street: 'University Enclave', city: 'New Delhi', state: 'Delhi', country: 'India' },
        phone: '+91-11-27667200',
        bio: 'Premier liberal arts and science college established in 1881'
    },
    {
        adminId: 'SRCC_DU',
        instituteName: 'Shri Ram College of Commerce',
        address: { street: 'Maurice Nagar', city: 'New Delhi', state: 'Delhi', country: 'India' },
        phone: '+91-11-27667905',
        bio: 'India\'s premier institution for commerce and economics'
    },
    {
        adminId: 'MIRANDA_DU',
        instituteName: 'Miranda House',
        address: { street: 'University Campus', city: 'New Delhi', state: 'Delhi', country: 'India' },
        phone: '+91-11-27667367',
        bio: 'Top-ranked women\'s college in India'
    },
    {
        adminId: 'HINDU_DU',
        instituteName: 'Hindu College',
        address: { street: 'University Enclave', city: 'New Delhi', state: 'Delhi', country: 'India' },
        phone: '+91-11-27667184',
        bio: 'One of the oldest and most distinguished colleges in India'
    }
];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Rohan', 'Rahul', 'Amit', 'Vikram', 'Priya', 'Neha', 'Pooja', 'Shruti', 'Divya', 'Kavya', 'Nisha', 'Anjali', 'Sneha', 'Meera', 'Riya', 'Tanya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Rao', 'Joshi', 'Mishra'];
const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Google India', 'Microsoft India', 'Amazon India', 'Flipkart', 'Paytm'];
const SKILLS = ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'AWS', 'Java', 'Machine Learning'];
const CITIES = [
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 }
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedDatabase() {
    try {
        console.log('🚀 Starting Simple Seed Script');
        console.log('==============================\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear all data
        console.log('🗑️  Clearing existing data...');
        await AdminModel.deleteMany({});
        await UserModel.deleteMany({});
        await AlumniModel.deleteMany({});
        await StudentModel.deleteMany({});
        console.log('✅ Cleared\n');

        const hashedPassword = await bcrypt.hash('Password@123', 10);

        // ============================================
        // CREATE ADMINS (2 per college = 10 total)
        // ============================================
        console.log('👔 Creating Admins...');
        for (const college of COLLEGES) {
            await AdminModel.create({
                name: `Dr. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
                email: `principal@${college.adminId.toLowerCase().replace('_', '')}.edu.in`,
                password: hashedPassword,
                adminType: 'college',
                instituteName: college.instituteName,
                adminId: college.adminId,
                address: college.address,
                phone: college.phone,
                bio: college.bio,
                isActive: true,
                verified: true
            });
            await AdminModel.create({
                name: `Prof. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
                email: `dean@${college.adminId.toLowerCase().replace('_', '')}.edu.in`,
                password: hashedPassword,
                adminType: 'college',
                instituteName: college.instituteName,
                adminId: college.adminId,
                address: college.address,
                phone: college.phone,
                bio: `Dean at ${college.instituteName}`,
                isActive: true,
                verified: true
            });
            console.log(`   ✅ ${college.instituteName}: 2 admins`);
        }

        // ============================================
        // CREATE USERS (50 per college = 250 total)
        // 30 Alumni + 20 Students per college
        // ============================================
        console.log('\n👥 Creating Users...');
        for (const college of COLLEGES) {
            const emailDomain = `${college.adminId.toLowerCase().replace('_', '')}.edu.in`;

            // Create 30 Alumni per college
            for (let i = 0; i < 30; i++) {
                const firstName = getRandomElement(FIRST_NAMES);
                const lastName = getRandomElement(LAST_NAMES);
                const graduationYear = getRandomInt(2015, 2023);
                const location = getRandomElement(CITIES);
                const company = getRandomElement(COMPANIES);

                const user = await UserModel.create({
                    name: `${firstName} ${lastName}`,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@${emailDomain}`,
                    username: `${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 3)}${getRandomInt(1, 9999)}`,
                    passwordHash: hashedPassword,
                    userType: 'Alumni',
                    adminId: college.adminId,
                    mokshaCoins: getRandomInt(100, 1000),
                    tags: []
                });

                await AlumniModel.create({
                    userId: user._id,
                    adminId: college.adminId,
                    verified: Math.random() > 0.3,
                    graduationYear: graduationYear,
                    degreeUrl: `https://storage.college.edu/degrees/${user._id}.pdf`,
                    skills: [getRandomElement(SKILLS), getRandomElement(SKILLS), getRandomElement(SKILLS)],
                    designation: getRandomElement(['Software Engineer', 'Product Manager', 'Data Scientist', 'Consultant']),
                    company: company,
                    location: {
                        city: location.city,
                        state: location.state,
                        country: 'India',
                        coordinates: { lat: location.lat, lng: location.lng }
                    },
                    phone: `+91-${getRandomInt(7000000000, 9999999999)}`,
                    bio: `Alumni from ${college.instituteName}, Class of ${graduationYear}`,
                    headline: `Working at ${company}`,
                    degree: 'B.Tech',
                    department: 'Computer Science',
                    enrollmentNumber: `${college.adminId.slice(0, 3)}${graduationYear}${getRandomInt(1000, 9999)}`,
                    experience: [{
                        title: 'Software Engineer',
                        company: company,
                        location: location.city,
                        startDate: new Date(graduationYear, 6, 1),
                        current: true
                    }],
                    education: [{
                        degree: 'B.Tech',
                        institution: college.instituteName,
                        field: 'Computer Science',
                        startYear: graduationYear - 4,
                        endYear: graduationYear
                    }],
                    privacySettings: {
                        showEmail: true,
                        showPhone: false,
                        showLocation: true,
                        profileVisibility: 'public'
                    }
                });
            }

            // Create 20 Students per college
            for (let i = 0; i < 20; i++) {
                const firstName = getRandomElement(FIRST_NAMES);
                const lastName = getRandomElement(LAST_NAMES);
                const admissionYear = getRandomInt(2021, 2024);

                const user = await UserModel.create({
                    name: `${firstName} ${lastName}`,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@${emailDomain}`,
                    username: `${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 3)}${getRandomInt(1, 9999)}`,
                    passwordHash: hashedPassword,
                    userType: 'Student',
                    adminId: college.adminId,
                    mokshaCoins: getRandomInt(50, 500),
                    tags: []
                });

                await StudentModel.create({
                    userId: user._id,
                    adminId: college.adminId,
                    academic: {
                        degreeType: 'B.Tech',
                        degreeName: 'Computer Science',
                        currentYear: Math.min(new Date().getFullYear() - admissionYear + 1, 4)
                    }
                });
            }

            console.log(`   ✅ ${college.instituteName}: 50 users (30 Alumni + 20 Students)`);
        }

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n==============================');
        console.log('🎉 SEED COMPLETED SUCCESSFULLY');
        console.log('==============================');
        console.log('   Colleges: 5 (Delhi University)');
        console.log('   Admins: 10 (2 per college)');
        console.log('   Users: 250 (50 per college)');
        console.log('   - Alumni: 150');
        console.log('   - Students: 100');
        console.log('\n📝 Login: Password@123 for all accounts\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedDatabase();
