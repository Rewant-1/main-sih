/**
 * SEED SCRIPT 2: Profiles (Alumni + Student + AlumniCards)
 * Creates: Detailed profiles for all users created in Script 1
 * 
 * Run: node src/scripts/seed-2-profiles.js
 * Prerequisite: Run seed-1-admins-users.js first
 */

const mongoose = require('mongoose');
require('dotenv').config();

const UserModel = require('../model/model.user');
const AlumniModel = require('../model/model.alumni');
const StudentModel = require('../model/model.student');
const AlumniCardModel = require('../model/model.alumniCard');

// ============================================
// INDIAN COMPANIES DATA (5 years - 2019-2024)
// ============================================
const TOP_COMPANIES = [
    { name: 'Tata Consultancy Services', industry: 'IT Services' },
    { name: 'Infosys', industry: 'IT Services' },
    { name: 'Wipro', industry: 'IT Services' },
    { name: 'HCL Technologies', industry: 'IT Services' },
    { name: 'Tech Mahindra', industry: 'IT Services' },
    { name: 'Reliance Industries', industry: 'Conglomerate' },
    { name: 'HDFC Bank', industry: 'Banking' },
    { name: 'ICICI Bank', industry: 'Banking' },
    { name: 'State Bank of India', industry: 'Banking' },
    { name: 'Bajaj Finance', industry: 'Finance' },
    { name: 'Google India', industry: 'Technology' },
    { name: 'Microsoft India', industry: 'Technology' },
    { name: 'Amazon India', industry: 'E-commerce' },
    { name: 'Flipkart', industry: 'E-commerce' },
    { name: 'Paytm', industry: 'Fintech' },
    { name: 'PhonePe', industry: 'Fintech' },
    { name: 'Razorpay', industry: 'Fintech' },
    { name: 'Zomato', industry: 'Food Tech' },
    { name: 'Swiggy', industry: 'Food Tech' },
    { name: 'Ola', industry: 'Transportation' },
    { name: 'BYJU\'S', industry: 'EdTech' },
    { name: 'Unacademy', industry: 'EdTech' },
    { name: 'Zerodha', industry: 'Fintech' },
    { name: 'Dream11', industry: 'Gaming' },
    { name: 'Freshworks', industry: 'SaaS' },
    { name: 'Zoho', industry: 'SaaS' },
    { name: 'Myntra', industry: 'E-commerce' },
    { name: 'Nykaa', industry: 'E-commerce' },
    { name: 'CRED', industry: 'Fintech' },
    { name: 'Meesho', industry: 'E-commerce' }
];

const DESIGNATIONS = [
    'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
    'Tech Lead', 'Engineering Manager', 'Product Manager', 'Senior Product Manager',
    'Data Scientist', 'Senior Data Scientist', 'ML Engineer', 'AI Researcher',
    'DevOps Engineer', 'Cloud Architect', 'Solutions Architect',
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Mobile Developer', 'iOS Developer', 'Android Developer',
    'Business Analyst', 'Consultant', 'Senior Consultant', 'Manager',
    'Associate', 'Senior Associate', 'Vice President', 'Director',
    'Founder', 'Co-Founder', 'CTO', 'CEO'
];

const SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django',
    'Flask', 'Spring Boot', 'FastAPI', 'GraphQL', 'REST APIs',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI',
    'Agile', 'Scrum', 'Project Management', 'Leadership',
    'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux',
    'Blockchain', 'Web3', 'Solidity', 'Smart Contracts',
    'Cybersecurity', 'Ethical Hacking', 'Penetration Testing'
];

