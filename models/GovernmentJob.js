const mongoose = require('mongoose');

const governmentJobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: [true, 'Job title is required']
  },
  organizationName: {
    type: String,
    required: [true, 'Department/Organization name is required']
  },
  lastDateToApply: {
    type: Date,
    required: [true, 'Last date to apply is required']
  },
  applyLink: {
    type: String,
    required: [true, 'Application link is required']
  },
  jobType: {
    type: String,
    enum: ['Govt Jobs', 'PSU Jobs', 'Semi Govt Jobs', 'MSME Jobs'],
    required: [true, 'Job type is required']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Posted by user is required']
  },
  isAdmin: {
    type: Boolean,
    default: true,
    required: [true, 'Admin status is required']
  }
}, {
  timestamps: true
});

// Middleware to ensure only admin can post government jobs
governmentJobSchema.pre('save', async function(next) {
  const User = mongoose.model('User');
  const user = await User.findById(this.postedBy);
  
  if (!user || !user.isAdmin) {
    throw new Error('Only administrators can post government jobs');
  }
  next();
});

const GovernmentJob = mongoose.model('GovernmentJob', governmentJobSchema);
module.exports = GovernmentJob;