const mongoose = require('mongoose');

const loyaltyConfigSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Null for global config
  pointsPerOrder: { type: Number, default: 10 }, // Default points awarded per order
  weeklyChallenge: { type: Number, default: 5 }, // Target number of orders for weekly challenge
  rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reward' }], // Custom rewards for the company
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LoyaltyConfig', loyaltyConfigSchema);
