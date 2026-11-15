const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const EmployerProfile = require('../models/EmployerProfile');
const { createNotification } = require('../services/notificationService');

// @desc    Get comprehensive platform analytics from MongoDB
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalJobs,
      activeJobs,
      pendingJobs,
      totalApplications,
      applicationsByStatus,
      jobsByType,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active', adminApproval: 'approved' }),
      Job.countDocuments({ adminApproval: 'pending' }),
      Application.countDocuments(),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      Job.aggregate([
        { $group: { _id: '$employmentType', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalEmployers,
        totalJobs,
        activeJobs,
        pendingJobs,
        totalApplications,
      },
      charts: {
        applicationsByStatus,
        jobsByType,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform users with search & role filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or suspend a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate an administrator account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { _id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for moderation
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAllJobsForModeration = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('employer', 'name email')
      .populate('companyProfile', 'companyName verificationStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate a job listing (approve, reject, flag/deactivate)
// @route   PUT /api/admin/jobs/:id/moderate
// @access  Private (Admin)
const moderateJobListing = async (req, res, next) => {
  try {
    const { adminApproval, status, reason } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    if (adminApproval && ['pending', 'approved', 'rejected'].includes(adminApproval)) {
      job.adminApproval = adminApproval;
    }

    if (status && ['active', 'closed', 'flagged'].includes(status)) {
      job.status = status;
    }

    await job.save();

    await createNotification({
      recipientId: job.employer,
      senderId: req.user._id,
      type: 'JOB_MODERATION',
      title: 'Job Listing Moderation Notice',
      message: `Your job listing "${job.title}" has been updated to ${job.adminApproval.toUpperCase()} (${job.status}). ${
        reason ? `Note: ${reason}` : ''
      }`,
      jobId: job._id,
    });

    res.status(200).json({
      success: true,
      message: 'Job moderation updated successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminAnalytics,
  getAllUsers,
  toggleUserStatus,
  getAllJobsForModeration,
  moderateJobListing,
};