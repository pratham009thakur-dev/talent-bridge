const Job = require('../models/Job');
const EmployerProfile = require('../models/EmployerProfile');
const CandidateProfile = require('../models/CandidateProfile');
const { calculateMatch } = require('../services/matchingEngine');

// @desc    Search and filter active jobs with pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      employmentType,
      experienceLevel,
      minSalary,
      isRemote,
      sort = 'latest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      status: 'active',
      adminApproval: 'approved',
    };

    if (keyword && keyword.trim()) {
      const searchRegex = new RegExp(keyword.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skillsRequired: searchRegex },
      ];
    }

    if (location && location.trim()) {
      const locRegex = new RegExp(location.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ 'location.city': locRegex }, { 'location.state': locRegex }],
      });
    }

    if (employmentType && employmentType !== 'All') {
      query.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== 'All') {
      query.experienceLevel = experienceLevel;
    }

    if (minSalary && !isNaN(Number(minSalary))) {
      query['salaryRange.max'] = { $gte: Number(minSalary) };
    }

    if (isRemote === 'true') {
      query['location.isRemote'] = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'salary_high') {
      sortOption = { 'salaryRange.max': -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .populate('companyProfile', 'companyName companyWebsite industry location verificationStatus')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job details + related jobs + optional candidate match score
// @route   GET /api/jobs/:id
// @access  Public / Optional Auth
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'companyProfile',
      'companyName companyWebsite industry companySize about location verificationStatus'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    // Increment view counter non-blockingly
    Job.updateOne({ _id: job._id }, { $inc: { viewsCount: 1 } }).exec();

    // Fetch related jobs based on overlapping skills or same category
    const relatedJobs = await Job.find({
      _id: { $ne: job._id },
      status: 'active',
      adminApproval: 'approved',
      $or: [
        { skillsRequired: { $in: job.skillsRequired } },
        { experienceLevel: job.experienceLevel },
      ],
    })
      .populate('companyProfile', 'companyName location')
      .limit(4)
      .sort({ createdAt: -1 });

    // Compute match score if authenticated candidate requests the job
    let matchEvaluation = null;
    if (req.user && req.user.role === 'candidate') {
      const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });
      if (candidateProfile) {
        matchEvaluation = calculateMatch(candidateProfile, job);
      }
    }

    res.status(200).json({
      success: true,
      data: job,
      relatedJobs,
      matchEvaluation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer)
const createJob = async (req, res, next) => {
  try {
    const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
    if (!employerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Complete your company profile before posting jobs.',
      });
    }

    const {
      title,
      description,
      requirements,
      responsibilities,
      skillsRequired,
      experienceLevel,
      minExperienceYears,
      employmentType,
      location,
      salaryRange,
      openings,
    } = req.body;

    if (!title || !description || !skillsRequired || !experienceLevel || !employmentType || !location?.city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, skillsRequired, experienceLevel, employmentType, location.city.',
      });
    }

    const formattedSkills = Array.isArray(skillsRequired)
      ? skillsRequired.map((s) => s.trim().toLowerCase()).filter(Boolean)
      : skillsRequired.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

    const job = await Job.create({
      employer: req.user._id,
      companyProfile: employerProfile._id,
      title: title.trim(),
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      skillsRequired: formattedSkills,
      experienceLevel,
      minExperienceYears: Number(minExperienceYears) || 0,
      employmentType,
      location,
      salaryRange,
      openings: Number(openings) || 1,
      status: 'active',
      adminApproval: 'approved',
    });

    res.status(201).json({
      success: true,
      message: 'Job opening published successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by logged-in employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
const getEmployerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
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

// @desc    Update an employer's own job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only edit your own job postings.',
      });
    }

    const updates = { ...req.body };
    if (updates.skillsRequired) {
      updates.skillsRequired = Array.isArray(updates.skillsRequired)
        ? updates.skillsRequired.map((s) => s.trim().toLowerCase()).filter(Boolean)
        : updates.skillsRequired.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    }

    // Prevent employer from overriding admin moderation flags directly
    delete updates.adminApproval;
    delete updates.employer;

    job = await Job.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job listing updated successfully.',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an employer's job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Unauthorized to delete this listing.',
      });
    }

    await Job.deleteOne({ _id: job._id });

    res.status(200).json({
      success: true,
      message: 'Job listing deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  getEmployerJobs,
  updateJob,
  deleteJob,
};