const Groq = require('groq-sdk');
require('dotenv').config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getAIResponse = async ({ conversation, financialProfile, context, message }) => {
  // Build system instruction
  const instruction = `
    You are a friendly assistant. User is just chatting.
    - Respond naturally in conversational Indonesian.
    - Keep it light and engaging.
    - also the financial profile and context is provided for your reference only, do not mention them unless asked.
    - profile given doesnt have specific timeframe unless asked.
    - dont make up data that isnt in the profile.
    - all the data given isnt for specific timeframe unless user explicitly ask for it so no need to mention the timeframe such as "monthly", "yearly", etc.
    - if user asks for "rekap keuangan" (financial summary), you MUST:
      1. Respond with a friendly confirmation like "yap, ini hasil rekap keuangan kamu, bisa didownload langsung".
      2. Include a JSON block wrapped in \`\`\`json ... \`\`\` with this structure:
      {
        "type": "FINANCIAL_SUMMARY",
        "data": {
          "total_income": number,
          "total_outcome": number,
          "distribution": [ { "category": string, "totalAmount": number, "percentage": number } ],
          "timeline": [ { "date": string, "total": number } ],
          "insights": string[]
        }
      }
    - for regular chat or advice, DO NOT produce JSON.
    `;

  const userPrompt = `
    User message: ${message}

    Financial Profile: ${JSON.stringify(financialProfile || {}, null, 2)}

    Context: ${JSON.stringify(context || {}, null, 2)}

    Extra Data (for summary): ${JSON.stringify(context.extraData || {}, null, 2)}
    `;

  const messages = [
    { role: 'system', content: instruction },
    ...(conversation || []),
    { role: 'user', content: userPrompt }
  ];

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 1000,
    temperature: 0.2
  });

  const aiMessage = response.choices[0].message.content;

  let parsedJson = null;
  let chatReply = aiMessage.trim();

  // Extract JSON if present
  const jsonBlock = aiMessage.match(/```json\s*([\s\S]*?)```/i);
  if (jsonBlock) {
    const jsonRaw = jsonBlock[1].trim();
    try {
      parsedJson = JSON.parse(jsonRaw);
      // Remove JSON block from the chat reply
      chatReply = aiMessage.replace(jsonBlock[0], '').trim();
    } catch (err) {
      console.warn("JSON parse error:", err);
    }
  }

  return {
    reply: chatReply,
    structured: parsedJson
  };
};
