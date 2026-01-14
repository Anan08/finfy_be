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

        
        // If new day, reset attempts
        if (!isSameDay) {
            insight.attempts = 0;
        }

        
        // // Limit attempts        
        // if (isSameDay && insight.attempts >= 2) {
        //     return res.status(429).json({
        //         message: "Maximum attempts reached for today. Try again tomorrow."
        //     });
        // }

        const financialProfile = await getFinancialProfileData(req.user.id);

        const instruction = `
        You are a certified financial advisor assistant. 
        Give clear actionable advice, based on the user's financial data and goals. all in indonesian language.
        note all data provided is not set in a specific timeframe unless specified, so you dont need to include word monthly or the similar words. 
        Always include a JSON block with:
        - a recap of user cashflow based on the financial ratios given named "recap", with rules:
            - if savings rate is below 20%, mention need to save more
            - if debt-to-income ratio is above 20%, mention need to reduce debt
            - if emergency fund months is below 3, mention need to build emergency fund
            - if investment rate is below 20%, mention need to invest more
            - if all ratios are healthy, congratulate the user
            - provide suggestions for improvement based on the ratios
            - if condition of the recap is positive, label condition as "good", else "normal" or "bad"
            - recap shouldn't encourage unhealthy financial behavior such as overspending or excessive risk-taking or encouraging to have debt
        - an array named "insight" containing:
            - key: "insight" - concise summary of the user's financial situation based on the financial profile given, with rules:
                - insights should be specific and data-driven
                - insights should cover spending habits, saving patterns, debt levels, and investment behavior
                - insights should identify both strengths and areas for improvement
                - insights shouldn't be encouraging unhealthy financial behavior such as overspending or excessive risk-taking
                - insights should be personalized based on user's financial goals if there's none given, assume the user wants to improve overall financial health
                - insights should not exceed 3 items
                - insights should not repeat the recap
                - insights should be in indonesian language
                - insights should provide value beyond the recap
                - insights should be actionable
                - insights should be simple and easy to understand no technical terms and no need to explain financial terms also dont use so much words
            - key: "advice"
        - clear simple advice based on the financial profile given named "advice", with rules:
            - advice should be practical and easy to implement
            - advice should cover budgeting, saving, debt management, and investing
            - advice should be personalized based on user's financial goals
        Respond in the following JSON format:
        {
            "recap": {
                "recap": "...",
                "condition": "good/normal/bad"
            },
            "insight": [
                {
                    "insight": "...",
                    "advice": "..."
                }
            ],
            "advice": "..."
        }`;

        const response = await client.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: instruction },
                { role: 'user', content: JSON.stringify(financialProfile, null, 2) }
            ],
            max_tokens: 1000,
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
            structured
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
            await Insight.create({userId, date: new Date(), structured: {}, attempts: 0});
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