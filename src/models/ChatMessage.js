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
        required: true,
    },
    structured: {
        type: Object,
        default: null,
    },
}, { timestamps: true });
