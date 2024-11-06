const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  rewardName: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: false,
  },
  requiredPointsToRedeemReward: {
    type: Number,
    required: true,
  },
  rewardCode: {
    type: String,
    required: false,
  },
  rewardDescription: {
    type: String,
    required: false,
  },
  redemptionLimit: {
    type: Number,
    required: false,
  },
  image: {
    type: String, // This assumes a file URL or path. Adjust if needed.
  },
  aboutOffer: {
    type: [String], // Array to store multiple "About Offer" points
    required: false,
  },
  termsOfUse: {
    type: [String], // Array to store multiple "Terms of Use" points
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default to the current date
  }
});

module.exports = mongoose.model('Reward', rewardSchema);
