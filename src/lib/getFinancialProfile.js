const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Insight = require('../models/Insight');
const mongoose = require('mongoose');

exports.getFinancialProfileDataMonthly = async (userId) => {
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
        return profile;
};

exports.getFinancialProfileData = async(userId) => {

        const transactions = await Transaction.aggregate([
            { 
            $match: { 
                userId: new mongoose.Types.ObjectId(userId),  
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
        return profile;
}


exports.getFinancialProfileDataEachMonth = async (userId) => {
    const transactions = await Transaction.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
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
            $addFields: {
                month: {
                    $dateToString: { format: "%Y-%m", date: "$date" }
                }
            }
        },
        {
            $group: {
                _id: {
                    month: "$month",
                    category: "$categoryInfo.name",
                    type: "$categoryInfo.categoryType"
                },
                total: { $sum: "$amount" }
            }
        }
    ]);

    // Group per month secara rapi
    const months = {};

    // Helper
    const safeRatio = (a, b) => (b === 0 ? 0 : (a / b) * 100);

    for (const t of transactions) {
        const month = t._id.month;

        if (!months[month]) {
            months[month] = {
                income: 0,
                expenses: 0,
                debt: 0,
                investments: 0,
                savings: 0,
                livingCost: 0
            };
        }

        const data = months[month];

        // Input berdasarkan type
        switch (t._id.type) {
            case "income":
                data.income += t.total;
                break;
            case "expense":
                data.expenses += t.total;
                break;
            case "debt":
                data.debt += t.total;
                break;
            case "invest":
                data.investments += t.total;
                break;
            case "savings":
                data.savings += t.total;
                break;
        }

        // living cost categories
        const livingItems = ["Food", "Rent", "Utilities", "Transport"];
        if (livingItems.includes(t._id.category)) {
            data.livingCost += t.total;
        }
    }

    // Build final profile per month
    const result = {};

    for (const [month, d] of Object.entries(months)) {
        const cashFlow = d.income - d.expenses;

        const emergencyFundGoalMin = d.income * 3;
        const emergencyFundGoalMax = d.income * 6;

        result[month] = {
            income: d.income,
            expenses: d.expenses,
            cashFlow,
            ratios: {
                debtRatio: safeRatio(d.debt, d.income).toFixed(2),
                investmentRatio: safeRatio(d.investments, d.income).toFixed(2),
                savingsRatio: safeRatio(cashFlow, d.income).toFixed(2),
                livingCostRatio: safeRatio(d.livingCost, d.income).toFixed(2)
            },
            emergencyFund: {
                goalMin: emergencyFundGoalMin,
                goalMax: emergencyFundGoalMax,
                current: d.savings,
                progress: safeRatio(d.savings, emergencyFundGoalMax).toFixed(2)
            }
        };
    }

    return result;
};
