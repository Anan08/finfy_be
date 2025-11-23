const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Insight = require('../models/Insight');
const mongoose = require('mongoose');

exports.getFinancialProfileData = async (userId) => {
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

exports.getTotalFinancialProfile = async (userId) => {};
