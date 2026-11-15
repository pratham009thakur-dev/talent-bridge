const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  getEmployerJobs,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Optional auth middleware so public users can view jobs, while logged-in candidates get match scores
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore invalid optional tokens
    }
  }
  next();
};

router.get('/', getJobs);
router.get('/employer/my-jobs', protect, checkRole('employer'), getEmployerJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/', protect, checkRole('employer'), createJob);
router.put('/:id', protect, checkRole('employer'), updateJob);
router.delete('/:id', protect, checkRole('employer', 'admin'), deleteJob);

module.exports = router;