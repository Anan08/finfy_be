const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
        minlength : 8,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    emailVerificationToken : {
        type : String,
        default : null
    },
    resetPasswordToken : {
        type : String,
        default : null
    }
}, {
    timestamps : true
})

const User = mongoose.model('User', userSchema);

module.exports = User;
