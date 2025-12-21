const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    message: {
        type: String,
        required: false,
    },
    structured: {
        type: Object,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);