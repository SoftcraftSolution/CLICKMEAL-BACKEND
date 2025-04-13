const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true }, // Positive for earning, negative for redeeming
  description: { type: String }, // E.g., "Earned from order", "Redeemed for reward"
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Linked order (if applicable)
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward' }, // Linked reward (if applicable)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PointsHistory', pointsHistorySchema);
