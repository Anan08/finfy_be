const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    description : {
        type : String,
        required : true,
    },
    amount : {
        type : Number,
        required : true,
    },
    category : {
        type : String,
        enum : ['food', 'transport', 'entertainment', 'utilities', 'health', 'rent', 'income','others'],
        default : 'Other'
    },
    date : {
        type : Date, 
        required : true,
    }
}, {
    timestamps : true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;