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
    }
}, {
    timestamps : true
})

const User = mongoose.model('User', userSchema);

module.exports = User;
