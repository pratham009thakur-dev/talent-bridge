const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const { calculateMatch } = require('../services/matchingEngine');
const { createNotification } = require('../services/notificationService');

// @desc    Candidate applies to a job
// @route   POST /api/applications/:jobId
// @access  Private (Candidate)
const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active' || job.adminApproval !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'This job is no longer accepting applications.',
      });
    }

    // Check duplicate application
    const alreadyApplied = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position.',
      });
    }

    const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });
    if (!candidateProfile || !candidateProfile.resume || !candidateProfile.resume.filename) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume in your profile before applying.',
      });
    }

    const matchDetails = calculateMatch(candidateProfile, job);

    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      employer: job.employer,
      resumeSnapshot: {
        filename: candidateProfile.resume.filename,
        originalName: candidateProfile.resume.originalName,
        path: candidateProfile.resume.path,
      },
      coverLetter: coverLetter || '',
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedBy: req.user._id,
          notes: 'Application submitted by candidate.',
        },
      ],
      matchScore: {
        percentage: matchDetails.percentage,
        matchingSkills: matchDetails.matchingSkills,
        missingSkills: matchDetails.missingSkills,
      },
    });

    await Job.updateOne({ _id: job._id }, { $inc: { applicationsCount: 1 } });

    // Notify Candidate & Employer
    await Promise.all([
      createNotification({
        recipientId: req.user._id,
        type: 'APPLICATION_SUBMITTED',
        title: 'Application Submitted',
        message: `Your application for "${job.title}" has been sent successfully.`,
        jobId: job._id,
        applicationId: application._id,
      }),
      createNotification({
        recipientId: job.employer,
        senderId: req.user._id,
        type: 'NEW_APPLICATION_RECEIVED',
        title: 'New Candidate Application',
        message: `${req.user.name} applied for "${job.title}" (${matchDetails.percentage}% match).`,
        jobId: job._id,
        applicationId: application._id,
      }),
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in candidate's applications
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        select: 'title location employmentType salaryRange status',
        populate: { path: 'companyProfile', select: 'companyName location' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate withdraws an active application
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Candidate)
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only withdraw your own applications.',
      });
    }

    if (['Hired', 'Rejected', 'Withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application with current status: ${application.status}`,
      });
    }

    application.status = 'Withdrawn';
    application.statusHistory.push({
      status: 'Withdrawn',
      changedBy: req.user._id,
      notes: 'Application withdrawn by candidate.',
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific employer job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not own this job listing.',
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email')
      .sort({ 'matchScore.percentage': -1, createdAt: -1 });

    // Attach rich candidate profile details
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const profile = await CandidateProfile.findOne({ user: app.candidate._id }).select(
          'headline phone location skills experienceYears education experience projects socialLinks'
        );
        return {
          ...app.toObject(),
          candidateProfile: profile,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedApplications.length,
      jobTitle: job.title,
      data: enrichedApplications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employer updates an application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes, interviewSchedule } = req.body;

    const validStatuses = [
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Rejected',
      'Hired',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('job', 'title');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You cannot update applications for jobs you do not own.',
      });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      notes: notes || `Status updated to ${status}`,
    });

    if (interviewSchedule && status === 'Interview Scheduled') {
      application.interviewSchedule = interviewSchedule;
    }

    await application.save();

    // Notify candidate of status change
    const notifType =
      status === 'Shortlisted' ? 'CANDIDATE_SHORTLISTED' : 'APPLICATION_STATUS_UPDATED';

    await createNotification({
      recipientId: application.candidate,
      senderId: req.user._id,
      type: notifType,
      title: `Application Update: ${status}`,
      message: `Your application for "${application.job.title}" is now marked as ${status}.`,
      jobId: application.job._id,
      applicationId: application._id,
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
};