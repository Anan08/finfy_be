const mongoose = require('mongoose');

const financialProfileHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true,
    index: true
  },
  profile: {
    income: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    cashFlow: { type: Number, default: 0 },
    ratios: {
      debtRatio: { type: String, default: "0.00" },
      investmentRatio: { type: String, default: "0.00" },
      savingsRatio: { type: String, default: "0.00" },
      livingCostRatio: { type: String, default: "0.00" }
    },
    emergencyFund: {
      goalMin: { type: Number, default: 0 },
      goalMax: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      progress: { type: String, default: "0.00" }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

financialProfileHistorySchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('FinancialProfileHistory', financialProfileHistorySchema);
