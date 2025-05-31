const express = require('express');
const { createJob, getAllJobs, getJobById, getMyJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/', protect, createJob);
router.get('/my-jobs', protect, getMyJobs);
router.get('/', protect, getAllJobs);
router.get('/:id', protect, getJobById);

module.exports = router;