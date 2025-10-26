const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
// const { financialProfile } = require('../lib/analyzer');

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
}); 

exports.getFinancialProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const transactions = await Transaction.aggregate([
            { 
            $match: { 
                userId: new mongoose.Types.ObjectId(userId), 
                date: { $gte: startOfMonth, $lte: endOfMonth } 
            } 
            },
            {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryInfo"
            }
            },
            { $unwind: "$categoryInfo" },
            {
            $group: {
                _id: "$categoryInfo.name",
                type: { $first: "$categoryInfo.categoryType" },
                total: { $sum: "$amount" }
            }
            }
        ]);

        const sumByType = (type) =>
            transactions.filter(t => t.type === type).reduce((acc, curr) => acc + curr.total, 0);

        const income = sumByType('income');
        const expenses = sumByType('expense');
        const debt = sumByType('debt');
        const investments = sumByType('invest');
        const savings = sumByType('savings');

        const livingCost = transactions
            .filter(t => ['Food', 'Rent', 'Utilities', 'Transport'].includes(t._id))
            .reduce((acc, curr) => acc + curr.total, 0);

        const cashFlow = income - expenses;

        const safeRatio = (a, b) => (b === 0 ? 0 : (a / b) * 100);

        const ratios = {
            debtRatio: safeRatio(debt, income).toFixed(2),
            investmentRatio: safeRatio(investments, income).toFixed(2),
            savingsRatio: safeRatio(cashFlow, income).toFixed(2),
            livingCostRatio: safeRatio(livingCost, income).toFixed(2)
        };

        const emergencyFundGoalMin = income * 3;
        const emergencyFundGoalMax = income * 6;
        const emergencyFundProgress = safeRatio(savings, emergencyFundGoalMax).toFixed(2);

        const profile = {
            income,
            expenses,
            cashFlow,
            ratios,
            emergencyFund: {
            goalMin: emergencyFundGoalMin,
            goalMax: emergencyFundGoalMax,
            current: savings,
            progress: emergencyFundProgress
            }
        };
        res.status(200).json({ message: "Financial profile retrieved successfully", profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }   
};

exports.financialProfileLastYear = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const instruction = `
        You are a certified financial advisor assistant. 
        Give clear actionable advice, based on the user's financial data and goals. 
        Always include a JSON block with:
        - recommendations (array of strings)`;

        const userPrompt = `
        This month history JSON:
        ${JSON.stringify(finance || {}, null, 2)}

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

        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message : error.message });
    }
}

exports.getAnalyticsInsight = async (req, res) => {
    try {
        const instruction = `
        You are a certified financial advisor assistant. 
        Give clear actionable advice, based on the user's financial data and goals. 
        Always include a JSON block with:
        - recommendations (array of strings)`;

        const userPrompt = `
        This month history JSON:
        ${JSON.stringify(finance || {}, null, 2)}

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
        let parsedJson = null;
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsedJson = JSON.parse(jsonMatch[0]);
        }
        res.json({ message: "Analytics insights retrieved successfully", insights });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
        
    }
}


exports.getYearlySpending = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ user: userId,
            date: {
                $gte: new Date(`${lastYear}-01-01`),
            }
         });

        const yearlySpending = { [lastYear]: 0, [nowYear]: 0 };

        transactions.forEach(txn => {
            const year = txn.date.getFullYear();
            if (year === lastYear || year === nowYear) {
                yearlySpending[year] += txn.amount;
            }
        });

        res.json({ message: "Yearly spending retrieved successfully", yearlySpending });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}


exports.getThisMonthSpending = async (req,res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query; 
        const currentDate = date ? new Date(date) : new Date();
        const thisMonth = currentDate.getMonth();
        const thisYear = currentDate.getFullYear();
        const startOfMonth = new Date(thisYear, thisMonth, 1);
        const endOfMonth = new Date(thisYear, thisMonth + 1, 0, 23, 59, 59, 999);
        const transactions = await Transaction.find({ user: new mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth, $lte: endOfMonth} });
        const thisMonthSpending = transactions.reduce((total, txn) => total + txn.amount, 0);
        res.json({ message: "This month spending retrieved successfully", thisMonthSpending });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}


exports.MonthlyExpensesByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query; 
        const currentDate = date ? new Date(date) : new Date();

        const thisMonth = currentDate.getMonth();
        const thisYear = currentDate.getFullYear();

        const startOfMonth = new Date(thisYear, thisMonth, 1);
        const endOfMonth = new Date(thisYear, thisMonth + 1, 0, 23, 59, 59, 999);

        const monthlyExpensesByCategory = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            { $match: { "categoryInfo.categoryType": "expense" } },
            {
                $group: {
                    _id: "$categoryInfo.name",
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    totalAmount: 1
                }
            }
        ]);

        res.json({
            message: `Expenses by category for ${thisMonth + 1}/${thisYear}`,
            monthlyExpensesByCategory
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
