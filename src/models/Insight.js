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
    recommendations: {
      type: [String],
      default: []
    },
    expected_savings_estimate: {
      type: Number,
      default: 0
    },
    risk_notes: {
      type: String,
      default: ''
    },
    follow_up_questions: {
      type: [String],
      default: []
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Insight', insightSchema);
