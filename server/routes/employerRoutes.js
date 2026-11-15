const express = require('express');
const router = express.Router();
const {
  getCompanyProfile,
  updateCompanyProfile,
  getEmployerDashboard,
} = require('../controllers/employerController');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

router.use(protect, checkRole('employer'));

router.get('/dashboard', getEmployerDashboard);
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);

module.exports = router;