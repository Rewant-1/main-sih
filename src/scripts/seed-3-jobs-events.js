/**
 * SEED SCRIPT 3: Jobs + Events + Posts
 * Creates: 200 Jobs, 100 Events, 300 Posts (5 years of data)
 * 
 * Run: node src/scripts/seed-3-jobs-events.js
 * Prerequisite: Run seed-1 and seed-2 first
 */

const mongoose = require('mongoose');
require('dotenv').config();

const AdminModel = require('../model/model.admin');
const UserModel = require('../model/model.user');
const AlumniModel = require('../model/model.alumni');
const JobModel = require('../model/model.job');
const EventModel = require('../model/model.event');
const PostModel = require('../model/model.post');

// ============================================
// JOB DATA
// ============================================
const JOB_TITLES = [
    'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer',
    'Data Scientist', 'Data Analyst', 'Data Engineer', 'ML Engineer',
    'Product Manager', 'Technical Product Manager', 'Associate Product Manager',
    'UI/UX Designer', 'Product Designer', 'UX Researcher',
    'QA Engineer', 'Test Automation Engineer', 'Performance Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer', 'Flutter Developer',
    'Security Engineer', 'Cybersecurity Analyst', 'Penetration Tester',
    'Solutions Architect', 'Enterprise Architect', 'Technical Architect',
    'Business Analyst', 'System Analyst', 'Technical Writer'
];

const COMPANIES = [
    { name: 'Google India', location: 'Bangalore', logo: 'https://logo.clearbit.com/google.com' },
    { name: 'Microsoft India', location: 'Hyderabad', logo: 'https://logo.clearbit.com/microsoft.com' },
    { name: 'Amazon India', location: 'Bangalore', logo: 'https://logo.clearbit.com/amazon.com' },
    { name: 'Meta India', location: 'Gurgaon', logo: 'https://logo.clearbit.com/meta.com' },
    { name: 'Apple India', location: 'Hyderabad', logo: 'https://logo.clearbit.com/apple.com' },
    { name: 'Flipkart', location: 'Bangalore', logo: 'https://logo.clearbit.com/flipkart.com' },
    { name: 'Paytm', location: 'Noida', logo: 'https://logo.clearbit.com/paytm.com' },
    { name: 'PhonePe', location: 'Bangalore', logo: 'https://logo.clearbit.com/phonepe.com' },
    { name: 'Razorpay', location: 'Bangalore', logo: 'https://logo.clearbit.com/razorpay.com' },
    { name: 'Zomato', location: 'Gurgaon', logo: 'https://logo.clearbit.com/zomato.com' },
    { name: 'Swiggy', location: 'Bangalore', logo: 'https://logo.clearbit.com/swiggy.com' },
    { name: 'CRED', location: 'Bangalore', logo: 'https://logo.clearbit.com/cred.club' },
    { name: 'Meesho', location: 'Bangalore', logo: 'https://logo.clearbit.com/meesho.com' },
    { name: 'Zerodha', location: 'Bangalore', logo: 'https://logo.clearbit.com/zerodha.com' },
    { name: 'Freshworks', location: 'Chennai', logo: 'https://logo.clearbit.com/freshworks.com' },
    { name: 'Zoho', location: 'Chennai', logo: 'https://logo.clearbit.com/zoho.com' },
    { name: 'TCS', location: 'Mumbai', logo: 'https://logo.clearbit.com/tcs.com' },
    { name: 'Infosys', location: 'Bangalore', logo: 'https://logo.clearbit.com/infosys.com' },
    { name: 'Wipro', location: 'Bangalore', logo: 'https://logo.clearbit.com/wipro.com' },
    { name: 'HCL Technologies', location: 'Noida', logo: 'https://logo.clearbit.com/hcltech.com' }
];

const SKILLS_REQUIRED = [
    ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    ['Python', 'Django', 'PostgreSQL', 'Redis'],
    ['Java', 'Spring Boot', 'Microservices', 'Kafka'],
    ['Go', 'Kubernetes', 'Docker', 'AWS'],
    ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    ['TypeScript', 'Angular', 'GraphQL', 'PostgreSQL'],
    ['React Native', 'Redux', 'Firebase', 'REST APIs'],
    ['Flutter', 'Dart', 'Firebase', 'SQLite'],
    ['AWS', 'Terraform', 'Jenkins', 'Linux'],
    ['Python', 'Data Analysis', 'Pandas', 'Tableau']
];

