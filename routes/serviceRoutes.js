const express = require('express');
const { createService, getAllServices, getServiceById, getMyServices,searchServicesByKeyword } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/', protect, createService);
router.get('/my-services', protect, getMyServices);
router.get('/', protect, getAllServices);
router.get('/:id', protect, getServiceById);
router.get('/search',protect, searchServicesByKeyword);

module.exports = router;