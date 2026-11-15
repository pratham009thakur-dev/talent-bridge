const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeSnapshot: {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Rejected',
        'Hired',
        'Withdrawn',
      ],
      default: 'Applied',
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: {
          type: String,
          default: '',
        },
      },
    ],
    interviewSchedule: {
      date: { type: Date },
      link: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    matchScore: {
      percentage: { type: Number, default: 0 },
      matchingSkills: [{ type: String }],
      missingSkills: [{ type: String }],
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);