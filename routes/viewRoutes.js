const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/payment', protect, (req, res) => {
  res.render('payment', {
    user: req.user,
    layout: false // if you don't have a layout file yet
  });
});

module.exports = router;