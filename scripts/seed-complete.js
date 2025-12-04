/*
  Complete Database Seeding Script for SIH 2025 Alumni Platform
  
  College: Faculty of Technology
  University: Delhi University
  
  This script seeds all collections with realistic data to test the entire application.
  
  Usage:
    1. Set your MONGODB_URI in .env file
    2. Run: node scripts/seed-complete.js
    
  OR with inline env:
    Windows PowerShell:
      $env:MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/dbname'; node scripts/seed-complete.js
    
    Linux/Mac:
      MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/dbname' node scripts/seed-complete.js
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const UserModel = require('../src/model/model.user');
const AlumniModel = require('../src/model/model.alumni');
const StudentModel = require('../src/model/model.student');
const UniversityModel = require('../src/model/model.university');
const CollegeModel = require('../src/model/model.college');
const JobModel = require('../src/model/model.job');
const EventModel = require('../src/model/model.event');
const PostModel = require('../src/model/model.post');
const CampaignModel = require('../src/model/model.campaign');
const SuccessStoryModel = require('../src/model/model.successStory');
const SurveyModel = require('../src/model/model.survey');
const NewsletterModel = require('../src/model/model.newsletter');
const ConnectionModel = require('../src/model/model.connections');
const ChatModel = require('../src/model/model.chat');

const config = require('../config');
const MONGO_URI = config.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = config.DB_NAME || process.env.MONGO_DB_NAME || process.env.DB_NAME;

// Simple CLI args parsing without adding new dependencies
const rawArgs = process.argv.slice(2);
const args = {
  clear: rawArgs.includes('--clear'),
  skipClear: rawArgs.includes('--skip-clear'),
  force: rawArgs.includes('--force'),
  dryRun: rawArgs.includes('--dry-run')
};

// Normalize behavior: if skipClear specified, never clear. If clear specified, clear. Default = skip clear (non-destructive)
if (args.clear && args.skipClear) {
  console.warn('Both --clear and --skip-clear were passed. Using --clear (destructive).');
  args.skipClear = false;
}

const isWriteEnabled = !args.dryRun;

// ============================================================================
// DATA DEFINITIONS
// ============================================================================

// Default password for all users (hash will be generated)
const DEFAULT_PASSWORD = 'Password123!';

// University Data
const universityData = {
  name: 'Delhi University',
  code: 'DU',
  email: 'registrar@du.ac.in',
  phone: '+91-11-27667853',
  website: 'https://www.du.ac.in',
  address: {
    street: 'University Road',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110007'
  },
  establishedYear: 1922,
  type: 'central',
  accreditation: 'NAAC A++',
  naacGrade: 'A++',
  isActive: true
};

// College Data
const collegeData = {
  name: 'Faculty of Technology',
  code: 'FoT-DU',
  email: 'dean.fot@du.ac.in',
  phone: '+91-11-27667011',
  website: 'https://fot.du.ac.in',
  address: {
    street: 'North Campus, University Enclave',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110007'
  },
  establishedYear: 2017,
  type: 'government',
  accreditation: 'NBA Accredited',
  departments: [
    { name: 'Computer Science & Engineering', code: 'CSE', hod: 'Dr. Rajesh Kumar' },
    { name: 'Electronics & Communication', code: 'ECE', hod: 'Dr. Priya Sharma' },
    { name: 'Information Technology', code: 'IT', hod: 'Dr. Amit Verma' },
    { name: 'Electrical Engineering', code: 'EE', hod: 'Dr. Sunita Yadav' }
  ],
  degrees: [
    { name: 'B.Tech in Computer Science', type: 'B.Tech', duration: 4 },
    { name: 'B.Tech in Electronics', type: 'B.Tech', duration: 4 },
    { name: 'B.Tech in Information Technology', type: 'B.Tech', duration: 4 },
    { name: 'M.Tech in Computer Science', type: 'M.Tech', duration: 2 },
    { name: 'PhD in Computer Science', type: 'PhD', duration: 5 }
  ],
  settings: {
    allowAlumniRegistration: true,
    requireVerification: true,
    showDirectory: true
  },
  isActive: true
};

// Alumni Data (from user's request)
const alumniData = [
  {
    name: 'Satyam Singh',
    email: 'satyam.singh@example.com',
    graduationYear: 2024,
    degreeUrl: 'https://example.com/degrees/satyam-singh.pdf',
    skills: ['Deep Learning', 'Python', 'TensorFlow', 'PyTorch', 'Computer Vision'],
    verified: true,
    // Extended profile info for posts/jobs
    designation: 'AI/ML Engineer',
    company: 'NVIDIA',
    location: 'Bengaluru, India',
    linkedin: 'https://linkedin.com/in/satyam-singh'
  },
  {
    name: 'Rewant Bhriguvanshi',
    email: 'rewant.b@example.com',
    graduationYear: 2023,
    degreeUrl: 'https://example.com/degrees/rewant-b.pdf',
    skills: ['C++', 'Cloud Computing', 'System Design', 'Distributed Systems', 'Go'],
    verified: true,
    designation: 'Software Engineer',
    company: 'Google',
    location: 'Hyderabad, India',
    linkedin: 'https://linkedin.com/in/rewant-bhriguvanshi'
  },
  {
    name: 'Krishna Yadav',
    email: 'krishna.yadav@example.com',
    graduationYear: 2025,
    degreeUrl: 'https://example.com/degrees/krishna-yadav.pdf',
    skills: ['Product Development', 'AI Integration', 'Startup Management', 'React', 'Node.js'],
    verified: true,
    designation: 'Startup Founder',
    company: 'NeuraCore Tech',
    location: 'Noida, India',
    linkedin: 'https://linkedin.com/in/krishna-yadav'
  },
  {
    name: 'Garvit Gupta',
    email: 'garvit.gupta@example.com',
    graduationYear: 2025,
    degreeUrl: 'https://example.com/degrees/garvit-gupta.pdf',
    skills: ['Backend Development', 'Python', 'Django', 'PostgreSQL', 'Redis'],
    verified: true,
    designation: 'Software Engineer',
    company: 'Flipkart',
    location: 'Bengaluru, India',
    linkedin: 'https://linkedin.com/in/garvit-gupta'
  },
  {
    name: 'Shubhika Sinha',
    email: 'shubhika.sinha@example.com',
    graduationYear: 2023,
    degreeUrl: 'https://example.com/degrees/shubhika-sinha.pdf',
    skills: ['Machine Learning', 'NLP', 'Model Deployment', 'Python', 'AWS'],
    verified: true,
    designation: 'Machine Learning Engineer',
    company: 'TCS Research',
    location: 'Pune, India',
    linkedin: 'https://linkedin.com/in/shubhika-sinha'
  },
  {
    name: 'Prayas Yadav',
    email: 'prayas.yadav@example.com',
    graduationYear: 2024,
    degreeUrl: 'https://example.com/degrees/prayas-yadav.pdf',
    skills: ['Go', 'Microservices', 'API Development', 'Kubernetes', 'Docker'],
    verified: true,
    designation: 'Software Engineer',
    company: 'Uber',
    location: 'Gurgaon, India',
    linkedin: 'https://linkedin.com/in/prayas-yadav'
  },
  {
    name: 'Shreyas Singh',
    email: 'shreyas.singh@example.com',
    graduationYear: 2022,
    degreeUrl: 'https://example.com/degrees/shreyas-singh.pdf',
    skills: ['Verilog', 'Physical Design', 'RTL', 'ASIC Design', 'Cadence'],
    verified: true,
    designation: 'VLSI Engineer',
    company: 'Qualcomm',
    location: 'Hyderabad, India',
    linkedin: 'https://linkedin.com/in/shreyas-singh'
  },
  {
    name: 'Kirti Yadav',
    email: 'kirti.yadav@example.com',
    graduationYear: 2021,
    degreeUrl: 'https://example.com/degrees/kirti-yadav.pdf',
    skills: ['FPGA', 'ASIC', 'Static Timing Analysis', 'Synopsys', 'Verilog'],
    verified: true,
    designation: 'VLSI Engineer',
    company: 'AMD',
    location: 'Bengaluru, India',
    linkedin: 'https://linkedin.com/in/kirti-yadav'
  },
  {
    name: 'Raghav Agrawal',
    email: 'raghav.agrawal@example.com',
    graduationYear: 2025,
    degreeUrl: 'https://example.com/degrees/raghav-agrawal.pdf',
    skills: ['LLM Embeddings', 'Vector Databases', 'Semantic Search', 'Python', 'FastAPI'],
    verified: true,
    designation: 'Embedding Engineer',
    company: 'IIT Delhi Lab',
    location: 'Delhi, India',
    linkedin: 'https://linkedin.com/in/raghav-agrawal'
  },
  {
    name: 'Gurhans Grover',
    email: 'gurhans.grover@example.com',
    graduationYear: 2023,
    degreeUrl: 'https://example.com/degrees/gurhans-grover.pdf',
    skills: ['Full Stack', 'Product Design', 'React', 'Node.js', 'MongoDB'],
    verified: true,
    designation: 'Startup Co-Founder',
    company: 'JuvoAI',
    location: 'Gurgaon, India',
    linkedin: 'https://linkedin.com/in/gurhans-grover'
  },
  {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    graduationYear: 2022,
    degreeUrl: 'https://example.com/degrees/aarav-mehta.pdf',
    skills: ['Java', 'Spring Boot', 'REST APIs', 'MySQL', 'Microservices'],
    verified: true,
    designation: 'Software Engineer',
    company: 'Paytm',
    location: 'Noida, India',
    linkedin: 'https://linkedin.com/in/aarav-mehta'
  },
  {
    name: 'Tanisha Verma',
    email: 'tanisha.verma@example.com',
    graduationYear: 2023,
    degreeUrl: 'https://example.com/degrees/tanisha-verma.pdf',
    skills: ['SQL', 'Power BI', 'Python', 'Data Analytics', 'Tableau'],
    verified: true,
    designation: 'Data Analyst',
    company: 'Accenture',
    location: 'Mumbai, India',
    linkedin: 'https://linkedin.com/in/tanisha-verma'
  },
  {
    name: 'Yash Rajput',
    email: 'yash.rajput@example.com',
    graduationYear: 2024,
    degreeUrl: 'https://example.com/degrees/yash-rajput.pdf',
    skills: ['Node.js', 'MongoDB', 'Docker', 'Express.js', 'TypeScript'],
    verified: true,
    designation: 'Software Developer',
    company: 'Ola Electric',
    location: 'Bengaluru, India',
    linkedin: 'https://linkedin.com/in/yash-rajput'
  },
  {
    name: 'Mehul Jain',
    email: 'mehul.jain@example.com',
    graduationYear: 2025,
    degreeUrl: 'https://example.com/degrees/mehul-jain.pdf',
    skills: ['Solidity', 'Smart Contracts', 'DeFi', 'Web3', 'Ethereum'],
    verified: true,
    designation: 'Blockchain Developer',
    company: 'Polygon Labs',
    location: 'Remote',
    linkedin: 'https://linkedin.com/in/mehul-jain'
  },
  {
    name: 'Simran Kaur',
    email: 'simran.kaur@example.com',
    graduationYear: 2021,
    degreeUrl: 'https://example.com/degrees/simran-kaur.pdf',
    skills: ['Product Strategy', 'AI UX', 'Analytics', 'Figma', 'User Research'],
    verified: true,
    designation: 'AI Product Manager',
    company: 'Adobe',
    location: 'Noida, India',
    linkedin: 'https://linkedin.com/in/simran-kaur'
  },
  {
    name: 'Devansh Saxena',
    email: 'devansh.saxena@example.com',
    graduationYear: 2023,
    degreeUrl: 'https://example.com/degrees/devansh-saxena.pdf',
    skills: ['Pen Testing', 'SIEM', 'Network Security', 'Ethical Hacking', 'Python'],
    verified: true,
    designation: 'Cybersecurity Engineer',
    company: 'KPMG',
    location: 'Gurgaon, India',
    linkedin: 'https://linkedin.com/in/devansh-saxena'
  },
  {
    name: 'Ishita Sharma',
    email: 'ishita.sharma@example.com',
    graduationYear: 2022,
    degreeUrl: 'https://example.com/degrees/ishita-sharma.pdf',
    skills: ['React', 'Next.js', 'UI/UX', 'TypeScript', 'Tailwind CSS'],
    verified: true,
    designation: 'Frontend Engineer',
    company: 'Swiggy',
    location: 'Bengaluru, India',
    linkedin: 'https://linkedin.com/in/ishita-sharma'
  },
  {
    name: 'Aditya Chauhan',
    email: 'aditya.chauhan@example.com',
    graduationYear: 2024,
    degreeUrl: 'https://example.com/degrees/aditya-chauhan.pdf',
    skills: ['Robotics', 'Hardware Design', 'AI', 'ROS', 'Embedded Systems'],
    verified: true,
    designation: 'Startup Founder',
    company: 'Aether Robotics',
    location: 'Delhi, India',
    linkedin: 'https://linkedin.com/in/aditya-chauhan'
  },
  {
    name: 'Ritika Malhotra',
    email: 'ritika.malhotra@example.com',
    graduationYear: 2025,
    degreeUrl: 'https://example.com/degrees/ritika-malhotra.pdf',
    skills: ['ML', 'Python', 'Computer Vision', 'OpenCV', 'PyTorch'],
    verified: false, // Not yet verified
    designation: 'ML Research Intern',
    company: 'IIIT Hyderabad',
    location: 'Hyderabad, India',
    linkedin: 'https://linkedin.com/in/ritika-malhotra'
  },
  {
    name: 'Harsh Tandon',
    email: 'harsh.tandon@example.com',
    graduationYear: 2022,
    degreeUrl: 'https://example.com/degrees/harsh-tandon.pdf',
    skills: ['Java', 'Kubernetes', 'Cloud', 'AWS', 'Terraform'],
    verified: true,
    designation: 'Backend Engineer',
    company: 'PhonePe',
    location: 'Bengaluru, India',
    linkedin: 'https://linkedin.com/in/harsh-tandon'
  }
];

// Student Data
const studentData = [
  {
    name: 'Arjun Patel',
    email: 'arjun.patel@fot.du.ac.in',
    degreeType: 'B.Tech',
    degreeName: 'Computer Science & Engineering',
    currentYear: 3,
    entryDate: new Date('2022-07-15')
  },
  {
    name: 'Priya Reddy',
    email: 'priya.reddy@fot.du.ac.in',
    degreeType: 'B.Tech',
    degreeName: 'Electronics & Communication',
    currentYear: 2,
    entryDate: new Date('2023-07-15')
  },
  {
    name: 'Vikram Sharma',
    email: 'vikram.sharma@fot.du.ac.in',
    degreeType: 'B.Tech',
    degreeName: 'Information Technology',
    currentYear: 4,
    entryDate: new Date('2021-07-15')
  },
  {
    name: 'Ananya Gupta',
    email: 'ananya.gupta@fot.du.ac.in',
    degreeType: 'M.Tech',
    degreeName: 'Computer Science',
    currentYear: 1,
    entryDate: new Date('2024-07-15')
  },
  {
    name: 'Rohit Kumar',
    email: 'rohit.kumar@fot.du.ac.in',
    degreeType: 'B.Tech',
    degreeName: 'Electrical Engineering',
    currentYear: 3,
    entryDate: new Date('2022-07-15')
  },
  {
    name: 'Sneha Mishra',
    email: 'sneha.mishra@fot.du.ac.in',
    degreeType: 'B.Tech',
    degreeName: 'Computer Science & Engineering',
    currentYear: 1,
    entryDate: new Date('2024-07-15')
  },
  {
    name: 'Karan Singh',
    email: 'karan.singh@fot.du.ac.in',
    degreeType: 'PhD',
    degreeName: 'Computer Science',
    currentYear: 2,
    entryDate: new Date('2023-07-15')
  },
  {
    name: 'Divya Joshi',
    email: 'divya.joshi@fot.du.ac.in',
    degreeType: 'B.Tech',
    degreeName: 'Electronics & Communication',
    currentYear: 4,
    entryDate: new Date('2021-07-15')
  }
];

// Jobs Data (posted by alumni)
const jobsData = [
  {
    title: 'Software Engineer - Full Stack',
    company: 'Google',
    location: 'Hyderabad, India',
    type: 'full-time',
    description: 'Join our team to build next-generation cloud products. You will work on scalable systems serving billions of users worldwide.',
    requirements: '3+ years of experience in software development. Strong knowledge of data structures and algorithms. Experience with cloud platforms (GCP/AWS). Proficiency in Python, Java, or Go.',
    skillsRequired: ['Python', 'Java', 'Cloud', 'System Design', 'Distributed Systems'],
    salary: { min: 2500000, max: 4000000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-02-28')
  },
  {
    title: 'AI/ML Engineer',
    company: 'NVIDIA',
    location: 'Bengaluru, India',
    type: 'full-time',
    description: 'Work on cutting-edge AI technologies including deep learning, computer vision, and natural language processing for our GPU-accelerated computing platforms.',
    requirements: 'MS/PhD in CS or related field preferred. Experience with PyTorch/TensorFlow. Strong understanding of neural network architectures.',
    skillsRequired: ['Deep Learning', 'PyTorch', 'TensorFlow', 'Python', 'CUDA'],
    salary: { min: 3000000, max: 5000000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-03-15')
  },
  {
    title: 'Backend Developer Intern',
    company: 'Flipkart',
    location: 'Bengaluru, India',
    type: 'internship',
    description: 'Join our backend team for a 6-month internship. Work on high-scale systems handling millions of transactions daily.',
    requirements: 'Currently pursuing B.Tech/M.Tech. Strong DSA skills. Knowledge of any backend framework.',
    skillsRequired: ['Python', 'Django', 'REST APIs', 'SQL'],
    salary: { min: 50000, max: 80000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-01-31')
  },
  {
    title: 'VLSI Design Engineer',
    company: 'Qualcomm',
    location: 'Hyderabad, India',
    type: 'full-time',
    description: 'Design and verify digital circuits for mobile chipsets. Work on cutting-edge 5G and AI accelerator designs.',
    requirements: 'Experience with Verilog/VHDL. Knowledge of ASIC design flow. Understanding of timing analysis.',
    skillsRequired: ['Verilog', 'ASIC', 'RTL Design', 'Static Timing Analysis', 'Cadence'],
    salary: { min: 2000000, max: 3500000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-02-15')
  },
  {
    title: 'Product Manager - AI',
    company: 'Adobe',
    location: 'Noida, India',
    type: 'full-time',
    description: 'Lead product strategy for AI-powered creative tools. Work with engineering and design teams to deliver innovative features.',
    requirements: '5+ years of product management experience. Understanding of AI/ML technologies. Strong communication skills.',
    skillsRequired: ['Product Strategy', 'AI/ML', 'User Research', 'Analytics', 'Agile'],
    salary: { min: 4000000, max: 6000000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-03-01')
  },
  {
    title: 'Blockchain Developer',
    company: 'Polygon Labs',
    location: 'Remote',
    type: 'full-time',
    description: 'Build decentralized applications and smart contracts on Polygon network. Work on scaling solutions for Ethereum.',
    requirements: 'Experience with Solidity. Understanding of DeFi protocols. Knowledge of Web3 stack.',
    skillsRequired: ['Solidity', 'Web3', 'Ethereum', 'Smart Contracts', 'DeFi'],
    salary: { min: 2500000, max: 4500000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-02-20')
  },
  {
    title: 'Cybersecurity Analyst',
    company: 'KPMG',
    location: 'Gurgaon, India',
    type: 'full-time',
    description: 'Conduct security assessments and penetration testing for enterprise clients. Help organizations strengthen their security posture.',
    requirements: 'CISSP/CEH certification preferred. Experience with security tools. Strong analytical skills.',
    skillsRequired: ['Penetration Testing', 'SIEM', 'Network Security', 'Risk Assessment'],
    salary: { min: 1500000, max: 2500000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-01-25')
  },
  {
    title: 'Frontend Engineer - React',
    company: 'Swiggy',
    location: 'Bengaluru, India',
    type: 'full-time',
    description: 'Build beautiful and performant user interfaces for food delivery platform used by millions.',
    requirements: '2+ years React experience. Strong CSS skills. Experience with state management libraries.',
    skillsRequired: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
    salary: { min: 1800000, max: 3000000, currency: 'INR' },
    status: 'open',
    deadline: new Date('2025-02-10')
  }
];

// Events Data
const eventsData = [
  {
    title: 'Annual Alumni Meet 2025',
    description: 'Join us for the grand annual alumni gathering! Network with fellow alumni, meet current students, and celebrate our shared legacy. Keynote speakers include successful entrepreneurs and industry leaders from our alumni community.',
    date: new Date('2025-02-15T10:00:00'),
    venue: 'Faculty of Technology Main Auditorium, Delhi University'
  },
  {
    title: 'Tech Talk: AI in 2025 and Beyond',
    description: 'An exclusive tech talk by Satyam Singh (NVIDIA) on the future of AI/ML. Learn about the latest advancements in deep learning, LLMs, and how to build a career in AI.',
    date: new Date('2025-01-20T15:00:00'),
    venue: 'Seminar Hall, Faculty of Technology'
  },
  {
    title: 'Startup Showcase & Networking',
    description: 'Alumni founders showcase their startups and share their entrepreneurship journey. Great opportunity for students looking to start their own ventures or join early-stage startups.',
    date: new Date('2025-01-25T14:00:00'),
    venue: 'Conference Room, Faculty of Technology'
  },
  {
    title: 'Campus Placement Preparation Workshop',
    description: 'Alumni from Google, NVIDIA, Flipkart, and other top companies share placement tips, conduct mock interviews, and review resumes.',
    date: new Date('2025-01-18T09:00:00'),
    venue: 'Computer Lab 1, Faculty of Technology'
  },
  {
    title: 'Hackathon: Code for Change 2025',
    description: '24-hour hackathon focused on building solutions for social impact. Prizes worth ₹2 lakhs! Mentorship from alumni throughout the event.',
    date: new Date('2025-02-08T09:00:00'),
    venue: 'Innovation Hub, Faculty of Technology'
  },
  {
    title: 'VLSI Career Guidance Session',
    description: 'Senior alumni from Qualcomm, AMD, and Intel share insights about careers in semiconductor industry. Learn about the booming chip design sector in India.',
    date: new Date('2025-01-30T11:00:00'),
    venue: 'Electronics Lab, Faculty of Technology'
  }
];

// Posts Data (Feed content)
const postsData = [
  {
    content: "🎉 Excited to share that I've joined NVIDIA as an AI/ML Engineer! Thank you Faculty of Technology for the amazing foundation. The journey from Delhi University to here has been incredible. Happy to connect with juniors who want to explore AI careers! #AlumniSuccess #NVIDIA #AI",
    authorIndex: 0 // Satyam Singh
  },
  {
    content: "Just completed 1 year at Google! The problems we solve here are fascinating - building systems that serve billions. Grateful to my professors at FoT who taught me the fundamentals of system design. Always happy to help fellow FoT students with their career questions! 🚀",
    authorIndex: 1 // Rewant
  },
  {
    content: "Thrilled to announce the launch of NeuraCore Tech! 🎊 We're building AI-powered solutions for enterprise automation. Looking for talented interns from FoT who want to work on cutting-edge AI. DM me if interested! #Startup #Entrepreneurship",
    authorIndex: 2 // Krishna
  },
  {
    content: "Pro tip for juniors: Focus on building projects rather than just collecting certificates. My GitHub portfolio helped me land my job at Flipkart more than any certification. Start building today! 💻 #CareerAdvice #CodingTips",
    authorIndex: 3 // Garvit
  },
  {
    content: "Published my first research paper on NLP! 📝 'Efficient Fine-tuning of Large Language Models for Domain-Specific Applications' - Check it out on arXiv. Happy to discuss NLP with anyone interested. Research is tough but rewarding!",
    authorIndex: 4 // Shubhika
  },
  {
    content: "Missing the chai and samosas from the FoT canteen! 😄 Those late-night coding sessions with friends were the best. Any current students here? How's the campus these days?",
    authorIndex: 6 // Shreyas
  },
  {
    content: "Great news! Our startup JuvoAI just raised Series A funding! 🎯 We're hiring across all roles - engineers, designers, product managers. FoT alumni get priority. Let's build something amazing together!",
    authorIndex: 9 // Gurhans
  },
  {
    content: "Sharing my experience of transitioning from software to product management. It's a completely different skill set but very rewarding. Happy to mentor anyone interested in PM roles. DM open! 🎯 #ProductManagement #CareerSwitch",
    authorIndex: 14 // Simran
  },
  {
    content: "Just gave a guest lecture at FoT on cybersecurity careers! Amazing to see the next generation so enthusiastic about security. Stay curious, stay ethical! 🔐 #Cybersecurity #GivingBack",
    authorIndex: 15 // Devansh
  },
  {
    content: "The Frontend ecosystem is evolving so fast! Just migrated our entire Swiggy consumer app to Next.js 14 with App Router. Performance gains are incredible. Happy to share learnings with fellow developers. 🚀",
    authorIndex: 16 // Ishita
  }
];

// Campaigns Data
const campaignsData = [
  {
    title: 'Smart Classroom Initiative',
    tagline: 'Transforming education with technology',
    description: 'Help us upgrade all classrooms at Faculty of Technology with smart boards, high-speed internet, and modern AV equipment. This will enhance the learning experience for over 500 students.',
    category: 'infrastructure',
    targetAmount: 2500000,
    raisedAmount: 750000,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-06-30'),
    status: 'active',
    milestones: [
      { title: 'Smart Boards for 5 Classrooms', targetAmount: 500000, isCompleted: true, completedAt: new Date('2024-12-20') },
      { title: 'High-Speed WiFi Installation', targetAmount: 750000, isCompleted: false },
      { title: 'AV Equipment Setup', targetAmount: 1250000, isCompleted: false }
    ]
  },
  {
    title: 'Merit Scholarship Fund 2025',
    tagline: 'Supporting bright minds in need',
    description: 'Create a scholarship fund to support meritorious students from economically weaker sections. Each scholarship will cover tuition fees for one academic year.',
    category: 'scholarship',
    targetAmount: 1000000,
    raisedAmount: 320000,
    startDate: new Date('2024-11-15'),
    endDate: new Date('2025-04-30'),
    status: 'active',
    milestones: [
      { title: '5 Full Scholarships', targetAmount: 500000, isCompleted: false },
      { title: '10 Half Scholarships', targetAmount: 500000, isCompleted: false }
    ]
  },
  {
    title: 'AI Research Lab Setup',
    tagline: 'Building the future of AI education',
    description: 'Establish a state-of-the-art AI/ML research lab with high-performance GPUs, workstations, and specialized software for students and researchers.',
    category: 'research',
    targetAmount: 5000000,
    raisedAmount: 1500000,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-09-30'),
    status: 'active',
    milestones: [
      { title: 'GPU Server Cluster', targetAmount: 2000000, isCompleted: false },
      { title: 'Workstations and Peripherals', targetAmount: 1500000, isCompleted: false },
      { title: 'Software Licenses', targetAmount: 1500000, isCompleted: false }
    ]
  }
];

// Success Stories Data
const successStoriesData = [
  {
    title: 'From Delhi University to NVIDIA: My AI Journey',
    content: `When I joined Faculty of Technology in 2020, I had no idea that four years later, I would be working at NVIDIA on cutting-edge AI technologies. My journey has been filled with learning, failures, and eventual success.

The foundation at FoT was incredible. Our professors encouraged us to think beyond textbooks. I still remember Professor Kumar's advice: "Build projects, break things, learn constantly." This became my mantra.

During my second year, I started exploring deep learning. I built small projects, failed many times, but kept going. The coding competitions and hackathons at FoT gave me the confidence to compete at national level.

My internship at a startup taught me practical skills that no classroom could. By the time placements came, I was ready. NVIDIA's interview was tough, but my project experience helped me stand out.

To current students: Don't just study for exams. Build things. Fail. Learn. The journey is what matters. Faculty of Technology gave me the platform to dream big - make the most of it!`,
    category: 'career_growth',
    authorIndex: 0, // Satyam
    tags: ['AI', 'NVIDIA', 'Deep Learning', 'Career']
  },
  {
    title: 'Building NeuraCore Tech: A Startup Story',
    content: `Three years ago, I was just another student at Faculty of Technology. Today, I'm the founder of NeuraCore Tech, a startup valued at ₹10 crores. Here's my story.

The entrepreneurship bug bit me early. Even as a student, I was always building side projects. FoT's innovation cell gave me the first platform to pitch my ideas. I failed multiple times, but each failure taught me something new.

After graduation, instead of taking a safe corporate job, I decided to start NeuraCore. The first year was brutal - no funding, no customers, just an idea and determination. I coded during the day and pitched to investors at night.

What helped was the FoT alumni network. Senior alumni became my first customers, investors, and advisors. This community support was invaluable.

Today, we have 25 employees and clients across India. My advice to aspiring entrepreneurs: Start early, embrace failure, and leverage your alumni network. Faculty of Technology is not just a college - it's a launchpad!`,
    category: 'entrepreneurship',
    authorIndex: 2, // Krishna
    tags: ['Startup', 'Entrepreneurship', 'AI', 'Success']
  },
  {
    title: 'Cracking Google: My Placement Journey',
    content: `Getting into Google was a dream that seemed impossible during my first year at FoT. Here's how I made it happen.

Preparation started in second year. I solved over 500 DSA problems on LeetCode and Codeforces. But what truly helped was building real projects. I contributed to open source, built a cloud-based application, and learned system design through building, not just reading.

FoT's placement cell was incredibly supportive. The mock interviews with alumni helped me understand what top companies look for. My seniors at Google (FoT alumni) gave me insider tips that were invaluable.

The interview process was intense - 5 rounds over 3 weeks. But I was prepared. When I got the offer, it felt surreal.

Key learnings: Start DSA early, build projects, contribute to open source, and leverage the alumni network. The FoT community is your biggest asset. Good luck to all aspirants!`,
    category: 'career_growth',
    authorIndex: 1, // Rewant
    tags: ['Google', 'Placement', 'DSA', 'Interview']
  },
  {
    title: 'Breaking into VLSI: From ECE to Qualcomm',
    content: `The semiconductor industry in India is booming, and I'm fortunate to be part of this revolution at Qualcomm. Here's my journey from FoT's ECE department to designing chips for 5G.

VLSI wasn't my initial interest. I was fascinated by software in my early years. But a workshop on chip design during third year changed everything. The idea that we design the hardware that runs all software was mind-blowing.

I started learning Verilog, practiced on FPGA boards in our lab, and did an internship at a semiconductor startup. The hands-on experience was crucial.

Qualcomm's hiring process tests both theoretical knowledge and practical skills. My lab projects and internship experience were decisive factors.

For ECE students: VLSI is a fantastic career path with huge growth potential. Start early, use the lab resources, and don't hesitate to reach out to alumni in the industry. We're always happy to guide!`,
    category: 'career_growth',
    authorIndex: 6, // Shreyas
    tags: ['VLSI', 'Qualcomm', 'Semiconductor', 'ECE']
  }
];

// Surveys Data
const surveysData = [
  {
    title: 'Alumni Career Progression Survey 2025',
    description: 'Help us understand career paths of FoT alumni to better guide current students.',
    questions: [
      { text: 'What is your current job title?', type: 'short', isRequired: true, order: 1 },
      { text: 'How many years of work experience do you have?', type: 'single_choice', options: ['0-2 years', '2-5 years', '5-10 years', '10+ years'], isRequired: true, order: 2 },
      { text: 'What is your current salary range (LPA)?', type: 'single_choice', options: ['< 10 LPA', '10-20 LPA', '20-40 LPA', '40-60 LPA', '60+ LPA'], isRequired: false, order: 3 },
      { text: 'How well did FoT prepare you for your career?', type: 'rating', isRequired: true, order: 4 },
      { text: 'What skills do you wish were taught at FoT?', type: 'long', isRequired: false, order: 5 }
    ],
    targetAudience: 'alumni',
    status: 'active',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-31')
  },
  {
    title: 'Mentorship Program Feedback',
    description: 'Share your experience with the alumni-student mentorship program.',
    questions: [
      { text: 'How satisfied are you with the mentorship program?', type: 'rating', isRequired: true, order: 1 },
      { text: 'How often did you meet with your mentor?', type: 'single_choice', options: ['Weekly', 'Bi-weekly', 'Monthly', 'Rarely'], isRequired: true, order: 2 },
      { text: 'What improvements would you suggest?', type: 'long', isRequired: false, order: 3 }
    ],
    targetAudience: 'all',
    status: 'active',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-02-28')
  }
];

// Newsletters Data
const newslettersData = [
  {
    title: 'FoT Alumni Newsletter - January 2025',
    subject: 'New Year Updates from Faculty of Technology',
    content: `<h1>Happy New Year from Faculty of Technology!</h1>
<p>As we step into 2025, we're excited to share updates from our vibrant alumni community.</p>

<h2>🎉 Alumni Achievements</h2>
<ul>
<li><strong>Satyam Singh (2024)</strong> joined NVIDIA as AI/ML Engineer</li>
<li><strong>Krishna Yadav (2025)</strong> launched NeuraCore Tech startup</li>
<li><strong>Gurhans Grover (2023)</strong> - JuvoAI raised Series A funding</li>
</ul>

<h2>📅 Upcoming Events</h2>
<ul>
<li>Annual Alumni Meet - February 15, 2025</li>
<li>Tech Talk: AI in 2025 - January 20, 2025</li>
<li>Hackathon: Code for Change - February 8, 2025</li>
</ul>

<h2>💰 Fundraising Update</h2>
<p>Our AI Research Lab campaign has raised ₹15 lakhs! Thank you for your generous contributions.</p>

<p>Stay connected, stay inspired!</p>
<p><em>Faculty of Technology, Delhi University</em></p>`,
    template: 'digest',
    targetAudience: 'all',
    status: 'sent',
    sentAt: new Date('2025-01-01'),
    recipientCount: 250,
    openCount: 180
  },
  {
    title: 'Campus Placement Season Update',
    subject: 'Great News! Record Placements at FoT 2024-25',
    content: `<h1>Record-Breaking Placement Season!</h1>
<p>We're thrilled to announce the best placement season in FoT history!</p>

<h2>📊 Key Highlights</h2>
<ul>
<li>Highest Package: ₹45 LPA (Google)</li>
<li>Average Package: ₹18.5 LPA</li>
<li>85% students placed in first phase</li>
<li>20+ companies visited campus</li>
</ul>

<h2>🏢 Top Recruiters</h2>
<p>Google, Microsoft, NVIDIA, Flipkart, Qualcomm, Adobe, and more!</p>

<h2>🙏 Thank You Alumni!</h2>
<p>Special thanks to alumni who conducted mock interviews and referred students. Your support made this possible!</p>`,
    template: 'announcement',
    targetAudience: 'all',
    status: 'sent',
    sentAt: new Date('2024-12-20'),
    recipientCount: 300,
    openCount: 250
  }
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function clearDatabase() {
  console.log('🗑️  Clearing existing data (this will remove many collections!)...');
  
  if (!isWriteEnabled) {
    console.log('🔎 Dry run enabled; not actually deleting data.');
    return;
  }
  
  await Promise.all([
    UserModel.deleteMany({}),
    AlumniModel.deleteMany({}),
    StudentModel.deleteMany({}),
    UniversityModel.deleteMany({}),
    CollegeModel.deleteMany({}),
    JobModel.deleteMany({}),
    EventModel.deleteMany({}),
    PostModel.deleteMany({}),
    CampaignModel.deleteMany({}),
    SuccessStoryModel.deleteMany({}),
    SurveyModel.deleteMany({}),
    NewsletterModel.deleteMany({}),
    ConnectionModel.deleteMany({}),
    ChatModel.deleteMany({})
  ]);
  
  console.log('✅ Database cleared');
}

// Utility: ensure document exists (idempotent)
async function ensureDocument(Model, query, createData, updateIfExists = false) {
  const existing = await Model.findOne(query).lean();
  if (existing) {
    if (updateIfExists && isWriteEnabled) {
      await Model.updateOne({ _id: existing._id }, { $set: createData });
      console.log(`   Updated existing ${Model.modelName}: ${existing._id}`);
    } else {
      console.log(`   Skipped existing ${Model.modelName}: ${existing._id}`);
    }
    return existing;
  }
  if (!isWriteEnabled) {
    console.log(`   Dry-run: would create ${Model.modelName} with`, query);
    return null;
  }
  const doc = await Model.create(createData);
  console.log(`   Created ${Model.modelName}: ${doc._id}`);
  return doc;
}

// Helper: get an alumni user (fallback to DB if created list doesn't have one)
async function getAlumniUser(alumniList, idx) {
  if (alumniList && alumniList[idx] && alumniList[idx].user) return alumniList[idx].user;
  const anyAlumniUser = await UserModel.findOne({ userType: 'Alumni' }).lean();
  return anyAlumniUser || null;
}

async function getStudentUser(studentsList, idx) {
  if (studentsList && studentsList[idx] && studentsList[idx].user) return studentsList[idx].user;
  const anyStudentUser = await UserModel.findOne({ userType: 'Student' }).lean();
  return anyStudentUser || null;
}

async function getAlumniProfileForUserId(userId) {
  if (!userId) return null;
  return await AlumniModel.findOne({ userId });
}

async function getStudentProfileForUserId(userId) {
  if (!userId) return null;
  return await StudentModel.findOne({ userId });
}

async function seedUniversityAndCollege() {
  console.log('🏛️  Seeding University and College...');
  
  // Ensure university exists by code or name
  let university = await UniversityModel.findOne({ code: universityData.code });
  if (!university) {
    if (!isWriteEnabled) {
      console.log('   Dry-run: Would create University:', universityData.code);
      university = null;
    } else {
      university = await UniversityModel.create(universityData);
      console.log(`   Created University: ${university.name}`);
    }
  } else {
    console.log(`   Found University: ${university.name}`);
  }
  
  // Ensure college exists by code
  let college = await CollegeModel.findOne({ code: collegeData.code });
  if (!college) {
    if (!isWriteEnabled) {
      console.log('   Dry-run: Would create College:', collegeData.code);
      college = null;
    } else {
      college = await CollegeModel.create({
        ...collegeData,
        university: university?._id
      });
      console.log(`   Created College: ${college.name}`);
    }
  } else {
    // If the college exists, ensure it references the university
    if (university && (!college.university || college.university.toString() !== university._id.toString())) {
      if (isWriteEnabled) {
        college.university = university._id;
        await college.save();
        console.log(`   Updated College ${college.code} with University reference`);
      } else {
        console.log('   Dry-run: Would update College to set university reference');
      }
    } else {
      console.log(`   Found College: ${college.name}`);
    }
  }
  
  // If both created and write enabled, add college reference to university
  if (university && college && isWriteEnabled) {
    if (!university.colleges) university.colleges = [];
    if (!university.colleges.find((id) => id.toString() === college._id.toString())) {
      university.colleges.push(college._id);
      university.totalColleges = university.colleges.length;
      await university.save();
      console.log('   Updated University with college reference');
    }
  }
  
  return { university, college };
}

async function seedAdmin(db) {
  console.log('👤 Seeding Admin user...');
  
  const adminEmail = 'admin@fot.du.ac.in';
  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  
  const existingAdmin = await db.collection('users').findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`   Admin already exists: ${adminEmail}`);
    return adminEmail;
  }
  
  if (!isWriteEnabled) {
    console.log(`   Dry-run: Would create admin: ${adminEmail}`);
    return adminEmail;
  }

  await db.collection('users').insertOne({
    name: 'FoT Admin',
    email: adminEmail,
    passwordHash: passwordHash,
    userType: 'Admin',
    createdAt: new Date()
  });
  
  console.log(`   Created Admin: ${adminEmail}`);
  return adminEmail;
}

async function seedAlumni() {
  console.log('🎓 Seeding Alumni...');
  
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const createdAlumni = [];
  
  for (const alumni of alumniData) {
    // Create user if not exists
    let user = await UserModel.findOne({ email: alumni.email });
    if (!user) {
      if (!isWriteEnabled) {
        console.log(`   Dry-run: Would create user for alumni: ${alumni.email}`);
        user = null;
      } else {
        user = await UserModel.create({
          name: alumni.name,
          email: alumni.email,
          passwordHash: passwordHash,
          userType: 'Alumni'
        });
        console.log(`   Created Alumni user: ${alumni.email}`);
      }
    } else {
      console.log(`   Alumni user already exists: ${alumni.email}`);
    }

    // Create alumni profile if not exists
    if (user) {
      let alumniProfile = await AlumniModel.findOne({ userId: user._id });
      if (!alumniProfile) {
        if (!isWriteEnabled) {
          console.log('   Dry-run: Would create Alumni profile for', alumni.email);
          alumniProfile = null;
        } else {
          alumniProfile = await AlumniModel.create({
            userId: user._id,
            graduationYear: alumni.graduationYear,
            degreeUrl: alumni.degreeUrl,
            skills: alumni.skills,
            verified: alumni.verified
          });
          console.log(`   Created Alumni profile for: ${alumni.email}`);
        }
      } else {
        console.log(`   Alumni profile already exists for ${alumni.email}`);
      }

      // Link profileDetails field if missing
      if (alumniProfile && (!user.profileDetails || user.profileDetails.toString() !== alumniProfile._id.toString())) {
        if (isWriteEnabled) {
          user.profileDetails = alumniProfile._id;
          await user.save();
          console.log(`   Linked Alumni profile to user: ${alumni.email}`);
        } else {
          console.log('   Dry-run: Would link Alumni profile to user', alumni.email);
        }
      }

      createdAlumni.push({ user, profile: alumniProfile, ...alumni });
    }
  }
  
  return createdAlumni;
}

async function seedStudents() {
  console.log('📚 Seeding Students...');
  
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const createdStudents = [];
  
  for (const student of studentData) {
    let user = await UserModel.findOne({ email: student.email });
    if (!user) {
      if (!isWriteEnabled) {
        console.log(`   Dry-run: Would create user for student: ${student.email}`);
        user = null;
      } else {
        user = await UserModel.create({
          name: student.name,
          email: student.email,
          passwordHash: passwordHash,
          userType: 'Student'
        });
        console.log(`   Created Student user: ${student.email}`);
      }
    } else {
      console.log(`   Student user already exists: ${student.email}`);
    }

    if (user) {
      let studentProfile = await StudentModel.findOne({ userId: user._id });
      if (!studentProfile) {
        if (!isWriteEnabled) {
          console.log('   Dry-run: Would create Student profile for', student.email);
          studentProfile = null;
        } else {
          studentProfile = await StudentModel.create({
            userId: user._id,
            academic: {
              entryDate: student.entryDate,
              degreeType: student.degreeType,
              degreeName: student.degreeName,
              isCompleted: false,
              currentYear: student.currentYear
            }
          });
          console.log(`   Created Student profile for: ${student.email}`);
        }
      } else {
        console.log(`   Student profile already exists for ${student.email}`);
      }

      if (studentProfile && (!user.profileDetails || user.profileDetails.toString() !== studentProfile._id.toString())) {
        if (isWriteEnabled) {
          user.profileDetails = studentProfile._id;
          await user.save();
          console.log(`   Linked Student profile to user: ${student.email}`);
        } else {
          console.log('   Dry-run: Would link Student profile to user', student.email);
        }
      }
      
      createdStudents.push({ user, profile: studentProfile });
      console.log(`   Created/Ensured Student: ${student.name} (Year ${student.currentYear})`);
    }
  }
  
  return createdStudents;
}

async function seedJobs(alumni) {
  console.log('💼 Seeding Jobs...');
  
  const createdJobs = [];
  
  for (let i = 0; i < jobsData.length; i++) {
    const jobData = jobsData[i];
    // Assign jobs to different alumni
    const posterIndex = alumni && alumni.length ? i % alumni.length : i;
    // choose existing poster from created list, or fallback to a DB alumni user
    const poster = (alumni && alumni[posterIndex]) ? alumni[posterIndex] : null;
    let posterUser = poster ? poster.user : null;
    if (!posterUser) {
      // try to fetch an existing alumni user from the DB
      posterUser = await UserModel.findOne({ userType: 'Alumni' }).lean();
    }

    if (!posterUser) {
      console.log(`   No alumni user available; skipping Job: ${jobData.title} at ${jobData.company}`);
      continue;
    }
    const query = { title: jobData.title, company: jobData.company, postedBy: posterUser._id };
    const existing = await JobModel.findOne(query);
    if (existing) {
      console.log(`   Skipping existing Job: ${jobData.title} at ${jobData.company}`);
      createdJobs.push(existing);
      continue;
    }
    if (!isWriteEnabled) {
      console.log(`   Dry-run: Would create Job: ${jobData.title} at ${jobData.company}`);
      continue;
    }
    const job = await JobModel.create({ ...jobData, postedBy: posterUser._id });
    createdJobs.push(job);
    console.log(`   Created Job: ${jobData.title} at ${jobData.company}`);
  }
  
  return createdJobs;
}

async function seedEvents(alumni) {
  console.log('📅 Seeding Events...');
  
  const createdEvents = [];
  
  for (let i = 0; i < eventsData.length; i++) {
    const eventData = eventsData[i];
    const creatorIndex = alumni && alumni.length ? i % alumni.length : i;
    const creatorUser = await getAlumniUser(alumni, creatorIndex);

    if (!creatorUser) {
      console.log(`   No alumni user available; skipping Event: ${eventData.title}`);
      continue;
    }
    const query = { title: eventData.title, date: eventData.date, createdBy: creatorUser._id };
    const existing = await EventModel.findOne(query);
    if (existing) {
      console.log(`   Skipping existing Event: ${eventData.title}`);
      createdEvents.push(existing);
      continue;
    }
    if (!isWriteEnabled) {
      console.log(`   Dry-run: Would create Event: ${eventData.title}`);
      continue;
    }
    const event = await EventModel.create({ ...eventData, createdBy: creatorUser._id });
    createdEvents.push(event);
    console.log(`   Created Event: ${eventData.title}`);
  }
  
  return createdEvents;
}

async function seedPosts(alumni) {
  console.log('📝 Seeding Posts...');
  
  const createdPosts = [];
  
  for (const postData of postsData) {
    const authorUser = await getAlumniUser(alumni, postData.authorIndex);
    if (!authorUser) {
      console.log(`   No alumni user available; skipping Post by: index ${postData.authorIndex}`);
      continue;
    }
    const query = { content: postData.content, postedBy: authorUser._id };
    const existing = await PostModel.findOne(query);
    if (existing) {
      console.log(`   Skipping existing Post by: ${authorUser.name}`);
      createdPosts.push(existing);
      continue;
    }
    if (!isWriteEnabled) {
      console.log(`   Dry-run: Would create Post by: ${authorUser.name}`);
      continue;
    }
    const post = await PostModel.create({
      content: postData.content,
      postedBy: authorUser._id,
      likes: [],
      comments: []
    });
    createdPosts.push(post);
    console.log(`   Created Post by: ${authorUser.name}`);
  }
  
  return createdPosts;
}

async function seedCampaigns(alumni, college) {
  console.log('💰 Seeding Campaigns...');
  
  const createdCampaigns = [];
  
  for (let i = 0; i < campaignsData.length; i++) {
    const campaignData = campaignsData[i];
    const organizerIndex = alumni && alumni.length ? i % alumni.length : i;
    const organizerUser = await getAlumniUser(alumni, organizerIndex);
    
    if (!organizerUser) {
      console.log(`   No alumni user available; skipping Campaign: ${campaignData.title}`);
      continue;
    }
    const query = { title: campaignData.title, organizer: organizerUser._id };
    const existing = await CampaignModel.findOne(query);
    if (existing) {
      console.log(`   Skipping existing Campaign: ${campaignData.title}`);
      createdCampaigns.push(existing);
      continue;
    }
    // Add some sample donations
    const donations = [];
    for (let j = 0; j < 5; j++) {
      const donorIndex = alumni && alumni.length ? (i + j) % alumni.length : (i + j);
      const donorUser = await getAlumniUser(alumni, donorIndex);
      if (!donorUser) continue;
      donations.push({
        donor: donorUser._id,
        amount: Math.floor(Math.random() * 50000) + 10000,
        type: 'money',
        isAnonymous: Math.random() > 0.7,
        paymentStatus: 'completed',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    if (!isWriteEnabled) {
      console.log(`   Dry-run: Would create Campaign: ${campaignData.title}`);
      continue;
    }
    const campaign = await CampaignModel.create({
      ...campaignData,
      organizer: organizerUser._id,
      college: college._id,
      donations: donations,
      supportersCount: donations.length,
      isVerified: true
    });
    
    createdCampaigns.push(campaign);
    console.log(`   Created Campaign: ${campaignData.title}`);
  }
  
  return createdCampaigns;
}

async function seedSuccessStories(alumni, college) {
  console.log('🌟 Seeding Success Stories...');
  
  const createdStories = [];
  
  for (const storyData of successStoriesData) {
    const authorUser = await getAlumniUser(alumni, storyData.authorIndex);
    if (!authorUser) {
      console.log(`   No alumni user available; skipping Success Story: ${storyData.title}`);
      continue;
    }
    const query = { title: storyData.title, createdBy: authorUser._id };
    const existing = await SuccessStoryModel.findOne(query);
    if (existing) {
      console.log(`   Skipping existing Success Story: ${storyData.title}`);
      createdStories.push(existing);
      continue;
    }
    if (!isWriteEnabled) {
      console.log(`   Dry-run: Would create Success Story: ${storyData.title}`);
      continue;
    }
    const alumniProfile = await getAlumniProfileForUserId(authorUser._id);
    const story = await SuccessStoryModel.create({
      title: storyData.title,
      content: storyData.content,
      excerpt: storyData.content.substring(0, 200) + '...',
      category: storyData.category,
      alumni: alumniProfile ? alumniProfile._id : undefined,
      alumniName: authorUser.name || undefined,
      alumniDesignation: alumniProfile && alumniProfile.designation ? alumniProfile.designation : undefined,
      alumniCompany: authorUser.company || undefined,
      graduationYear: alumniProfile ? alumniProfile.graduationYear : undefined,
      tags: storyData.tags,
      status: 'published',
      isFeatured: true,
      isVerified: true,
      createdBy: authorUser._id,
      college: college._id,
      publishedAt: new Date()
    });
    
    createdStories.push(story);
    console.log(`   Created Success Story: ${storyData.title}`);
  }
  
  return createdStories;
}

async function seedSurveys(alumni, college) {
  console.log('📊 Seeding Surveys...');
  
  const createdSurveys = [];
  
  for (let i = 0; i < surveysData.length; i++) {
    const surveyData = surveysData[i];
    const creatorIndex = alumni && alumni.length ? i % alumni.length : i;
    const creatorUser = await getAlumniUser(alumni, creatorIndex);
    if (!creatorUser) {
      console.log(`   No alumni user available; skipping Survey: ${surveyData.title}`);
      continue;
    }
    const query = { title: surveyData.title, createdBy: creatorUser._id };
    const existing = await SurveyModel.findOne(query);
    if (existing) {
      console.log(`   Skipping existing Survey: ${surveyData.title}`);
      createdSurveys.push(existing);
      continue;
    }
    if (!isWriteEnabled) {
      console.log(`   Dry-run: Would create Survey: ${surveyData.title}`);
      continue;
    }
    const survey = await SurveyModel.create({ ...surveyData, createdBy: creatorUser._id, college: college._id });
    createdSurveys.push(survey);
    console.log(`   Created Survey: ${surveyData.title}`);
  }
  
  return createdSurveys;
}

async function seedNewsletters(alumni, college) {
  console.log('📬 Seeding Newsletters...');
  
  const createdNewsletters = [];
  
  for (let i = 0; i < newslettersData.length; i++) {
    const newsletterData = newslettersData[i];
    const creatorIndex = alumni && alumni.length ? i % alumni.length : i;
    const creatorUser = await getAlumniUser(alumni, creatorIndex);
    if (!creatorUser) {
      console.log(`   No alumni user available; skipping Newsletter: ${newsletterData.title}`);
      continue;
    }
    const query = { title: newsletterData.title, createdBy: creatorUser._id };
    const existing = await NewsletterModel.findOne(query);
    if (existing) {
      console.log(`   Skipping existing Newsletter: ${newsletterData.title}`);
      createdNewsletters.push(existing);
      continue;
    }
    if (!isWriteEnabled) {
      console.log(`   Dry-run: Would create Newsletter: ${newsletterData.title}`);
      continue;
    }
    const newsletter = await NewsletterModel.create({ ...newsletterData, createdBy: creatorUser._id, college: college._id });
    createdNewsletters.push(newsletter);
    console.log(`   Created Newsletter: ${newsletterData.title}`);
  }
  
  return createdNewsletters;
}

async function seedConnections(alumni, students) {
  console.log('🤝 Seeding Connections...');
  
  const connections = [];
  
  // Create some connections between students and alumni
  for (let i = 0; i < students.length; i++) {
    const numConnections = Math.min(3, alumni.length);
    for (let j = 0; j < numConnections; j++) {
      const alumniIndex = alumni && alumni.length ? (i + j) % alumni.length : (i + j);
      // Student profile may be missing in dry-run; fallback to DB
      let studentProfile = students[i] && students[i].profile ? students[i].profile : null;
      if (!studentProfile && students[i] && students[i].user) {
        studentProfile = await getStudentProfileForUserId(students[i].user._id);
      }
      if (!studentProfile) {
        // try to find any student profile in DB
        const anyStudent = await StudentModel.findOne({});
        studentProfile = anyStudent || null;
      }
      // Alumni profile fallback
      let alumniProfile = (alumni && alumni[alumniIndex] && alumni[alumniIndex].profile) ? alumni[alumniIndex].profile : null;
      if (!alumniProfile) {
        const anyAlumniUser = await getAlumniUser(alumni, alumniIndex);
        if (anyAlumniUser) {
          alumniProfile = await getAlumniProfileForUserId(anyAlumniUser._id);
        }
      }
      const query = { studentId: studentProfile._id, alumniId: alumniProfile._id };
      const existing = await ConnectionModel.findOne(query);
      if (existing) {
        continue;
      }
      if (!isWriteEnabled) {
        const studentLogUser = students[i] && students[i].user ? students[i].user : null;
        const alumniLogUser = (alumni && alumni[alumniIndex] && alumni[alumniIndex].user) ? alumni[alumniIndex].user : null;
        const studentEmail = studentLogUser ? studentLogUser.email : (studentProfile && studentProfile.userId ? `student:${studentProfile.userId}` : 'unknown');
        const alumniEmail = alumniLogUser ? alumniLogUser.email : (alumniProfile && alumniProfile.userId ? `alumni:${alumniProfile.userId}` : 'unknown');
        console.log(`   Dry-run: Would create connection between ${studentEmail} and ${alumniEmail}`);
        continue;
      }
      const connection = await ConnectionModel.create({
        studentId: studentProfile._id,
        alumniId: alumniProfile._id,
        status: Math.random() > 0.3 ? 'accepted' : 'pending'
      });
      connections.push(connection);
    }
  }
  
  console.log(`   Created ${connections.length} connections`);
  return connections;
}

async function seedChats(alumni, students) {
  console.log('💬 Seeding Chats...');
  
  const chats = [];
  
  // Create some sample chats
  for (let i = 0; i < Math.min(5, students.length); i++) {
    const alumniIndex = i % alumni.length;
    let studentProfile = students[i] && students[i].profile ? students[i].profile : null;
    if (!studentProfile && students[i] && students[i].user) {
      studentProfile = await getStudentProfileForUserId(students[i].user._id);
    }
    if (!studentProfile) {
      const anyStudent = await StudentModel.findOne({});
      studentProfile = anyStudent || null;
    }
    let alumniProfile = (alumni && alumni[alumniIndex] && alumni[alumniIndex].profile) ? alumni[alumniIndex].profile : null;
    if (!alumniProfile) {
      const anyAlumniUser = await getAlumniUser(alumni, alumniIndex);
      if (anyAlumniUser) alumniProfile = await getAlumniProfileForUserId(anyAlumniUser._id);
    }
    if (!alumniProfile || !studentProfile) {
      console.log('   Skipping chat because alumniProfile or studentProfile does not exist');
      continue;
    }
    const query = { alumniId: alumniProfile._id, studentId: studentProfile._id };
    const existing = await ChatModel.findOne(query);
    if (existing) {
      const studentName = students[i] && students[i].user ? students[i].user.name : (studentProfile.userName || 'student');
      const alumniName = (alumni && alumni[alumniIndex] && alumni[alumniIndex].name) ? alumni[alumniIndex].name : (alumniProfile && alumniProfile.userName ? alumniProfile.userName : 'alumni');
      console.log(`   Skipping existing chat between ${studentName} and ${alumniName}`);
      chats.push(existing);
      continue;
    }
    if (!isWriteEnabled) {
      const studentEmail = students[i] && students[i].user ? students[i].user.email : (studentProfile.userId ? `student:${studentProfile.userId}` : 'unknown');
      const alumniEmail = (alumni && alumni[alumniIndex] && alumni[alumniIndex].user) ? alumni[alumniIndex].user.email : (alumniProfile.userId ? `alumni:${alumniProfile.userId}` : 'unknown');
      console.log(`   Dry-run: Would create chat between ${studentEmail} and ${alumniEmail}`);
      continue;
    }
    const chat = await ChatModel.create({
      alumniId: alumniProfile._id,
      studentId: studentProfile._id,
      messages: [
        {
          sender: 'student',
          message: `Hi! I'm ${students[i].user.name}. I'm really interested in learning more about your career path at ${alumni[alumniIndex].company}.`,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          sender: 'alumni',
          message: `Hello! Great to connect with you. I'd be happy to share my experience. What specific aspects are you curious about?`,
          timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
        },
        {
          sender: 'student',
          message: `I'm particularly interested in how you prepared for technical interviews and what skills were most important.`,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    });
    
    chats.push(chat);
    console.log(`   Created chat between ${students[i].user.name} and ${alumni[alumniIndex].name}`);
  }
  
  return chats;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('🚀 Starting Complete Database Seed...\n');
  
  if (!MONGO_URI) {
    console.error('❌ Error: MONGODB_URI environment variable not set');
    console.log('\nPlease set MONGODB_URI in your .env file or run:');
    console.log('  PowerShell: $env:MONGODB_URI="your_uri"; node scripts/seed-complete.js');
    process.exit(1);
  }
  
  try {
    const connectOptions = DB_NAME ? { dbName: DB_NAME } : undefined;
    console.log(`Connecting to MongoDB at ${MONGO_URI.replace(/(mongodb(?:\+srv)?:\/\/)(.*@)/, '$1***@')} using dbName=${DB_NAME || '<none>'}`);
    await mongoose.connect(MONGO_URI, connectOptions);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;

    // Safety for production
    if (process.env.NODE_ENV === 'production' && !args.force) {
      console.error('❌ Refusing to run seeder in production environment. Use --force if you really want to run it.');
      process.exit(1);
    }

    // Show flags
    console.log(`Flags: clear=${args.clear}, skipClear=${args.skipClear}, dryRun=${args.dryRun}, force=${args.force}`);

    // Clear existing data only if --clear is passed (and not skipped)
    if (args.clear && !args.skipClear) {
      await clearDatabase();
    } else {
      console.log('🔒 Skipping DB clear (default behavior). To clear DB pass --clear');
    }
    console.log('');
    
    // Seed in order (respecting dependencies)
    const { university, college } = await seedUniversityAndCollege();
    console.log('');
    
    await seedAdmin(db);
    console.log('');
    
    const alumni = await seedAlumni();
    console.log('');
    
    const students = await seedStudents();
    console.log('');
    
    await seedJobs(alumni);
    console.log('');
    
    await seedEvents(alumni);
    console.log('');
    
    await seedPosts(alumni);
    console.log('');
    
    await seedCampaigns(alumni, college);
    console.log('');
    
    await seedSuccessStories(alumni, college);
    console.log('');
    
    await seedSurveys(alumni, college);
    console.log('');
    
    await seedNewsletters(alumni, college);
    console.log('');
    
    await seedConnections(alumni, students);
    console.log('');
    
    await seedChats(alumni, students);
    console.log('');
    
    // Print summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    🎉 SEEDING COMPLETE! 🎉');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • 1 University: Delhi University`);
    console.log(`   • 1 College: Faculty of Technology`);
    console.log(`   • 1 Admin user`);
    console.log(`   • ${alumni.length} Alumni users`);
    console.log(`   • ${students.length} Student users`);
    console.log(`   • ${jobsData.length} Jobs`);
    console.log(`   • ${eventsData.length} Events`);
    console.log(`   • ${postsData.length} Posts`);
    console.log(`   • ${campaignsData.length} Campaigns`);
    console.log(`   • ${successStoriesData.length} Success Stories`);
    console.log(`   • ${surveysData.length} Surveys`);
    console.log(`   • ${newslettersData.length} Newsletters`);
    console.log('');
    console.log('🔐 Login Credentials (Password for all: Password123!)');
    console.log('');
    console.log('   Admin:');
    console.log('     Email: admin@fot.du.ac.in');
    console.log('     Password: AdminPass123!');
    console.log('');
    console.log('   Sample Alumni:');
    alumni.slice(0, 5).forEach(a => {
      console.log(`     ${a.name}: ${a.email}`);
    });
    console.log('');
    console.log('   Sample Students:');
    students.slice(0, 3).forEach(s => {
      console.log(`     ${s.user.name}: ${s.user.email}`);
    });
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();
