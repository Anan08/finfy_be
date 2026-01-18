const Groq = require('groq-sdk');
require('dotenv').config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getAIResponse = async ({ conversation, financialProfile, context, message }) => {
  // Build system instruction
  const instruction = `
    You are a friendly assistant. User is just chatting.
    - Respond naturally in conversational Indonesian.
    - Do not produce JSON.
    - Keep it light and engaging.
    - also the financial profile and context is provided for your reference only, do not mention them unless asked.
    - profile given doesnt have specific timeframe unless asked.
    - dont make up data that isnt in the profile.
    - if user asks for financial advice based on the profile, provide advice in a normal text response, no need to mention the profile data, and no need to provide explanation about the profile.
    - if user asks for financial advice based on the profile, no need to generate json data.
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

  // // Extract JSON if advice is requested
  // if (wantsAdvice) {
  //   const jsonBlock = aiMessage.match(/```json\s*([\s\S]*?)```/i);
  //   if (jsonBlock) {
  //     const jsonRaw = jsonBlock[1].trim();
  //     try {
  //       parsedJson = JSON.parse(jsonRaw);
  //     } catch (err) {
  //       console.warn("JSON parse error:", err);
  //       parsedJson = null;
  //     }
  //     console.log("Extracted JSON:", parsedJson);

  //     // Keep casual intro text before JSON
  //     const splitIndex = aiMessage.indexOf(jsonBlock[0]);
  //     chatReply = aiMessage.slice(0, splitIndex).trim();
  //   }
  // }

  return {
    reply: chatReply,
    structured: parsedJson
  };
};
