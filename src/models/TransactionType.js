const mongoose = require('mongoose');

const TransactionTypeModel = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true,
    }
}, {
    timestamps : true
});

const TransactionType = mongoose.model('TransactionType', TransactionTypeModel);    

module.exports = TransactionType;