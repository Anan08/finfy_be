const Groq = require('groq-sdk');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
require('dotenv').config();

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
}); 


exports.getChatResponse =  async (req, res) => {
    try {
        const { message, finance, forecast, context } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }
        

        const instruction = `
        You are a certified financial advisor assistant. 
        Give clear actionable advice. 
        Always include a JSON block with:
        - recommendations (array of strings)
        - expected_savings_estimate (number)
        - risk_notes (string)
        - follow_up_questions (array of strings)`;

        const userPrompt = `
        User message: ${message}
        Finance history JSON:
        ${JSON.stringify(finance || {}, null, 2)}

        Forecast JSON:
        ${JSON.stringify(forecast || {}, null, 2)}

        User context:
        ${JSON.stringify(context || {}, null, 2)}
        `;

        const response = await client.chat.completions.create({
            model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: instruction },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 700,
                temperature: 0.2
        })

        const aiMessage = response.choices[0].message.content;
         // 🛠 Extract JSON block from the AI message
        let parsedJson = null;
        try {
            const jsonMatch = aiMessage.match(/\{[\s\S]*\}/); // find {...}
            if (jsonMatch) {
                parsedJson = JSON.parse(jsonMatch[0]);
            }
        } catch (err) {
            console.error("Failed to parse AI JSON:", err.message);
        }

        return res.status(200).json({
            reply: aiMessage,
            structured: parsedJson // ✅ structured JSON if available
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}
