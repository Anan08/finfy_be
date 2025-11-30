// POST /chat/start
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

exports.startSession = async (req, res) => {
    try {
        const { userId, advisorId } = req.body;

        const session = await ChatSession.create({
            userId,
            advisorId,
            isActive: true
        });

        res.json({
            success: true,
            sessionId: session._id
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


// POST /chat/message
exports.addMessage = async (req, res) => {
    try {
        const { sessionId, sender, message, structured } = req.body;

        const msg = await ChatMessage.create({
            chatSessionId: sessionId,
            sender,
            message,
            structured: structured || null
        });

        res.json({
            success: true,
            message: msg
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
