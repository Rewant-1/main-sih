/**
 * SEED SCRIPT 4: Campaigns + Donations + Success Stories
 * Creates: 50 Campaigns, 500 Donations, 100 Success Stories
 * 
 * Run: node src/scripts/seed-4-campaigns-stories.js
 * Prerequisite: Run seed-1, seed-2, seed-3 first
 */

const mongoose = require('mongoose');
require('dotenv').config();

const AdminModel = require('../model/model.admin');
const UserModel = require('../model/model.user');
const AlumniModel = require('../model/model.alumni');
const CampaignModel = require('../model/model.campaign');
const DonationModel = require('../model/model.donation');
const SuccessStoryModel = require('../model/model.successStory');

// ============================================
// CAMPAIGN DATA
// ============================================
const CAMPAIGN_CATEGORIES = [
    { category: 'scholarship', titles: ['Merit Scholarship Fund', 'Need-Based Scholarship', 'Research Fellowship', 'Women in Tech Scholarship'] },
    { category: 'infrastructure', titles: ['New Library Building', 'Smart Classroom Project', 'Sports Complex Renovation', 'Lab Equipment Upgrade'] },
    { category: 'research', titles: ['AI Research Lab', 'Clean Energy Project', 'Biotech Innovation Center', 'Space Research Initiative'] },
    { category: 'sustainability', titles: ['Green Campus Initiative', 'Solar Power Project', 'Water Conservation', 'Zero Waste Campus'] },
    { category: 'sports', titles: ['Annual Sports Meet', 'New Stadium Fund', 'Athletics Equipment', 'Inter-College Tournament'] }
];

const CAMPAIGN_DESCRIPTIONS = [
    'Help us create better opportunities for deserving students who need financial support to pursue their dreams.',
    'Your contribution will directly impact the learning experience of thousands of students.',
    'Join us in building world-class facilities that will benefit generations of students to come.',
    'Support cutting-edge research that will shape the future of technology and innovation.',
    'Together, we can make our campus more sustainable and environmentally friendly.'
];

// ============================================
// SUCCESS STORY DATA
// ============================================
const STORY_CATEGORIES = [
    'career_growth', 'entrepreneurship', 'research_innovation', 'social_impact', 'academic_excellence'
];

const SUCCESS_STORY_TEMPLATES = [
    {
        title: 'From Campus to {company}: My Journey as a {role}',
        content: `I still remember my first day at college - nervous, excited, and full of dreams. Little did I know that this institution would shape my entire career trajectory.

During my time here, I was fortunate to have amazing professors who believed in practical learning. The projects we worked on, the hackathons we participated in, and the late-night coding sessions in the lab - all of it prepared me for the real world.

After graduation in {year}, I joined {company} as a {junior_role}. The foundation I built here helped me navigate complex technical challenges. Within {years} years, I was promoted to {role}.

My advice to current students: Make the most of every opportunity. Join clubs, participate in events, build projects, and most importantly - network with your alumni. They've walked the path you're on and can offer invaluable guidance.

I'm grateful to my alma mater for everything. This is just the beginning of my journey to give back.`
    },
    {
        title: 'Building {startup}: From College Project to {funding} Startup',
        content: `Every successful startup has an origin story. Mine began in the innovation lab of our college.

What started as a final year project to solve {problem} eventually became {startup} - a company that now serves {customers} customers and has raised {funding} in funding.

The entrepreneurial ecosystem at our college was incredible. The incubation center, mentorship programs, and pitch competitions gave me the confidence to take the leap.

The journey wasn't easy. We faced rejections, pivoted multiple times, and had moments of doubt. But the resilience I learned during my college years - pulling all-nighters before exams, managing multiple responsibilities - that grit carried me through.

Today, {startup} employs {employees} people, and many of them are our alumni. It's a full-circle moment every time I hire someone from our college.

To aspiring entrepreneurs: Start small, think big, and never stop learning. Your college years are the best time to experiment and fail. Embrace it.`
    },
    {
        title: 'Research that Changed Lives: My Path to {achievement}',
        content: `When I chose to pursue research instead of a high-paying corporate job, many questioned my decision. Today, I'm glad I followed my passion.

My research journey began in the labs of our college under the guidance of Dr. {professor}. What started as curiosity about {field} transformed into a lifelong mission.

After completing my doctorate, I joined {institution} where I continued my work on {topic}. Our breakthrough came {years} years ago when we {discovery}.

This work has now impacted {impact} - something I never imagined when I was just a curious student in the lab.

The research culture at our college laid the foundation for everything I've achieved. The emphasis on questioning, experimenting, and persevering - these values still guide my work.

To students interested in research: Don't be afraid of the road less traveled. The impact you can make is immeasurable.`
    }
];