// ============================================
// EVENT DATA
// ============================================
const EVENT_TYPES = [
    { type: 'webinar', titles: ['Tech Talk:', 'Industry Insights:', 'Career Guidance:', 'Expert Session:'] },
    { type: 'workshop', titles: ['Hands-on Workshop:', 'Practical Session:', 'Skill Building:', 'Bootcamp:'] },
    { type: 'meetup', titles: ['Alumni Meet', 'Networking Event', 'Regional Gathering', 'Batch Reunion'] },
    { type: 'conference', titles: ['Annual Conference', 'Tech Summit', 'Innovation Day', 'Research Symposium'] },
    { type: 'cultural', titles: ['Annual Day', 'Cultural Fest', 'Talent Show', 'Music Night'] }
];

const EVENT_TOPICS = [
    'Building Scalable Systems', 'AI in Modern Business', 'Career in Product Management',
    'Startup Journey', 'Cloud Architecture Best Practices', 'Data Science for Beginners',
    'Interview Preparation', 'Resume Building', 'LinkedIn Optimization',
    'Work-Life Balance', 'Remote Work Tips', 'Leadership Skills',
    'Open Source Contribution', 'Research Opportunities', 'Higher Studies Abroad',
    'Entrepreneurship 101', 'Funding Your Startup', 'Building Your Personal Brand'
];

