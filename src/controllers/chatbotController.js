const Groq = require('groq-sdk');
const { advisorType } = require('./../lib/advisorType');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
require('dotenv').config();

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
}); 

exports.getModel = async (req, res) => {
    try {
        // tinggal balikin list advisor biar frontend bisa pilih
        res.json({ advisors: advisorType });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getChatResponse = async (req, res) => {
    try {
        const { message, finance, forecast, context, advisor } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // cari advisor personality
        const selectedAdvisor = advisorType.find(a => a.name === advisor);

        if (!selectedAdvisor) {
            return res.status(400).json({ message: 'Invalid advisor type' });
        }

        const instruction = `
        You are a certified financial advisor assistant.
        Advisor personality: ${selectedAdvisor.description}

        Give clear, tailored, actionable advice to the user.
        
        Always include a JSON block with:
        - recommendations (array of strings)
        - expected_savings_estimate (number)
        - risk_notes (string)
        - follow_up_questions (array of strings)
        `;

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
        });

        const aiMessage = response.choices[0].message.content;

        let parsedJson = null;
        try {
            const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsedJson = JSON.parse(jsonMatch[0]);
        } catch (err) {
            console.error("Failed to parse AI JSON:", err.message);
        }

        return res.status(200).json({
            reply: aiMessage,
            structured: parsedJson,
            advisor: selectedAdvisor.name
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
