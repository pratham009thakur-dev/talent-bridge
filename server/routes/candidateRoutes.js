const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAndParseResume,
  downloadResume,
  toggleSavedJob,
  getSavedJobs,
  getCandidateDashboard,
} = require('../controllers/candidateController');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { uploadResume } = require('../middleware/upload');

router.get('/dashboard', protect, checkRole('candidate'), getCandidateDashboard);
router.get('/profile', protect, checkRole('candidate'), getProfile);
router.put('/profile', protect, checkRole('candidate'), updateProfile);
router.post(
  '/resume/upload',
  protect,
  checkRole('candidate'),
  uploadResume.single('resume'),
  uploadAndParseResume
);
// Securely accessible by Candidate owner, Admin, or Employer with application
router.get('/resume/download/:candidateId', protect, downloadResume);

router.get('/saved-jobs', protect, checkRole('candidate'), getSavedJobs);
router.post('/saved-jobs/:jobId', protect, checkRole('candidate'), toggleSavedJob);

module.exports = router;