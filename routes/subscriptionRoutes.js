const express = require('express');
const { createSubscription, getUserSubscriptions } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All subscription routes need authentication

router.post('/', createSubscription);
router.get('/my-subscriptions', getUserSubscriptions);

module.exports = router;