const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getAllUsers,
  toggleUserStatus,
  getAllJobsForModeration,
  moderateJobListing,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

router.use(protect, checkRole('admin'));

router.get('/dashboard', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/jobs', getAllJobsForModeration);
router.put('/jobs/:id/moderate', moderateJobListing);

module.exports = router;