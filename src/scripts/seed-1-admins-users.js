/**
 * SEED SCRIPT 1: Admins + Users
 * Creates: 5 Colleges, 10 Admins (2 per college), 500 Users (Students + Alumni)
 * 
 * Run: node src/scripts/seed-1-admins-users.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const AdminModel = require('../model/model.admin');
const UserModel = require('../model/model.user');

// ============================================
// COLLEGE DATA - 5 Premier Indian Institutions
// ============================================
const COLLEGES = [
    {
        adminId: 'FOT_DU',
        instituteName: 'Faculty of Technology, University of Delhi',
        adminType: 'college',
        address: {
            street: 'Chhatra Marg',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India'
        },
        phone: '+91-11-27666001',
        bio: 'Newly established engineering faculty of Delhi University'
    },
    {
        adminId: 'STEPHENS_DU',
        instituteName: "St. Stephen's College",
        adminType: 'college',
        address: {
            street: 'University Enclave',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India'
        },
        phone: '+91-11-27667200',
        bio: 'Premier liberal arts and science college established in 1881'
    },
    {
        adminId: 'SRCC_DU',
        instituteName: 'Shri Ram College of Commerce',
        adminType: 'college',
        address: {
            street: 'Maurice Nagar',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India'
        },
        phone: '+91-11-27667905',
        bio: 'India\'s premier institution for commerce and economics'
    },
    {
        adminId: 'MIRANDA_DU',
        instituteName: 'Miranda House',
        adminType: 'college',
        address: {
            street: 'University Campus',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India'
        },
        phone: '+91-11-27667367',
        bio: 'Top-ranked women\'s college in India'
    },
    {
        adminId: 'HINDU_DU',
        instituteName: 'Hindu College',
        adminType: 'college',
        address: {
            street: 'University Enclave',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India'
        },
        phone: '+91-11-27667184',
        bio: 'One of the oldest and most distinguished colleges in India'
    }
];

// ============================================
// INDIAN NAMES DATA
// ============================================
const FIRST_NAMES_MALE = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
    'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Advait', 'Dhruv', 'Kabir',
    'Ritvik', 'Aarush', 'Kian', 'Darsh', 'Veer', 'Rohan', 'Rahul', 'Amit',
    'Vikram', 'Suresh', 'Rajesh', 'Pradeep', 'Manoj', 'Sanjay', 'Deepak',
    'Karthik', 'Venkat', 'Harish', 'Ganesh', 'Ravi', 'Kumar', 'Prasad',
    'Naveen', 'Sunil', 'Arun', 'Varun', 'Tarun', 'Nikhil', 'Ankit', 'Mohit',
    'Rohit', 'Sahil', 'Kunal', 'Akash', 'Yash'
];

const FIRST_NAMES_FEMALE = [
    'Aadhya', 'Diya', 'Pihu', 'Pari', 'Ananya', 'Aanya', 'Myra', 'Sara',
    'Ira', 'Anika', 'Priya', 'Neha', 'Pooja', 'Shruti', 'Divya', 'Kavya',
    'Nisha', 'Anjali', 'Sneha', 'Meera', 'Riya', 'Tanya', 'Simran', 'Kajal',
    'Deepika', 'Aishwarya', 'Lakshmi', 'Padma', 'Gayatri', 'Saraswati',
    'Bhavya', 'Ishita', 'Kiara', 'Mahi', 'Navya', 'Shanaya', 'Sana', 'Zara',
    'Kritika', 'Mansi', 'Pallavi', 'Riddhi', 'Siddhi', 'Tanvi', 'Vrinda',
    'Yamini', 'Asha', 'Bhavana', 'Charvi', 'Drishti'
];

const LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Rao',
    'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Mukherjee', 'Banerjee',
    'Chatterjee', 'Das', 'Ghosh', 'Bose', 'Sen', 'Joshi', 'Kulkarni',
    'Deshpande', 'Patil', 'Deshmukh', 'Chavan', 'Pawar', 'Thakur', 'Chauhan',
    'Yadav', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Shukla', 'Srivastava',
    'Agarwal', 'Jain', 'Goel', 'Arora', 'Kapoor', 'Malhotra', 'Khanna',
    'Mehra', 'Bhatia', 'Sethi', 'Anand', 'Bajaj', 'Chopra', 'Dhawan'
];

const DEPARTMENTS = [
    'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Chemical Engineering', 'Electronics & Communication',
    'Information Technology', 'Biotechnology', 'Aerospace Engineering',
    'Data Science', 'Artificial Intelligence', 'Cybersecurity'
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEmail = (firstName, lastName, domain) => {
    const random = Math.floor(Math.random() * 1000);
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${random}@${domain}`.replace(/\s/g, '');
};

const generateUsername = (firstName, lastName) => {
    const random = Math.floor(Math.random() * 10000);
    return `${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 3)}${random}`;
};

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seedAdminsAndUsers() {
    try {
        console.log('🚀 Starting Seed Script 1: Admins + Users');
        console.log('=========================================\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGO_DB_NAME || 'sih_2025'
        });
        console.log(`✅ Connected to MongoDB (Database: ${process.env.MONGO_DB_NAME || 'sih_2025'})\n`);

        // Clear existing data (fresh start)
        console.log('🗑️  Clearing existing Admins and Users...');
        await AdminModel.deleteMany({});
        await UserModel.deleteMany({});
        console.log('✅ Cleared existing data\n');

        const hashedPassword = await bcrypt.hash('Password@123', 10);
        const createdAdmins = [];
        const createdUsers = [];

        // ============================================
        // CREATE ADMINS (2 per college = 10 total)
        // ============================================
        console.log('👔 Creating Admins...');

        for (const college of COLLEGES) {
            // Admin 1 - Principal/Director
            const admin1 = await AdminModel.create({
                name: `Dr. ${getRandomElement(FIRST_NAMES_MALE)} ${getRandomElement(LAST_NAMES)}`,
                email: `principal@${college.adminId.toLowerCase().replace('_', '')}.edu.in`,
                password: hashedPassword,
                adminType: college.adminType,
                instituteName: college.instituteName,
                adminId: college.adminId,
                address: college.address,
                phone: college.phone,
                bio: `Director of ${college.instituteName}`,
                isSuperAdmin: false,
                isActive: true,
                verified: true
            });

            // Admin 2 - Dean/HOD
            const admin2 = await AdminModel.create({
                name: `Prof. ${getRandomElement(FIRST_NAMES_MALE)} ${getRandomElement(LAST_NAMES)}`,
                email: `dean@${college.adminId.toLowerCase().replace('_', '')}.edu.in`,
                password: hashedPassword,
                adminType: college.adminType,
                instituteName: college.instituteName,
                adminId: college.adminId,
                address: college.address,
                phone: college.phone.replace(/9$/, '8'),
                bio: `Dean of Academic Affairs at ${college.instituteName}`,
                isSuperAdmin: false,
                isActive: true,
                verified: true
            });

            createdAdmins.push(admin1, admin2);
            console.log(`   ✅ ${college.instituteName}: 2 admins created`);
        }

        console.log(`\n📊 Total Admins Created: ${createdAdmins.length}\n`);

        // ============================================
        // CREATE USERS (100 per college = 500 total)
        // 60 Alumni + 40 Students per college
        // ============================================
        console.log('👥 Creating Users...');

        for (const college of COLLEGES) {
            const emailDomain = `${college.adminId.toLowerCase().replace('_', '')}.edu.in`;
            let collegeUsers = 0;

            // Create Alumni (60 per college) - Graduated 2019-2023
            for (let i = 0; i < 60; i++) {
                const isMale = Math.random() > 0.4;
                const firstName = isMale
                    ? getRandomElement(FIRST_NAMES_MALE)
                    : getRandomElement(FIRST_NAMES_FEMALE);
                const lastName = getRandomElement(LAST_NAMES);
                const graduationYear = getRandomInt(2019, 2023);

                const user = await UserModel.create({
                    name: `${firstName} ${lastName}`,
                    email: generateEmail(firstName, lastName, emailDomain),
                    username: generateUsername(firstName, lastName),
                    passwordHash: hashedPassword,
                    userType: 'Alumni',
                    adminId: college.adminId,
                    mokshaCoins: getRandomInt(100, 5000),
                    tags: [
                        { name: getRandomElement(DEPARTMENTS), awardedBy: college.adminId },
                        { name: `Batch ${graduationYear}`, awardedBy: college.adminId },
                        { name: isMale ? 'Male' : 'Female', awardedBy: college.adminId }
                    ],
                    createdAt: new Date(graduationYear, getRandomInt(0, 11), getRandomInt(1, 28))
                });

                createdUsers.push({ ...user.toObject(), graduationYear, department: getRandomElement(DEPARTMENTS) });
                collegeUsers++;
            }

            // Create Students (40 per college) - Currently studying
            for (let i = 0; i < 40; i++) {
                const isMale = Math.random() > 0.4;
                const firstName = isMale
                    ? getRandomElement(FIRST_NAMES_MALE)
                    : getRandomElement(FIRST_NAMES_FEMALE);
                const lastName = getRandomElement(LAST_NAMES);
                const admissionYear = getRandomInt(2021, 2024);

                const user = await UserModel.create({
                    name: `${firstName} ${lastName}`,
                    email: generateEmail(firstName, lastName, emailDomain),
                    username: generateUsername(firstName, lastName),
                    passwordHash: hashedPassword,
                    userType: 'Student',
                    adminId: college.adminId,
                    mokshaCoins: getRandomInt(50, 1000),
                    tags: [
                        { name: getRandomElement(DEPARTMENTS), awardedBy: college.adminId },
                        { name: `Batch ${admissionYear + 4}`, awardedBy: college.adminId },
                        { name: isMale ? 'Male' : 'Female', awardedBy: college.adminId }
                    ],
                    createdAt: new Date(admissionYear, getRandomInt(6, 8), getRandomInt(1, 30))
                });

                createdUsers.push({ ...user.toObject(), admissionYear, department: getRandomElement(DEPARTMENTS) });
                collegeUsers++;
            }

            console.log(`   ✅ ${college.instituteName}: ${collegeUsers} users created`);
        }

        console.log(`\n📊 Total Users Created: ${createdUsers.length}`);
        console.log(`   - Alumni: ${createdUsers.filter(u => u.userType === 'Alumni').length}`);
        console.log(`   - Students: ${createdUsers.filter(u => u.userType === 'Student').length}`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n=========================================');
        console.log('🎉 SEED SCRIPT 1 COMPLETED SUCCESSFULLY');
        console.log('=========================================');
        console.log(`   Colleges: ${COLLEGES.length}`);
        console.log(`   Admins: ${createdAdmins.length}`);
        console.log(`   Users: ${createdUsers.length}`);
        console.log('\n📝 Login Credentials:');
        console.log('   Password for all accounts: Password@123');
        console.log('\n👉 Run seed-2-profiles.js next\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error in seed script:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the seed
seedAdminsAndUsers();
