require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

exports.financialProfile = async (userId) => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const transactions = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId)} },
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
        type: { $first: "$categoryInfo.type" },
        total: { $sum: "$amount" }
      }
    }
  ]);

  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.total, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.total, 0);

  const debt = transactions.find(t => t._id.toLowerCase().includes('debt'))?.total || 0;
  const investments = transactions.find(t => t._id.toLowerCase().includes('invest'))?.total || 0;
  const livingCost = transactions
    .filter(t => ["food", "rent", "utilities", "transport"].some(k => t._id.toLowerCase().includes(k)))
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
  const savings = transactions.find(t => t._id.toLowerCase().includes('saving'))?.total || 0;
  const emergencyFundProgress = safeRatio(savings, emergencyFundGoalMax).toFixed(2);

  return {
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
};

