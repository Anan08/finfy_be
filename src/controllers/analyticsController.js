const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const Groq = require('groq-sdk');
const { financialProfile } = require('../lib/analyzer');

// exports.getCategoryDistribution = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const transactions = await Transaction.find({ user: userId });
//         const categoryDistribution = {};

//         transactions.forEach(txn => {
//             if (!categoryDistribution[txn.category]) {
//                 categoryDistribution[txn.category] = 0;
//             }
//             categoryDistribution[txn.category] += txn.amount;
//         })

//         res.json({message : "Category distribution retrieved successfully", categoryDistribution : categoryDistribution});
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: error.message });
//     }

// }

exports.getFinancialProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await financialProfile(userId);
        res.status(200).json({ message: "Financial profile retrieved successfully", profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }   
};

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
            { $match: { "categoryInfo.categoryType": "Expense" } },
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