const INDIAN_CITIES = [
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
    { city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
    { city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
    { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 }
];

const DEPARTMENTS = [
    'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Chemical Engineering', 'Electronics & Communication',
    'Information Technology', 'Biotechnology', 'Aerospace Engineering',
    'Data Science', 'Artificial Intelligence', 'Cybersecurity'
];

const DEGREE_TYPES = ['B.Tech', 'M.Tech', 'B.E.', 'M.E.', 'PhD'];

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateTimeline = (graduationYear) => {
    const timeline = [];
    const startYear = graduationYear - 4;

    // Education entry
    timeline.push({
        type: 'education',
        title: `${getRandomElement(DEGREE_TYPES)} in ${getRandomElement(DEPARTMENTS)}`,
        organization: 'College Name',
        startDate: new Date(startYear, 6, 1),
        endDate: new Date(graduationYear, 5, 30),
        description: 'Completed undergraduate degree with honors'
    });

    // Work entries
    const yearsWorking = new Date().getFullYear() - graduationYear;
    let currentYear = graduationYear;

    for (let i = 0; i < Math.min(yearsWorking, 3); i++) {
        const company = getRandomElement(TOP_COMPANIES);
        const duration = getRandomInt(1, 2);
        timeline.push({
            type: 'work',
            title: getRandomElement(DESIGNATIONS),
            organization: company.name,
            startDate: new Date(currentYear, getRandomInt(0, 11), 1),
            endDate: new Date(currentYear + duration, getRandomInt(0, 11), 28),
            description: `Worked on key projects in ${company.industry}`
        });
        currentYear += duration;
    }

    // Achievement
    if (Math.random() > 0.5) {
        timeline.push({
            type: 'achievement',
            title: getRandomElement([
                'Best Employee Award', 'Innovation Award', 'Hackathon Winner',
                'Published Research Paper', 'Open Source Contributor',
                'Speaker at Tech Conference', 'Patent Filed'
            ]),
            date: new Date(getRandomInt(graduationYear, 2024), getRandomInt(0, 11), getRandomInt(1, 28)),
            description: 'Recognized for exceptional contribution'
        });
    }

    return timeline;
};

const generateExperience = (graduationYear) => {
    const experience = [];
    const yearsWorking = new Date().getFullYear() - graduationYear;
    let currentYear = graduationYear;

    for (let i = 0; i < Math.min(yearsWorking + 1, 4); i++) {
        const company = getRandomElement(TOP_COMPANIES);
        const duration = getRandomInt(1, 3);
        const isCurrentJob = i === Math.min(yearsWorking, 3) && currentYear + duration >= 2024;

        experience.push({
            company: company.name,
            title: getRandomElement(DESIGNATIONS),
            location: getRandomElement(INDIAN_CITIES).city,
            startDate: new Date(currentYear, getRandomInt(0, 5), 1),
            endDate: isCurrentJob ? null : new Date(currentYear + duration, getRandomInt(6, 11), 28),
            current: isCurrentJob,
            description: `Key responsibilities in ${company.industry} domain. Worked with cross-functional teams on high-impact projects.`
        });

        if (isCurrentJob) break;
        currentYear += duration;
    }

    return experience;
};

const generateEducation = (graduationYear, department) => {
    return [{
        institution: 'From User College',
        degree: getRandomElement(DEGREE_TYPES),
        field: department,
        startYear: graduationYear - 4,
        endYear: graduationYear,
        grade: `${(Math.random() * 2 + 7).toFixed(2)} CGPA`,
        activities: getRandomElements([
            'Technical Club Member', 'Sports Team', 'Cultural Secretary',
            'Placement Coordinator', 'Research Assistant', 'Teaching Assistant',
            'Hackathon Organizer', 'NSS Volunteer', 'Student Council'
        ], 3)
    }];
};

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seedProfiles() {
    try {
        console.log('🚀 Starting Seed Script 2: Profiles');
        console.log('====================================\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGO_DB_NAME || 'sih_2025'
        });
        console.log(`✅ Connected to MongoDB (Database: ${process.env.MONGO_DB_NAME || 'sih_2025'})\n`);

        // Clear existing profiles
        console.log('🗑️  Clearing existing profiles...');
        await AlumniModel.deleteMany({});
        await StudentModel.deleteMany({});
        await AlumniCardModel.deleteMany({});
        console.log('✅ Cleared existing profiles\n');

        // Get all users
        const users = await UserModel.find({});
        const alumni = users.filter(u => u.userType === 'Alumni');
        const students = users.filter(u => u.userType === 'Student');

        console.log(`📊 Found ${alumni.length} Alumni and ${students.length} Students\n`);

        // ============================================
        // CREATE ALUMNI PROFILES
        // ============================================
        console.log('👔 Creating Alumni Profiles...');
        let alumniProfileCount = 0;
        let alumniCardCount = 0;

        for (const user of alumni) {
            const graduationYear = getRandomInt(2019, 2023);
            const department = getRandomElement(DEPARTMENTS);
            const currentLocation = getRandomElement(INDIAN_CITIES);
            const currentCompany = getRandomElement(TOP_COMPANIES);
            const designation = getRandomElement(DESIGNATIONS);
            const isVerified = Math.random() > 0.2; // 80% verified

            const alumniProfile = await AlumniModel.create({
                userId: user._id,
                adminId: user.adminId,
                verified: isVerified,
                graduationYear: graduationYear,
                degreeUrl: `https://storage.college.edu/degrees/${user._id}.pdf`,
                skills: getRandomElements(SKILLS, getRandomInt(5, 12)),
                designation: designation,
                company: currentCompany.name,
                location: {
                    city: currentLocation.city,
                    state: currentLocation.state,
                    country: 'India',
                    coordinates: {
                        lat: currentLocation.lat + (Math.random() * 0.1 - 0.05),
                        lng: currentLocation.lng + (Math.random() * 0.1 - 0.05)
                    }
                },
                phone: `+91-${getRandomInt(7000000000, 9999999999)}`,
                linkedIn: `https://linkedin.com/in/${user.username}`,
                github: Math.random() > 0.4 ? `https://github.com/${user.username}` : undefined,
                twitter: Math.random() > 0.7 ? `https://twitter.com/${user.username}` : undefined,
                portfolio: Math.random() > 0.6 ? `https://${user.username}.dev` : undefined,
                branch: department,
                degree: getRandomElement(DEGREE_TYPES),
                department: department,
                enrollmentNumber: `${user.adminId.slice(0, 3)}${graduationYear}${getRandomInt(1000, 9999)}`,
                bio: `Passionate ${department} professional with expertise in ${getRandomElements(SKILLS, 3).join(', ')}. Currently working as ${designation} at ${currentCompany.name}.`,
                headline: `${designation} at ${currentCompany.name} | ${department}`,
                photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${getRandomInt(1, 99)}.jpg`,
                timeline: generateTimeline(graduationYear),
                experience: generateExperience(graduationYear),
                education: generateEducation(graduationYear, department),
                employmentStatus: getRandomElement(['employed', 'self-employed', 'freelancer']),
                currentCompany: currentCompany.name,
                industry: currentCompany.industry,
                socialLinks: {
                    linkedin: `https://linkedin.com/in/${user.username}`,
                    github: Math.random() > 0.4 ? `https://github.com/${user.username}` : undefined,
                    twitter: Math.random() > 0.7 ? `https://twitter.com/${user.username}` : undefined
                },
                privacySettings: {
                    showEmail: Math.random() > 0.3,
                    showPhone: Math.random() > 0.5,
                    showLocation: Math.random() > 0.2,
                    profileVisibility: getRandomElement(['public', 'alumni-only', 'connections-only'])
                },
                profileViews: getRandomInt(10, 500),
                profileCompletion: getRandomInt(70, 100)
            });

            // Update user with profileDetails
            user.profileDetails = alumniProfile._id;
            await user.save();
            alumniProfileCount++;

            // Create Alumni Card for verified alumni (70% chance)
            if (isVerified && Math.random() > 0.3) {
                const validYears = getRandomInt(1, 5);
                await AlumniCardModel.create({
                    adminId: user.adminId,
                    alumniId: alumniProfile._id,
                    userId: user._id,
                    cardNumber: await AlumniCardModel.generateCardNumber(user.adminId.slice(0, 3)),
                    qrCode: {
                        data: `data:image/png;base64,${Buffer.from(user._id.toString()).toString('base64')}`,
                        generatedAt: new Date()
                    },
                    issuedAt: new Date(graduationYear, 6, 1),
                    validFrom: new Date(graduationYear, 6, 1),
                    validUntil: new Date(graduationYear + validYears, 6, 1),
                    status: new Date() > new Date(graduationYear + validYears, 6, 1) ? 'expired' : 'active',
                    cardType: getRandomElement(['digital', 'physical', 'both']),
                    usageCount: getRandomInt(0, 50)
                });
                alumniCardCount++;
            }
        }

        console.log(`   ✅ Created ${alumniProfileCount} Alumni Profiles`);
        console.log(`   ✅ Created ${alumniCardCount} Alumni Cards\n`);

        // ============================================
        // CREATE STUDENT PROFILES
        // ============================================
        console.log('🎓 Creating Student Profiles...');
        let studentProfileCount = 0;

        for (const user of students) {
            const admissionYear = getRandomInt(2021, 2024);
            const department = getRandomElement(DEPARTMENTS);
            const currentYear = new Date().getFullYear() - admissionYear + 1;

            const studentProfile = await StudentModel.create({
                userId: user._id,
                adminId: user.adminId,
                academic: {
                    degreeType: getRandomElement(['B.Tech', 'B.E.']),
                    degreeName: department,
                    currentYear: Math.min(currentYear, 4),
                    cgpa: (Math.random() * 3 + 6).toFixed(2),
                    semester: Math.min(currentYear * 2, 8)
                }
            });

            user.profileDetails = studentProfile._id;
            await user.save();
            studentProfileCount++;
        }

        console.log(`   ✅ Created ${studentProfileCount} Student Profiles\n`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('====================================');
        console.log('🎉 SEED SCRIPT 2 COMPLETED SUCCESSFULLY');
        console.log('====================================');
        console.log(`   Alumni Profiles: ${alumniProfileCount}`);
        console.log(`   Alumni Cards: ${alumniCardCount}`);
        console.log(`   Student Profiles: ${studentProfileCount}`);
        console.log('\n👉 Run seed-3-jobs-events.js next\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error in seed script:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedProfiles();
