const groq = require('groq-sdk');       
require('dotenv').config(); 
const {forecast} = require('../train/arimaForecasting'); 

const client = new groq({
    apiKey: process.env.GROQ_API_KEY,
});

const Transaction = require('../models/Transaction');   

exports.analyzer = async (userId) => {
    try {
        const transactions = await Transaction.find({ user: userId }).sort({ date: 1 });
        const categoryDistribution = {};
        const monthlySpending = {};
        const totalSpending = transactions.reduce((sum, txn) => sum + txn.amount, 0);   
        const totalTransactions = transactions.length;
        const averageTransactionValue = totalTransactions > 0 ? (totalSpending / totalTransactions) : 0;    
        const spendingByCategory = {};
        transactions.forEach(txn => {
            if (!categoryDistribution[txn.category]) {
                categoryDistribution[txn.category] = 0;
            }
            categoryDistribution[txn.category] += txn.amount;
            const month = txn.date.toISOString().slice(0, 7);
            if (!monthlySpending[month]) {
                monthlySpending[month] = 0;
            }
            monthlySpending[month] += txn.amount;
            if (!spendingByCategory[txn.category]) {
                spendingByCategory[txn.category] = 0;
            }
            spendingByCategory[txn.category] += txn.amount;
        });

        const financeData = {
            totalSpending,
            totalTransactions,
            averageTransactionValue,
            categoryDistribution,
            monthlySpending,
            spendingByCategory
        };

        const instruction = `
        You are a certified financial advisor assistant. 
        Analyze the user's financial data and provide insights and recommendations.
        Always include a JSON block with:
        - insights (array of strings)
        - recommendations (array of strings)
        - risk_notes (string)
        - follow_up_questions (array of strings)`;

        const userPrompt = `
        User financial data:
        ${JSON.stringify(financeData, null, 2)}
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
        return { aiMessage, parsedJson };

    } catch (error) {
        console.error("Error analyzing transactions:", error);
        throw error;
    }
}
        
