const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployerProfile',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    skillsRequired: [
      {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'],
      required: true,
    },
    minExperienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      required: true,
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      isRemote: { type: Boolean, default: false },
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: false },
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'flagged'],
      default: 'active',
    },
    adminApproval: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });
jobSchema.index({ status: 1, adminApproval: 1 });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);