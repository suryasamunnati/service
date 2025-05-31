const express = require('express');
const { createOrder, verifyPayment, getMyTransactions } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Keep this one global middleware

router.post('/create-order', createOrder); // Remove duplicate protect
router.post('/verify-payment', verifyPayment);
router.get('/my-transactions', getMyTransactions);

module.exports = router;