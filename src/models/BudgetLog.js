const mongoose = require('mongoose');

const BudgetLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    budgetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget',
        required: true
    },
    status : {
        type : Boolean
    },
    date : {
        type : Date
    }
}, {
    timestamps : true
});

const BudgetLog = mongoose.model('BudgetLog', BudgetLogSchema);

module.exports = BudgetLog;