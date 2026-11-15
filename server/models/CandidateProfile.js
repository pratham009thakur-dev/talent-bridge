const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  fieldOfStudy: { type: String, default: '' },
  startYear: { type: Number },
  endYear: { type: Number },
  grade: { type: String, default: '' },
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, default: '' },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String, trim: true }],
  link: { type: String, default: '' },
});

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [150, 'Headline cannot exceed 150 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience years cannot be negative'],
    },
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    resume: {
      filename: { type: String, default: '' },
      originalName: { type: String, default: '' },
      path: { type: String, default: '' },
      uploadDate: { type: Date },
      extractedText: { type: String, default: '' },
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

candidateProfileSchema.index({ skills: 1 });
candidateProfileSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);