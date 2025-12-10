const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date : {
    type: Date,
    required: true
  },
  structured: {
    financialProfile: {
      type: [String],
      default: []
    }
  },
  attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Insight', insightSchema);
