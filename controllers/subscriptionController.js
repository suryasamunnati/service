const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  try {
    const { type } = req.body;
    
    // Calculate end date (365 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365);

    // Check if user already has an active subscription of this type
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      type,
      endDate: { $gte: new Date() }
    });

    if (existingSubscription) {
      return res.status(400).json({
        status: 'error',
        message: 'You already have an active subscription of this type'
      });
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      type,
      endDate
    });

    res.status(201).json({
      status: 'success',
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user._id,
      endDate: { $gte: new Date() }
    });

    res.status(200).json({
      status: 'success',
      data: {
        subscriptions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};