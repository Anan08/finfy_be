const ChatMessage = require('../models/ChatMessage');
const { getAIResponse } = require('../services/aiServices');
const { getFinancialProfileData } = require('../lib/getFinancialProfile');

exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await ChatMessage
            .find({ userId: userId })
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
        const userId = req.user.id;
        await ChatMessage.deleteMany({ userId: userId });

        res.json({
            success: true,
            message: "Chat cleared."
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id
        // SAVE USER MESSAGE
        if (!message) return res.status(400).json({message : "Message is Required"})
        const userMessage = await ChatMessage.create({
            userId : userId,
            sender: 'user',
            message,
        });

        // GET CHAT HISTORY (INCLUDING USER MESSAGE ABOVE)
        const history = await ChatMessage
            .find({ userId })
            .sort({ createdAt: 1 });

        // CONVERT MONGODB DOCS INTO AI-FRIENDLY FORMAT
        const chatConversation = history.map(h => ({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.message
        }));

        // GET FINANCIAL PROFILE DATA
        const financialProfile = await getFinancialProfileData(userId);

        const ai = await getAIResponse({
            message,
            conversation: chatConversation,
            financialProfile,
            context: {
                "occupation" : "mahasiswa",
                "age" : 22,
                "financial_goals" : ["Savings for emergency fund", "Investing for retirement"]
            }
        });

        const aiMessage = await ChatMessage.create({
            userId,
            sender: 'assistant',
            message: ai.reply,
            structured: ai.structured || null,
        });

        res.json({
            success: true,
            message : [userMessage, aiMessage]
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};
