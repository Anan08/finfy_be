const mongoose = require('mongoose');

const advisorSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true,
        trim : true 
    },
    description : {
        type : String, 
        default : ''
    }
}, {
    timestamps : true
});

const Advisor = mongoose.model('Advisor', advisorSchema);    

module.exports = Advisor;