const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
        unique : true
    },
    job : {
        type : String,
        default : ''
    },
    age : {
        type : Number,
        min : 0,
        default : null
    },
    fullName : {
        type : String,
        default : ''
    },
    goals : {
        type : [String],
        default : []
    }
}, {
    timestamps : true
});         

module.exports = mongoose.model('Profile', profileSchema);