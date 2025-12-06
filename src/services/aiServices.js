const Groq = require('groq-sdk');
const Advisor = require('../models/Advisor');
require('dotenv').config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getAIResponse = async ({ conversation, financialProfile, context, advisorId, message }) => {
    const selectedAdvisor = await Advisor.findById(advisorId);

    const instruction = `
    You are a certified financial advisor assistant.
    Advisor personality: ${selectedAdvisor.description}

    Give clear, tailored, actionable advice (json array).
    Always include JSON block with:
    - recommendations (array)
    - expected_savings_estimate (number)
    - risk_notes (string)
    - follow_up_questions (array)
    `;

    const userPrompt = `
    User message: ${message}

    Financial Profile : 
    ${JSON.stringify(financialProfile || {}, null, 2)}

    Context:
    ${JSON.stringify(context || {}, null, 2)}
    `;

    const messages = [
        { role: 'system', content: instruction },
        ...conversation,
        { role: 'user', content: userPrompt }
    ];

    const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 400,
        temperature: 0.2
    });

    const aiMessage = response.choices[0].message.content;

    // Extract JSON block
    let parsedJson = null;
    let jsonRaw = null;

    try {
        const jsonBlock = aiMessage.match(/```json([\s\S]*?)```/i);
        if (jsonBlock) {
            jsonRaw = jsonBlock[1];
            parsedJson = JSON.parse(jsonRaw);
        }
    } catch (err) {
        parsedJson = null;
    }

    // Extract natural text BEFORE JSON block
    let chatReply = aiMessage;
    if (jsonRaw) {
        chatReply = aiMessage.split(/```json/i)[0].trim();
    }
    console.log(chatReply, parsedJson, advisorId);
    return {
        reply: chatReply,
        structured: parsedJson,
        advisor: selectedAdvisor.name
    };
};
