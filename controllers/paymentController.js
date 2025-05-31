const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const { subscriptionType } = req.body;

    if (!subscriptionType) {
      return res.status(400).json({
        status: 'error',
        message: 'Subscription type is required'
      });
    }

    const subscriptionPrices = {
      SERVICE_SEARCH: 100,
      JOB_SEARCH: 100,
      SERVICE_POST: 500
    };

    if (!subscriptionPrices[subscriptionType]) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subscription type'
      });
    }

    const amount = subscriptionPrices[subscriptionType];
    
    // Generate a shorter receipt ID (max 40 chars)
    const timestamp = Date.now().toString().slice(-8);
    const userId = req.user._id.toString().slice(-6);
    const receipt = `sub_${userId}_${timestamp}`;
    
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: receipt,
      notes: {
        subscriptionType: subscriptionType,
        userId: req.user._id.toString()
      }
    };

    console.log('Creating order with options:', options);

    const order = await razorpay.orders.create(options);
    
    console.log('Order created:', order);

    res.status(200).json({
      status: 'success',
      data: {
        order,
        key: process.env.RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Service Infotek',
        description: `Subscription for ${subscriptionType}`,
        prefill: {
          name: req.user.name,
          email: req.user.email,
          contact: req.user.phone
        }
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Error creating order',
      details: error.error?.description || error.error
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, subscriptionType } = req.body;
    
    console.log('Verification payload:', {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      subscriptionType
    });

    // Define subscription prices
    const subscriptionPrices = {
      SERVICE_SEARCH: 100,
      JOB_SEARCH: 100,
      SERVICE_POST: 500
    };

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !subscriptionType) {
      console.error('Missing required fields:', { razorpay_payment_id, razorpay_order_id, razorpay_signature, subscriptionType });
      return res.status(400).json({
        status: 'error',
        message: 'Missing required payment information'
      });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log('Signature verification:', {
      expected: expectedSignature,
      received: razorpay_signature
    });

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('Signature verification failed');
      return res.status(400).json({
        status: 'error',
        message: 'Payment verification failed: Invalid signature'
      });
    }

    // Verify payment status with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      console.error('Payment not captured:', payment.status);
      return res.status(400).json({
        status: 'error',
        message: `Payment verification failed: Payment status is ${payment.status}`
      });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      subscriptionType,
      amount: subscriptionPrices[subscriptionType],
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: 'completed'
    });

    // Calculate subscription end date (365 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365);

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user._id,
      type: subscriptionType,
      startDate: new Date(),
      endDate
    });

    console.log('Payment verification successful:', {
      transactionId: transaction._id,
      subscriptionId: subscription._id
    });

    res.status(200).json({
      status: 'success',
      data: {
        transaction,
        subscription
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Payment verification failed',
      details: error.message
    });
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: {
        transactions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};