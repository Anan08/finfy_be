const groq = require('groq-sdk');

const client = new groq({
    apiKey: process.env.GROQ_API_KEY,
});

exports.generateGroqInsight = async (financialData, instruction) => {
    const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: instruction },
            { role: 'user', content: JSON.stringify(financialData, null, 2) }
        ],
        max_tokens: 700,
        temperature: 0.2
    });
    const aiMessage = response.choices[0].message.content;
    const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
};

