const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Insight = require('../models/Insight');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const getFinancialProfileData = require('../lib/getFinancialProfile');

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
}); 

exports.autoCategorize = async (userId, categoryList) => {
    const prompt = `Categorize the following transaction into one of these categories _id
    
    categories : ${json.stringify(categoryList)}
    `;
    const response = await client.generateText({
        prompt,
        maxTokens: 10,
        temperature: 0.5,
    });
    const categoryId = response.text.trim();
    return categoryId;
};

exports.autoCategorizeTransactions = async (userId, categoryList) => {
    const uncategorizedTransactions = await Transaction.find({
        userId,
        category: null
    });
    for (let tx of uncategorizedTransactions) {
        const prompt = `Categorize the following transaction into one of these categories _id
        
        categories : ${json.stringify(categoryList)}
        `;
        const response = await client.generateText({
            prompt,
            maxTokens: 10,
            temperature: 0.5,
        });
        const categoryName = response.text.trim();
        let category = await Category.findOne({ name: categoryName });  
        if (!category) {
            category = await Category.findOne({ name: 'Other' });
        }
        tx.category = category._id;
        await tx.save();
    }
    res.json({
        message: "Transactions auto-categorized successfully",
        count: uncategorizedTransactions.length
    });
};
