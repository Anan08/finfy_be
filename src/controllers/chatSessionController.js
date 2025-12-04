// POST /chat/start
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { getAIResponse } = require('../services/aiServices');
const { getFinancialProfileData } = require('../lib/getFinancialProfile');

exports.startSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { advisorId } = req.body;

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

exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const messages = await ChatMessage
            .find({ chatSessionId: sessionId })
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            messages
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


// POST /chat/reset
exports.resetChat = async (req, res) => {
    try {
        const { sessionId } = req.body;

        await ChatMessage.deleteMany({ chatSessionId: sessionId });

        res.json({
            success: true,
            message: "Chat cleared."
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /chat/end
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.body;

        await ChatSession.findByIdAndUpdate(sessionId, {
            isActive: false
        });

        res.json({
            success: true,
            message: "Session ended."
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ message: 'Session ID and message are required.' });
        }

        const session = await ChatSession.findById(sessionId);
        if (!session || !session.isActive) {
            return res.status(400).json({ message: 'Invalid or inactive chat session.' });
        }

        const userMessage = await ChatMessage.create({
            chatSessionId: sessionId,
            sender: 'user',
            message,
        });

        const financialProfile = await getFinancialProfileData(req.user.id);
        const context = {
            "occupation" : "mahasiswa",
            "age" : 22,
            "financial_goals" : ["Savings for emergency fund", "Investing for retirement"],
            "risk_tolerance" : "medium",
            "income" : 5000000,
            "monthly_expenses" : 3000000
        }

        const ai = await getAIResponse({sessionId, message, financialProfile : financialProfile, context : context, advisorId : session.advisorId});
        const aiMessage = await ChatMessage.create({
            chatSessionId: sessionId,
            sender: 'advisor',
            message: ai.reply,
            structured: ai.structured || null,
        });

        res.json({
            success: true,
            user : userMessage,
            ai: aiMessage
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
} 

exports.getUserSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            sessions
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};