// ============================================
// POST DATA
// ============================================
const POST_TEMPLATES = [
    'Excited to announce that I just joined {company} as a {title}! Looking forward to this new chapter. 🚀',
    'Just completed a {course} course on {platform}. Highly recommend it to anyone interested in {topic}!',
    'Grateful for the amazing support from my alma mater. The skills I learned there have been invaluable in my career.',
    'Attending the {event} today. Great to reconnect with fellow alumni and share experiences!',
    'Proud to share that our team at {company} launched {product}. It\'s been an incredible journey!',
    'Looking for talented {role} to join our team at {company}. DM me if interested!',
    'Reflecting on my journey from campus to {company}. Hard work and persistence really pay off. 💪',
    'Just published an article on {topic}. Check it out and let me know your thoughts!',
    'Our batch reunion was amazing! So good to see everyone after {years} years. 🎉',
    'Mentoring session with current students was so fulfilling. Love giving back to the community.',
    'Completed {years} years at {company} today. Time flies when you\'re doing what you love!',
    'Big shoutout to my professor {professor} who inspired me to pursue {field}. Forever grateful! 🙏'
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDate = (startYear, endYear) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function seedJobsAndEvents() {
    try {
        console.log('🚀 Starting Seed Script 3: Jobs + Events + Posts');
        console.log('=================================================\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGO_DB_NAME || 'sih_2025'
        });
        console.log(`✅ Connected to MongoDB (Database: ${process.env.MONGO_DB_NAME || 'sih_2025'})\n`);

        // Clear existing data
        console.log('🗑️  Clearing existing Jobs, Events, Posts...');
        await JobModel.deleteMany({});
        await EventModel.deleteMany({});
        await PostModel.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Get admins and alumni for references
        const admins = await AdminModel.find({});
        const alumniUsers = await UserModel.find({ userType: 'Alumni' });
        const alumniProfiles = await AlumniModel.find({});

        console.log(`📊 Found ${admins.length} Admins and ${alumniUsers.length} Alumni\n`);

        // Group by adminId
        const adminsByCollege = {};
        admins.forEach(admin => {
            if (!adminsByCollege[admin.adminId]) {
                adminsByCollege[admin.adminId] = [];
            }
            adminsByCollege[admin.adminId].push(admin);
        });

        const alumniByCollege = {};
        alumniUsers.forEach(user => {
            if (!alumniByCollege[user.adminId]) {
                alumniByCollege[user.adminId] = [];
            }
            alumniByCollege[user.adminId].push(user);
        });

        // ============================================
        // CREATE JOBS (40 per college = 200 total)
        // ============================================
        console.log('💼 Creating Jobs...');
        let jobCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeAlumni = alumniByCollege[adminId] || [];

            for (let i = 0; i < 40; i++) {
                const company = getRandomElement(COMPANIES);
                const title = getRandomElement(JOB_TITLES);
                const skills = getRandomElement(SKILLS_REQUIRED);
                const postedDate = getRandomDate(2019, 2024);
                const isActive = postedDate > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                const postedBy = collegeAlumni.length > 0 ? getRandomElement(collegeAlumni) : null;

                await JobModel.create({
                    adminId: adminId,
                    title: title,
                    company: company.name,
                    companyLogo: company.logo,
                    location: company.location,
                    type: getRandomElement(['full-time', 'part-time', 'internship', 'contract']),
                    mode: getRandomElement(['remote', 'hybrid', 'onsite']),
                    description: `We are looking for a talented ${title} to join our team at ${company.name}. You will be working on cutting-edge technologies and solving complex problems alongside brilliant minds.`,
                    requirements: [
                        `${getRandomInt(2, 8)}+ years of experience in ${skills[0]}`,
                        `Strong proficiency in ${skills.slice(1, 3).join(' and ')}`,
                        'Excellent problem-solving skills',
                        'Good communication and teamwork abilities',
                        `Experience with ${skills[3]} is a plus`
                    ],
                    responsibilities: [
                        'Design and implement scalable solutions',
                        'Collaborate with cross-functional teams',
                        'Mentor junior team members',
                        'Participate in code reviews and architectural discussions',
                        'Contribute to technical documentation'
                    ],
                    skillsRequired: skills,
                    experience: {
                        min: getRandomInt(0, 5),
                        max: getRandomInt(6, 15)
                    },
                    salary: {
                        min: getRandomInt(5, 20) * 100000,
                        max: getRandomInt(25, 80) * 100000,
                        currency: 'INR',
                        period: 'yearly'
                    },
                    benefits: getRandomElements([
                        'Health Insurance', 'Stock Options', 'Flexible Hours',
                        'Remote Work', 'Learning Budget', 'Gym Membership',
                        'Free Meals', 'Annual Bonus', 'Parental Leave'
                    ], getRandomInt(3, 6)),
                    postedBy: postedBy ? postedBy._id : null,
                    status: isActive ? 'active' : getRandomElement(['closed', 'filled']),
                    isOpen: isActive,
                    applicationDeadline: new Date(postedDate.getTime() + 60 * 24 * 60 * 60 * 1000),
                    applicants: [],
                    views: getRandomInt(50, 2000),
                    createdAt: postedDate,
                    updatedAt: postedDate
                });
                jobCount++;
            }
            console.log(`   ✅ ${adminId}: 40 jobs created`);
        }

        console.log(`\n📊 Total Jobs Created: ${jobCount}\n`);

        // ============================================
        // CREATE EVENTS (20 per college = 100 total)
        // ============================================
        console.log('📅 Creating Events...');
        let eventCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeAdmins = adminsByCollege[adminId];

            for (let i = 0; i < 20; i++) {
                const eventType = getRandomElement(EVENT_TYPES);
                const topic = getRandomElement(EVENT_TOPICS);
                const eventDate = getRandomDate(2019, 2025);
                const isUpcoming = eventDate > new Date();
                const createdBy = getRandomElement(collegeAdmins);

                await EventModel.create({
                    adminId: adminId,
                    title: `${getRandomElement(eventType.titles)} ${topic}`,
                    description: `Join us for an exciting ${eventType.type} on "${topic}". This event is designed to provide valuable insights and networking opportunities for our alumni community.`,
                    type: eventType.type,
                    category: getRandomElement(['career', 'technical', 'networking', 'cultural', 'sports']),
                    date: eventDate,
                    startTime: `${getRandomInt(9, 18)}:00`,
                    endTime: `${getRandomInt(19, 22)}:00`,
                    duration: getRandomInt(60, 180),
                    venue: {
                        name: getRandomElement([
                            'Main Auditorium', 'Conference Hall A', 'Seminar Room 101',
                            'Virtual - Zoom', 'Virtual - Google Meet', 'Campus Lawn'
                        ]),
                        address: eventType.type === 'webinar' ? 'Online' : 'College Campus',
                        city: eventType.type === 'webinar' ? 'Online' : getRandomElement(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad']),
                        isVirtual: eventType.type === 'webinar'
                    },
                    mode: eventType.type === 'webinar' ? 'virtual' : getRandomElement(['in-person', 'hybrid']),
                    organizer: {
                        name: createdBy.name,
                        email: createdBy.email,
                        phone: createdBy.phone
                    },
                    speakers: getRandomElements([
                        { name: 'Dr. Rahul Sharma', designation: 'CTO, Google India', photo: 'https://randomuser.me/api/portraits/men/1.jpg' },
                        { name: 'Priya Menon', designation: 'VP Engineering, Microsoft', photo: 'https://randomuser.me/api/portraits/women/2.jpg' },
                        { name: 'Amit Kumar', designation: 'Founder, TechStartup', photo: 'https://randomuser.me/api/portraits/men/3.jpg' },
                        { name: 'Dr. Kavita Singh', designation: 'Professor, IIT Delhi', photo: 'https://randomuser.me/api/portraits/women/4.jpg' },
                        { name: 'Rajesh Iyer', designation: 'Director, Amazon', photo: 'https://randomuser.me/api/portraits/men/5.jpg' }
                    ], getRandomInt(1, 3)),
                    capacity: getRandomInt(50, 500),
                    registeredUsers: [],
                    registrationDeadline: new Date(eventDate.getTime() - 2 * 24 * 60 * 60 * 1000),
                    isRegistrationOpen: isUpcoming,
                    isPaid: Math.random() > 0.8,
                    price: Math.random() > 0.8 ? getRandomInt(100, 1000) : 0,
                    tags: getRandomElements(['career', 'networking', 'technical', 'workshop', 'webinar', 'alumni'], 3),
                    coverImage: `https://picsum.photos/seed/${Math.random()}/800/400`,
                    status: isUpcoming ? 'upcoming' : getRandomElement(['completed', 'cancelled']),
                    createdBy: createdBy._id,
                    createdAt: new Date(eventDate.getTime() - 30 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(eventDate.getTime() - 30 * 24 * 60 * 60 * 1000)
                });
                eventCount++;
            }
            console.log(`   ✅ ${adminId}: 20 events created`);
        }

        console.log(`\n📊 Total Events Created: ${eventCount}\n`);

        // ============================================
        // CREATE POSTS (60 per college = 300 total)
        // ============================================
        console.log('📝 Creating Posts...');
        let postCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeAlumni = alumniByCollege[adminId] || [];

            for (let i = 0; i < 60; i++) {
                if (collegeAlumni.length === 0) continue;

                const postedBy = getRandomElement(collegeAlumni);
                const postDate = getRandomDate(2019, 2024);
                const company = getRandomElement(COMPANIES);
                const template = getRandomElement(POST_TEMPLATES);

                const content = template
                    .replace('{company}', company.name)
                    .replace('{title}', getRandomElement(JOB_TITLES))
                    .replace('{course}', getRandomElement(['Machine Learning', 'Cloud Computing', 'Data Science', 'React', 'System Design']))
                    .replace('{platform}', getRandomElement(['Coursera', 'Udemy', 'LinkedIn Learning', 'Pluralsight']))
                    .replace('{topic}', getRandomElement(['AI', 'Cloud', 'DevOps', 'Web Development', 'Mobile Apps']))
                    .replace('{event}', getRandomElement(['Annual Alumni Meet', 'Tech Summit', 'Career Fair', 'Networking Event']))
                    .replace('{product}', getRandomElement(['new app', 'feature update', 'platform revamp', 'AI tool']))
                    .replace('{role}', getRandomElement(['engineers', 'developers', 'designers', 'data scientists']))
                    .replace('{years}', getRandomInt(1, 10).toString())
                    .replace('{professor}', getRandomElement(['Dr. Sharma', 'Prof. Iyer', 'Dr. Kumar', 'Prof. Singh']))
                    .replace('{field}', getRandomElement(['Computer Science', 'AI', 'Data Science', 'Engineering']));

                await PostModel.create({
                    adminId: adminId,
                    postedBy: postedBy._id,
                    content: content,
                    images: Math.random() > 0.7 ? [`https://picsum.photos/seed/${Math.random()}/600/400`] : [],
                    likes: [],
                    comments: [],
                    createdAt: postDate,
                    updatedAt: postDate
                });
                postCount++;
            }
            console.log(`   ✅ ${adminId}: 60 posts created`);
        }

        console.log(`\n📊 Total Posts Created: ${postCount}\n`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('=================================================');
        console.log('🎉 SEED SCRIPT 3 COMPLETED SUCCESSFULLY');
        console.log('=================================================');
        console.log(`   Jobs: ${jobCount}`);
        console.log(`   Events: ${eventCount}`);
        console.log(`   Posts: ${postCount}`);
        console.log('\n👉 Run seed-4-campaigns-stories.js next\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error in seed script:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedJobsAndEvents();
