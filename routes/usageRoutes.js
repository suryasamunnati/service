const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkFirstUse, recordUsage } = require('../controllers/usageController');

router.get('/check-first-use', protect, checkFirstUse);
router.post('/record', protect, recordUsage);

module.exports = router;
