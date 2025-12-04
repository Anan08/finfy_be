const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    chatSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true,
    },
    sender: {
        type: String,
        enum: ['user', 'advisor', 'system'],
        required: true,
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