const path = require('path');
const fs = require('fs');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const { extractTextFromPDF, parseResumeText } = require('../services/resumeParser');
const { calculateMatch } = require('../services/matchingEngine');

// @desc    Get candidate profile
// @route   GET /api/candidate/profile
// @access  Private (Candidate)
const getProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email'
    );

    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate profile
// @route   PUT /api/candidate/profile
// @access  Private (Candidate)
const updateProfile = async (req, res, next) => {
  try {
    const {
      headline,
      phone,
      location,
      bio,
      skills,
      experienceYears,
      education,
      experience,
      projects,
      socialLinks,
    } = req.body;

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    if (headline !== undefined) profile.headline = headline;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = { ...profile.location, ...location };
    if (bio !== undefined) profile.bio = bio;
    if (Array.isArray(skills)) {
      profile.skills = Array.from(new Set(skills.map((s) => s.trim().toLowerCase()).filter(Boolean)));
    }
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (Array.isArray(education)) profile.education = education;
    if (Array.isArray(experience)) profile.experience = experience;
    if (Array.isArray(projects)) profile.projects = projects;
    if (socialLinks !== undefined) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload PDF resume and extract text & hints
// @route   POST /api/candidate/resume/upload
// @access  Private (Candidate)
const uploadAndParseResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a valid PDF resume file.',
      });
    }

    const filePath = req.file.path;

    // Extract text from uploaded PDF
    let extractedText = '';
    let parsedData = {};
    try {
      extractedText = await extractTextFromPDF(filePath);
      parsedData = parseResumeText(extractedText);
    } catch (parseErr) {
      // Allow resume upload to succeed even if parsing encounters scanned/image PDF
      console.warn('[Resume Upload Warning]:', parseErr.message);
    }

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    // Delete older physical file if replaced
    if (profile.resume && profile.resume.path && fs.existsSync(profile.resume.path)) {
      try {
        fs.unlinkSync(profile.resume.path);
      } catch (e) {
        console.warn('Could not delete old resume:', e.message);
      }
    }

    profile.resume = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: filePath,
      uploadDate: new Date(),
      extractedText: extractedText.substring(0, 15000),
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed. Please review the extracted data.',
      resume: {
        filename: profile.resume.filename,
        originalName: profile.resume.originalName,
        uploadDate: profile.resume.uploadDate,
      },
      parsedPreview: parsedData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Securely serve candidate resume PDF (Only Candidate or Employer with active application)
// @route   GET /api/candidate/resume/download/:candidateId
// @access  Private
const downloadResume = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const isOwner = req.user._id.toString() === candidateId;
    const isAdmin = req.user.role === 'admin';

    let isAuthorizedEmployer = false;
    if (req.user.role === 'employer') {
      const applicationExists = await Application.findOne({
        candidate: candidateId,
        employer: req.user._id,
      });
      if (applicationExists) {
        isAuthorizedEmployer = true;
      }
    }

    if (!isOwner && !isAuthorizedEmployer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to candidate resume file.',
      });
    }

    const profile = await CandidateProfile.findOne({ user: candidateId });
    if (!profile || !profile.resume || !profile.resume.path) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found for this candidate.',
      });
    }

    const absolutePath = path.resolve(profile.resume.path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical resume file missing on server storage.',
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${profile.resume.originalName || 'resume.pdf'}"`
    );
    fs.createReadStream(absolutePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/bookmark a job
// @route   POST /api/candidate/saved-jobs/:jobId
// @access  Private (Candidate)
const toggleSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const existing = await SavedJob.findOne({
      candidate: req.user._id,
      job: jobId,
    });

    if (existing) {
      await SavedJob.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Job removed from saved bookmarks.',
      });
    }

    await SavedJob.create({
      candidate: req.user._id,
      job: jobId,
    });

    res.status(201).json({
      success: true,
      saved: true,
      message: 'Job bookmarked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all saved jobs for candidate
// @route   GET /api/candidate/saved-jobs
// @access  Private (Candidate)
const getSavedJobs = async (req, res, next) => {
  try {
    const saved = await SavedJob.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'companyProfile', select: 'companyName logo location' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate dashboard stats & personalized recommended jobs
// @route   GET /api/candidate/dashboard
// @access  Private (Candidate)
const getCandidateDashboard = async (req, res, next) => {
  try {
    const candidateId = req.user._id;

    const [
      totalApplications,
      underReviewCount,
      shortlistedCount,
      savedJobsCount,
      recentApplications,
      profile,
      activeJobs,
    ] = await Promise.all([
      Application.countDocuments({ candidate: candidateId }),
      Application.countDocuments({
        candidate: candidateId,
        status: { $in: ['Applied', 'Under Review'] },
      }),
      Application.countDocuments({
        candidate: candidateId,
        status: { $in: ['Shortlisted', 'Interview Scheduled', 'Hired'] },
      }),
      SavedJob.countDocuments({ candidate: candidateId }),
      Application.find({ candidate: candidateId })
        .populate({
          path: 'job',
          select: 'title location employmentType salaryRange',
          populate: { path: 'companyProfile', select: 'companyName' },
        })
        .sort({ updatedAt: -1 })
        .limit(5),
      CandidateProfile.findOne({ user: candidateId }),
      Job.find({ status: 'active', adminApproval: 'approved' })
        .populate('companyProfile', 'companyName location industry')
        .sort({ createdAt: -1 })
        .limit(25),
    ]);

    // Calculate real-time match scores for active jobs
    const scoredJobs = activeJobs
      .map((job) => {
        const match = calculateMatch(profile, job);
        return {
          ...job.toObject(),
          matchDetails: match,
        };
      })
      .sort((a, b) => b.matchDetails.percentage - a.matchDetails.percentage)
      .slice(0, 6);

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        underReview: underReviewCount,
        shortlisted: shortlistedCount,
        savedJobs: savedJobsCount,
      },
      recentApplications,
      recommendedJobs: scoredJobs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAndParseResume,
  downloadResume,
  toggleSavedJob,
  getSavedJobs,
  getCandidateDashboard,
};