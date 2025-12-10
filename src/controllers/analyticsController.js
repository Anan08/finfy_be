const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Insight = require('../models/Insight');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const {getFinancialProfileData} = require('../lib/getFinancialProfile');

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
}); 

exports.getFinancialProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await getFinancialProfileData(userId);
        res.status(200).json({ message: "Financial profile retrieved successfully", profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }   
};

exports.getSpendingDistribution = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction
            .find({ userId })
            .populate('category');

        const expenses = transactions.filter(
            tx => tx.category.categoryType === 'expense'
        );

        let categoryMap = {};

        for (let tx of expenses) {
            const catName = tx.category.name;
            if (!categoryMap[catName]) {
                categoryMap[catName] = 0;
            }
            categoryMap[catName] += tx.amount;
        }

        const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);

        const result = Object.entries(categoryMap).map(([name, totalAmount]) => ({
            category: name,
            totalAmount,
            percentage: total === 0 ? 0 : ((totalAmount / total) * 100).toFixed(2)
        }));

        res.json({
            message: "Spending distribution retrieved",
            distribution: result
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};



exports.getAnalyticsInsight = async (req, res) => {
    try {
        const userId = req.user.id;

        const insight = await Insight.findOne({userId});
        const now = new Date();

        if (!insight) {
            await Insight.create({userId, date: now, structured: {financialProfile: []}, attempts: 0});
        };

        const isSameDay = insight.date.toDateString() === now.toDateString();

        // Limit attempts
        if (isSameDay && insight.attempts >= 2) {
            return res.status(429).json({
                message: "Maximum attempts reached for today. Try again tomorrow."
            });
        }

        // If new day, reset attempts
        if (!isSameDay) {
            insight.attempts = 0;
        }

        const financialProfile = await getFinancialProfileData(req.user.id);

        const instruction = `
        You are a certified financial advisor assistant. 
        Give clear actionable advice, based on the user's financial data and goals. 
        Always include a JSON block with:
        - clear analytics of the financial profile given atleast 6 (array of strings in indonesian language named "financialProfile")`;

        const response = await client.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: instruction },
                { role: 'user', content: JSON.stringify(financialProfile, null, 2) }
            ],
            max_tokens: 700,
            temperature: 0.2
        });

        const aiMessage = response.choices[0].message.content;
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
        const structured = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        console.log("AI Structured Response:", structured);
        
        insight.date = now;
        insight.structured = structured;
        insight.attempts += 1;

        await insight.save();


        res.json({
            message: "Analytics insights retrieved successfully",
            insights: structured.financialProfile,
            attempts : insight.attempts
        });

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

exports.getSavedInsights = async (req, res) => {
    try {
        const now = new Date();
        const userId = req.user.id;
        let insights = await Insight.find({ userId });
        if (!insights) {
            await Insight.create({userId, date: new Date(), structured: {financialProfile: []}, attempts: 0});
            res.status(200).json({ message: "No insights found. Initialized new insight.", insights: [] });
        }
        if (insights.attempts >= 2 && insights.date.toDateString() !== now.toDateString()) {
            insights.attempts = 0;
            await insights.save();
        }   
        res.status(200).json({ message: "Insights retrieved successfully", insights, attempts : insights?.[0]?.attempts ?? 0 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}