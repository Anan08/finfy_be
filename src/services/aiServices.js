const Groq = require('groq-sdk');
require('dotenv').config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getAIResponse = async ({ conversation, financialProfile, context, message }) => {

  // Detect if user is asking for financial advice
  const wantsAdvice = /(advice|saran|keuangan|invest|tabungan|hutang|pinjaman|debt|finansial|saving)/i.test(message);

  // Build system instruction
  const instruction = wantsAdvice ? `
    You are a certified financial advisor assistant.

    Rules:
    - Always produce a JSON block with keys: content, recap, following_questions.
    - content: casual, empathetic advice in conversational Indonesian.
    - recap: short recap of user's question or financial status (optional if not relevant).
    - following_questions: 2-3 questions to better understand user's finances.
    - Only give advice relevant to financialProfile and context provided.
    - Emphasize actionable steps.
    - Do not assume missing info.
    - JSON must be strictly valid inside \`\`\`json ... \`\`\`.
    - You may add a short casual intro before JSON block if needed.
    ` : `
    You are a friendly assistant. User is just chatting.
    - Respond naturally in conversational Indonesian.
    - Do not produce JSON.
    - Keep it light and engaging.
    - also the financial profile and context is provided for your reference only, do not mention them unless asked.
    - profile given doesnt have specific timeframe unless asked.
    `;

    const userPrompt = `
    User message: ${message}

    Financial Profile: ${JSON.stringify(financialProfile || {}, null, 2)}

    Context: ${JSON.stringify(context || {}, null, 2)}
    `;

  const messages = [
    { role: 'system', content: instruction },
    ...(conversation || []),
    { role: 'user', content: userPrompt }
  ];

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 700,
    temperature: 0.2
  });

  const aiMessage = response.choices[0].message.content;

  let parsedJson = null;
  let chatReply = aiMessage.trim();

  // Extract JSON if advice is requested
  if (wantsAdvice) {
    const jsonBlock = aiMessage.match(/```json\s*([\s\S]*?)```/i);
    if (jsonBlock) {
      const jsonRaw = jsonBlock[1].trim();
      try {
        parsedJson = JSON.parse(jsonRaw);
      } catch (err) {
        console.warn("JSON parse error:", err);
        parsedJson = null;
      }
      console.log("Extracted JSON:", parsedJson);

      // Keep casual intro text before JSON
      const splitIndex = aiMessage.indexOf(jsonBlock[0]);
      chatReply = aiMessage.slice(0, splitIndex).trim();
    }
  }

  return {
    reply: chatReply,
    structured: parsedJson
  };
};
