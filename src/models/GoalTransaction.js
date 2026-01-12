const mongoose = require('mongoose');

const GoalTransactionSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
  },
    amount: {
    type: Number,
    required: true,
  },
  transactionType : {
    type : String,
    enum : ['add', 'subtract'],
    required : true
  }
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GoalTransaction', GoalTransactionSchema);