const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { buildFinancialProfile } = require('./financialProfileCore');

exports.getFinancialProfileDataMonthly = async (userId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return buildFinancialProfile({
        userId,
        startDate: startOfMonth,
        endDate: endOfMonth
    });
};

exports.getFinancialProfileData = async (userId) => {
    return buildFinancialProfile({userId});
};

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
