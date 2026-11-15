require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      CandidateProfile.deleteMany({}),
      EmployerProfile.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      SavedJob.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating Admin, Employers, and Candidates...');
    const adminUser = await User.create({
      name: 'Platform Administrator',
      email: 'admin@jobportal.io',
      password: 'Password@123',
      role: 'admin',
      isVerified: true,
    });

    const employer1 = await User.create({
      name: 'Rohan Mehta',
      email: 'rohan@nexustech.in',
      password: 'Password@123',
      role: 'employer',
      isVerified: true,
    });

    const employer2 = await User.create({
      name: 'Ananya Verma',
      email: 'ananya@cloudscale.io',
      password: 'Password@123',
      role: 'employer',
      isVerified: true,
    });

    const candidate1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.dev@example.com',
      password: 'Password@123',
      role: 'candidate',
      isVerified: true,
    });

    const candidate2 = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@example.com',
      password: 'Password@123',
      role: 'candidate',
      isVerified: true,
    });

    // Employer Profiles
    const empProfile1 = await EmployerProfile.create({
      user: employer1._id,
      companyName: 'NexusTech Solutions Pvt Ltd',
      companyWebsite: 'https://nexustech.example.in',
      industry: 'Enterprise SaaS & Cloud Infrastructure',
      companySize: '201-500',
      about: 'Building high-throughput distributed systems and enterprise developer platforms across India.',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      verificationStatus: 'verified',
    });

    const empProfile2 = await EmployerProfile.create({
      user: employer2._id,
      companyName: 'CloudScale Analytics',
      companyWebsite: 'https://cloudscale.example.io',
      industry: 'Data Engineering & FinTech',
      companySize: '51-200',
      about: 'Next-generation financial analytics and automated workflow solutions.',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      verificationStatus: 'verified',
    });

    // Candidate Profiles
    await CandidateProfile.create({
      user: candidate1._id,
      headline: 'Full-Stack MERN & Cloud Software Engineer',
      phone: '+91 9876543210',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      bio: 'Passionate full-stack developer specializing in React, Node.js, Express, MongoDB, and RESTful microservices.',
      skills: ['javascript', 'react', 'node.js', 'express', 'mongodb', 'tailwind', 'git', 'rest api'],
      experienceYears: 2,
      education: [
        {
          degree: 'B.Tech in Computer Science & Engineering',
          institution: 'National Institute of Technology',
          fieldOfStudy: 'Computer Science',
          startYear: 2020,
          endYear: 2024,
          grade: '8.7 CGPA',
        },
      ],
      experience: [
        {
          title: 'Software Engineer',
          company: 'WebCraft Systems',
          location: 'Bengaluru',
          startDate: new Date('2024-06-01'),
          isCurrent: true,
          description: 'Engineered scalable Node.js APIs and React dashboards.',
        },
      ],
      projects: [
        {
          title: 'Real-time Inventory Management System',
          description: 'Built a full-stack stock tracking dashboard with role-based permissions.',
          technologies: ['React', 'Node.js', 'MongoDB'],
        },
      ],
    });

    await CandidateProfile.create({
      user: candidate2._id,
      headline: 'Frontend React & UI/UX Engineer',
      phone: '+91 9123456789',
      location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
      bio: 'Crafting accessible, responsive web applications with React, TypeScript, and Tailwind CSS.',
      skills: ['react', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'redux'],
      experienceYears: 1,
      education: [
        {
          degree: 'B.E. in Information Technology',
          institution: 'Pune Institute of Computer Technology',
          fieldOfStudy: 'Information Technology',
          startYear: 2021,
          endYear: 2025,
          grade: '9.1 CGPA',
        },
      ],
    });

    // Jobs
    const jobs = await Job.insertMany([
      {
        employer: employer1._id,
        companyProfile: empProfile1._id,
        title: 'Full-Stack MERN Developer',
        description:
          'We are looking for a skilled Full-Stack MERN Developer to architect scalable REST APIs and responsive SaaS user interfaces.',
        requirements: [
          'Proficiency in React, Node.js, Express, and MongoDB',
          'Experience with JWT authentication and RESTful design',
          'Strong understanding of Git workflows',
        ],
        responsibilities: [
          'Design and maintain core backend API endpoints',
          'Build reusable, high-performance frontend components',
          'Collaborate on database schema optimization',
        ],
        skillsRequired: ['react', 'node.js', 'express', 'mongodb', 'javascript', 'rest api'],
        experienceLevel: 'Mid Level',
        minExperienceYears: 1,
        employmentType: 'Full-time',
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', isRemote: false },
        salaryRange: { min: 900000, max: 1400000, currency: 'INR', isNegotiable: true },
        openings: 3,
        status: 'active',
        adminApproval: 'approved',
      },
      {
        employer: employer2._id,
        companyProfile: empProfile2._id,
        title: 'Frontend React Engineer',
        description:
          'Join our core product engineering team to deliver interactive financial analytics dashboards using React and Tailwind CSS.',
        requirements: [
          'Strong command of React.js, Tailwind CSS, and modern JavaScript (ES6+)',
          'Familiarity with data visualization libraries like Recharts',
        ],
        responsibilities: [
          'Translate Figma wireframes into responsive production code',
          'Optimize bundle sizes and frontend rendering speed',
        ],
        skillsRequired: ['react', 'javascript', 'tailwind', 'html', 'css', 'typescript'],
        experienceLevel: 'Entry Level',
        minExperienceYears: 0,
        employmentType: 'Full-time',
        location: { city: 'Pune', state: 'Maharashtra', country: 'India', isRemote: true },
        salaryRange: { min: 650000, max: 950000, currency: 'INR', isNegotiable: false },
        openings: 2,
        status: 'active',
        adminApproval: 'approved',
      },
      {
        employer: employer1._id,
        companyProfile: empProfile1._id,
        title: 'Backend Node.js & Microservices Engineer',
        description:
          'Architect high-concurrency API services, integrate MongoDB aggregation pipelines, and harden authentication layers.',
        requirements: [
          '2+ years of hands-on experience in Node.js and Express.js',
          'Deep understanding of MongoDB indexing and query profiling',
        ],
        responsibilities: [
          'Build low-latency backend services',
          'Implement role-based access control and rate limiting',
        ],
        skillsRequired: ['node.js', 'express', 'mongodb', 'docker', 'aws', 'rest api'],
        experienceLevel: 'Senior Level',
        minExperienceYears: 2,
        employmentType: 'Full-time',
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India', isRemote: false },
        salaryRange: { min: 1500000, max: 2200000, currency: 'INR', isNegotiable: true },
        openings: 1,
        status: 'active',
        adminApproval: 'approved',
      },
      {
        employer: employer2._id,
        companyProfile: empProfile2._id,
        title: 'Software Engineering Intern (Full-Stack)',
        description:
          '6-month hands-on engineering internship working directly on production customer portals.',
        requirements: [
          'Final year CS/IT student or recent graduate',
          'Foundational knowledge of JavaScript, React, and Git',
        ],
        responsibilities: [
          'Assist in feature development and automated API testing',
          'Write clean, documented code',
        ],
        skillsRequired: ['javascript', 'react', 'git', 'html', 'css'],
        experienceLevel: 'Entry Level',
        minExperienceYears: 0,
        employmentType: 'Internship',
        location: { city: 'Pune', state: 'Maharashtra', country: 'India', isRemote: true },
        salaryRange: { min: 240000, max: 360000, currency: 'INR', isNegotiable: false },
        openings: 5,
        status: 'active',
        adminApproval: 'approved',
      },
    ]);

    console.log('[Seed] Database populated successfully!');
    console.log('--- Demo Login Credentials ---');
    console.log('Admin:     admin@jobportal.io       | Password@123');
    console.log('Employer:  rohan@nexustech.in       | Password@123');
    console.log('Candidate: aarav.dev@example.com    | Password@123');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();