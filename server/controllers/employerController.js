const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get employer company profile
// @route   GET /api/employer/profile
// @access  Private (Employer)
const getCompanyProfile = async (req, res, next) => {
  try {
    const profile = await EmployerProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email'
    );
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employer company profile
// @route   PUT /api/employer/profile
// @access  Private (Employer)
const updateCompanyProfile = async (req, res, next) => {
  try {
    const {
      companyName,
      companyWebsite,
      industry,
      companySize,
      about,
      location,
    } = req.body;

    const profile = await EmployerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found.',
      });
    }

    if (companyName) profile.companyName = companyName.trim();
    if (companyWebsite !== undefined) profile.companyWebsite = companyWebsite.trim();
    if (industry !== undefined) profile.industry = industry.trim();
    if (companySize) profile.companySize = companySize;
    if (about !== undefined) profile.about = about;
    if (location) profile.location = { ...profile.location, ...location };

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employer dashboard metrics & job-wise statistics
// @route   GET /api/employer/dashboard
// @access  Private (Employer)
const getEmployerDashboard = async (req, res, next) => {
  try {
    const employerId = req.user._id;

    const [
      activeJobsCount,
      totalApplicationsCount,
      pendingReviewCount,
      shortlistedCount,
      jobsList,
      recentApplicants,
    ] = await Promise.all([
      Job.countDocuments({ employer: employerId, status: 'active' }),
      Application.countDocuments({ employer: employerId }),
      Application.countDocuments({
        employer: employerId,
        status: { $in: ['Applied', 'Under Review'] },
      }),
      Application.countDocuments({
        employer: employerId,
        status: { $in: ['Shortlisted', 'Interview Scheduled', 'Hired'] },
      }),
      Job.find({ employer: employerId })
        .select('title status adminApproval applicationsCount viewsCount createdAt')
        .sort({ createdAt: -1 }),
      Application.find({ employer: employerId })
        .populate('candidate', 'name email')
        .populate('job', 'title')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        activeJobs: activeJobsCount,
        totalApplications: totalApplicationsCount,
        pendingReview: pendingReviewCount,
        shortlisted: shortlistedCount,
      },
      jobStats: jobsList,
      recentApplicants,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  getEmployerDashboard,
};