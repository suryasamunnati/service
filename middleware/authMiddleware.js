const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, user not found'
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized, token failed'
    });
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Not authorized as admin'
    });
  }
};

module.exports = { protect, isAdmin };