const COMPANIES_STARTUPS = [
    { name: 'Google', type: 'company' }, { name: 'Microsoft', type: 'company' },
    { name: 'Amazon', type: 'company' }, { name: 'Flipkart', type: 'company' },
    { name: 'MakeMyTrip', type: 'startup' }, { name: 'PolicyBazaar', type: 'startup' },
    { name: 'Freshworks', type: 'startup' }, { name: 'Zerodha', type: 'startup' },
    { name: 'Razorpay', type: 'startup' }, { name: 'CRED', type: 'startup' }
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
async function seedCampaignsAndStories() {
    try {
        console.log('🚀 Starting Seed Script 4: Campaigns + Donations + Success Stories');
        console.log('===================================================================\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGO_DB_NAME || 'sih_2025'
        });
        console.log(`✅ Connected to MongoDB (Database: ${process.env.MONGO_DB_NAME || 'sih_2025'})\n`);

        // Clear existing data
        console.log('🗑️  Clearing existing Campaigns, Donations, Success Stories...');
        await CampaignModel.deleteMany({});
        await DonationModel.deleteMany({});
        await SuccessStoryModel.deleteMany({});
        console.log('✅ Cleared existing data\n');

        // Get references
        const admins = await AdminModel.find({});
        const users = await UserModel.find({ userType: 'Alumni' });
        const alumniProfiles = await AlumniModel.find({});

        console.log(`📊 Found ${admins.length} Admins and ${users.length} Alumni\n`);

        // Group by adminId
        const adminsByCollege = {};
        admins.forEach(admin => {
            if (!adminsByCollege[admin.adminId]) adminsByCollege[admin.adminId] = [];
            adminsByCollege[admin.adminId].push(admin);
        });

        const usersByCollege = {};
        users.forEach(user => {
            if (!usersByCollege[user.adminId]) usersByCollege[user.adminId] = [];
            usersByCollege[user.adminId].push(user);
        });

        const alumniByCollege = {};
        alumniProfiles.forEach(alumni => {
            if (!alumniByCollege[alumni.adminId]) alumniByCollege[alumni.adminId] = [];
            alumniByCollege[alumni.adminId].push(alumni);
        });

        // ============================================
        // CREATE CAMPAIGNS (10 per college = 50 total)
        // ============================================
        console.log('💰 Creating Campaigns...');
        let campaignCount = 0;
        const createdCampaigns = [];

        for (const adminId of Object.keys(adminsByCollege)) {
            const admin = adminsByCollege[adminId][0];

            for (let i = 0; i < 10; i++) {
                const catData = getRandomElement(CAMPAIGN_CATEGORIES);
                const title = getRandomElement(catData.titles);
                const targetAmount = getRandomInt(1, 50) * 100000;
                const startDate = getRandomDate(2019, 2024);
                const endDate = new Date(startDate.getTime() + getRandomInt(30, 180) * 24 * 60 * 60 * 1000);
                const isActive = endDate > new Date() && startDate < new Date();
                const raisedAmount = isActive ? getRandomInt(0, targetAmount * 0.8) : getRandomInt(targetAmount * 0.5, targetAmount * 1.2);

                const campaign = await CampaignModel.create({
                    adminId: adminId,
                    title: `${title} - ${admin.instituteName.split(' ')[0]}`,
                    tagline: `Support ${title.toLowerCase()} at our institution`,
                    description: getRandomElement(CAMPAIGN_DESCRIPTIONS),
                    shortDescription: `Help us raise ₹${(targetAmount / 100000).toFixed(1)} Lakhs for ${title.toLowerCase()}.`,
                    category: catData.category,
                    targetAmount: targetAmount,
                    goalAmount: targetAmount,
                    raisedAmount: raisedAmount,
                    minimumDonation: getRandomElement([100, 500, 1000]),
                    currency: 'INR',
                    donorCount: Math.floor(raisedAmount / getRandomInt(1000, 10000)),
                    startDate: startDate,
                    endDate: endDate,
                    milestones: [
                        { title: '25% Milestone', targetAmount: targetAmount * 0.25, isCompleted: raisedAmount >= targetAmount * 0.25 },
                        { title: '50% Milestone', targetAmount: targetAmount * 0.5, isCompleted: raisedAmount >= targetAmount * 0.5 },
                        { title: '75% Milestone', targetAmount: targetAmount * 0.75, isCompleted: raisedAmount >= targetAmount * 0.75 },
                        { title: 'Goal Reached!', targetAmount: targetAmount, isCompleted: raisedAmount >= targetAmount }
                    ],
                    beneficiaries: getRandomElement(['500+ students', '1000+ beneficiaries', 'Entire campus community', 'Future generations']),
                    expectedOutcomes: [
                        'Direct impact on student success',
                        'Improved infrastructure and facilities',
                        'Enhanced learning experience',
                        'Strengthened alumni network'
                    ],
                    coverImage: `https://picsum.photos/seed/campaign${campaignCount}/800/400`,
                    images: [
                        `https://picsum.photos/seed/camp${campaignCount}a/600/400`,
                        `https://picsum.photos/seed/camp${campaignCount}b/600/400`
                    ],
                    organizer: admin._id,
                    createdBy: admin._id,
                    status: raisedAmount >= targetAmount ? 'completed' : (isActive ? 'active' : 'completed'),
                    isVerified: true,
                    verifiedBy: admin._id,
                    verifiedAt: startDate,
                    tags: [catData.category, 'alumni-giving', admin.instituteName.split(' ')[0].toLowerCase()],
                    isFeatured: Math.random() > 0.7,
                    views: getRandomInt(100, 5000),
                    shares: getRandomInt(10, 500),
                    createdAt: startDate,
                    updatedAt: new Date()
                });

                createdCampaigns.push(campaign);
                campaignCount++;
            }
            console.log(`   ✅ ${adminId}: 10 campaigns created`);
        }

        console.log(`\n📊 Total Campaigns Created: ${campaignCount}\n`);

        // ============================================
        // CREATE DONATIONS (100 per college = 500 total)
        // ============================================
        console.log('🎁 Creating Donations...');
        let donationCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeUsers = usersByCollege[adminId] || [];
            const collegeCampaigns = createdCampaigns.filter(c => c.adminId === adminId);

            for (let i = 0; i < 100; i++) {
                if (collegeUsers.length === 0 || collegeCampaigns.length === 0) continue;

                const donor = getRandomElement(collegeUsers);
                const campaign = getRandomElement(collegeCampaigns);
                const donationType = Math.random() > 0.8 ? 'skill' : 'monetary';
                const donationDate = getRandomDate(
                    campaign.startDate.getFullYear(),
                    Math.min(campaign.endDate.getFullYear(), 2024)
                );

                await DonationModel.create({
                    adminId: adminId,
                    campaignId: campaign._id,
                    donorId: donor._id,
                    type: donationType,
                    amount: donationType === 'monetary' ? getRandomElement([500, 1000, 2000, 5000, 10000, 25000, 50000]) : 0,
                    currency: 'INR',
                    paymentDetails: donationType === 'monetary' ? {
                        orderId: `order_${Date.now()}_${i}`,
                        paymentId: `pay_${Date.now()}_${i}`,
                        method: getRandomElement(['upi', 'card', 'netbanking'])
                    } : null,
                    paymentStatus: 'completed',
                    skillDetails: donationType === 'skill' ? {
                        skill: getRandomElement(['Mentoring', 'Career Guidance', 'Technical Workshop', 'Interview Prep']),
                        hoursCommitted: getRandomInt(2, 20),
                        hoursCompleted: getRandomInt(0, 20),
                        status: getRandomElement(['completed', 'in-progress'])
                    } : null,
                    isAnonymous: Math.random() > 0.8,
                    message: Math.random() > 0.5 ? getRandomElement([
                        'Happy to give back to my alma mater!',
                        'For the future generations of students.',
                        'Proud to support this initiative.',
                        'In memory of my college days.',
                        'Keep up the great work!'
                    ]) : null,
                    certificate: {
                        generated: donationType === 'monetary' && Math.random() > 0.3,
                        certificateNumber: `CERT-${adminId.slice(0, 3)}-${Date.now()}`
                    },
                    createdAt: donationDate,
                    updatedAt: donationDate
                });
                donationCount++;
            }
            console.log(`   ✅ ${adminId}: 100 donations created`);
        }

        console.log(`\n📊 Total Donations Created: ${donationCount}\n`);

        // ============================================
        // CREATE SUCCESS STORIES (20 per college = 100 total)
        // ============================================
        console.log('⭐ Creating Success Stories...');
        let storyCount = 0;

        for (const adminId of Object.keys(adminsByCollege)) {
            const collegeAlumni = alumniByCollege[adminId] || [];
            const collegeUsers = usersByCollege[adminId] || [];

            for (let i = 0; i < 20; i++) {
                if (collegeAlumni.length === 0) continue;

                const alumni = getRandomElement(collegeAlumni);
                const user = collegeUsers.find(u => u._id.toString() === alumni.userId?.toString()) || getRandomElement(collegeUsers);
                const company = getRandomElement(COMPANIES_STARTUPS);
                const template = getRandomElement(SUCCESS_STORY_TEMPLATES);
                const category = getRandomElement(STORY_CATEGORIES);
                const publishDate = getRandomDate(2019, 2024);

                // Generate title and content
                const title = template.title
                    .replace('{company}', company.name)
                    .replace('{role}', getRandomElement(['Software Engineer', 'Product Manager', 'Data Scientist', 'Tech Lead']))
                    .replace('{startup}', getRandomElement(['TechVenture', 'InnovateLabs', 'FutureTech', 'StartupX', 'NextGen']))
                    .replace('{funding}', getRandomElement(['₹50 Cr', '₹100 Cr', '$10M', '$25M']))
                    .replace('{achievement}', getRandomElement(['Published Research', 'Patent Award', 'Global Recognition']));

                const content = template.content
                    .replace(/{company}/g, company.name)
                    .replace(/{role}/g, getRandomElement(['Senior Engineer', 'Director', 'VP Engineering', 'Principal Architect']))
                    .replace(/{junior_role}/g, getRandomElement(['Software Engineer', 'Associate', 'Trainee']))
                    .replace(/{year}/g, getRandomInt(2015, 2022).toString())
                    .replace(/{years}/g, getRandomInt(2, 8).toString())
                    .replace(/{startup}/g, getRandomElement(['TechVenture', 'InnovateLabs', 'FutureTech']))
                    .replace(/{problem}/g, getRandomElement(['payment processing', 'logistics optimization', 'healthcare access', 'education delivery']))
                    .replace(/{customers}/g, getRandomElement(['10,000+', '50,000+', '100,000+', '1M+']))
                    .replace(/{funding}/g, getRandomElement(['₹50 Cr', '₹100 Cr', '$10M']))
                    .replace(/{employees}/g, getRandomInt(20, 500).toString())
                    .replace(/{professor}/g, getRandomElement(['Dr. Sharma', 'Prof. Iyer', 'Dr. Kumar', 'Prof. Singh']))
                    .replace(/{field}/g, getRandomElement(['AI', 'Machine Learning', 'Data Science', 'Robotics']))
                    .replace(/{institution}/g, getRandomElement(['IISc', 'IIT Research', 'CSIR', 'DRDO']))
                    .replace(/{topic}/g, getRandomElement(['neural networks', 'quantum computing', 'biotechnology', 'renewable energy']))
                    .replace(/{discovery}/g, getRandomElement(['developed a breakthrough algorithm', 'published in Nature', 'received a patent', 'created open-source tools']))
                    .replace(/{impact}/g, getRandomElement(['millions of lives', 'industry standards', 'research community', 'policy decisions']));

                const isPublished = Math.random() > 0.2;

                await SuccessStoryModel.create({
                    adminId: adminId,
                    alumniId: alumni._id,
                    alumni: alumni._id,
                    title: title,
                    content: content,
                    excerpt: content.substring(0, 200) + '...',
                    category: category,
                    alumniName: user?.name || 'Anonymous Alumni',
                    alumniDesignation: alumni.designation || 'Professional',
                    alumniCompany: alumni.company || company.name,
                    graduationYear: alumni.graduationYear || getRandomInt(2015, 2022),
                    coverImage: `https://picsum.photos/seed/story${storyCount}/800/500`,
                    images: [
                        `https://picsum.photos/seed/storyimg${storyCount}/600/400`
                    ],
                    tags: getRandomElements([
                        'success', 'career', 'startup', 'research', 'leadership',
                        'innovation', 'inspiration', 'alumni', 'achievement'
                    ], 4),
                    views: getRandomInt(100, 10000),
                    likes: [],
                    shares: getRandomInt(5, 200),
                    status: isPublished ? 'published' : 'pending',
                    isFeatured: isPublished && Math.random() > 0.7,
                    isVerified: isPublished,
                    publishedAt: isPublished ? publishDate : null,
                    createdAt: new Date(publishDate.getTime() - 7 * 24 * 60 * 60 * 1000),
                    updatedAt: publishDate
                });
                storyCount++;
            }
            console.log(`   ✅ ${adminId}: 20 success stories created`);
        }

        console.log(`\n📊 Total Success Stories Created: ${storyCount}\n`);

        // ============================================
        // SUMMARY
        // ============================================
        console.log('===================================================================');
        console.log('🎉 SEED SCRIPT 4 COMPLETED SUCCESSFULLY');
        console.log('===================================================================');
        console.log(`   Campaigns: ${campaignCount}`);
        console.log(`   Donations: ${donationCount}`);
        console.log(`   Success Stories: ${storyCount}`);
        console.log('\n👉 Run seed-5-engagement.js next\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error in seed script:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedCampaignsAndStories();
