const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

router.post('/:jobId', protect, checkRole('candidate'), applyToJob);
router.get('/my-applications', protect, checkRole('candidate'), getMyApplications);
router.put('/:id/withdraw', protect, checkRole('candidate'), withdrawApplication);

router.get('/job/:jobId', protect, checkRole('employer'), getJobApplicants);
router.put('/:id/status', protect, checkRole('employer'), updateApplicationStatus);

module.exports = router;