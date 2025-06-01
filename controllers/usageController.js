const Usage = require('../models/Usage');

// Check if it's the user's first time using a service
const checkFirstUse = async (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ message: 'Type query parameter is required' });
  }

  try {
    const existingUsage = await Usage.findOne({ userId: req.user.id, type });
    const isFirstTime = !existingUsage;
    res.json({ isFirstTime });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Record the user's usage of a service
const recordUsage = async (req, res) => {
  const { type } = req.body;
  if (!type) {
    return res.status(400).json({ message: 'Type is required in request body' });
  }

  try {
    const existingUsage = await Usage.findOne({ userId: req.user.id, type });
    if (existingUsage) {
      return res.status(400).json({ message: 'Usage already recorded' });
    }

    const newUsage = new Usage({ userId: req.user.id, type });
    await newUsage.save();
    res.status(201).json({ message: 'Usage recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { checkFirstUse, recordUsage };
