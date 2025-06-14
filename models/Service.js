const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'At least one category is required']
  }],
  price: {
      type: Number,
      default: null
    
  },
  location: {
    district: {
      type: String,
      required: [true, 'District is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  isCompanyPost: {
    type: Boolean,
    default: false
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;