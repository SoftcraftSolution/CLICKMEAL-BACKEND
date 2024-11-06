const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponName: {
    type: String,
    required: true,
    maxlength: 100, // Adjust length as needed
  },
  redemptionLimit: {
    type: Number,
    required: true,
    min: 1, // Ensure redemption limit is at least 1
  },
  description: {
    type: String,
    maxlength: 500, // You can adjust this according to your needs
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  couponType: {
    type: String,
    required: true,
    enum: ['employee', 'company'], // You can extend these types if necessary
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company', // Reference to the Company model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
