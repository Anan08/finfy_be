require('dotenv').config(); 
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');   

exports.financialProfile = async (userId) => {
    try {
        const transactions = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
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

    const debt = transactions.find(t => t.type === 'debt')?.total || 0; 
    const investments = transactions.find(t => t.type === 'invest')?.total || 0; 
    const livingCost = transactions.filter(t => ["food", "rent", "utilities", "transport"].some(k => t._id.toLowerCase().includes(k))).reduce((acc, curr) => acc + curr.total, 0);
    const cashFlow = income - expenses;
    const ratios = {
      debtRatio : ((debt / income) * 100).toFixed(2),
      investmentsRatio : ((investments / income) * 100).toFixed(2),
      savingsRatio : ((cashFlow / income) * 100).toFixed(2),
      livingCostRatio : ((livingCost / income) * 100).toFixed(2)
    };

    const emergencyFundGoalMin = income * 3;
    const emergencyFundGoalMax = income * 6;
    const savings = transactions.find(t => t._id.toLowerCase() === 'savings')?.total || 0;
    const emergencyFundProgress = ((savings / emergencyFundGoalMax) * 100).toFixed(2);

    return {
      income,
      expenses,
      cashFlow,
      ratios,
      emergencyFund: {
        goalMin: emergencyFundGoalMin,
        goalMax: emergencyFundGoalMax,
        current: savings,
        progress : emergencyFundProgress
      }
    }
    } catch (error) {
        console.error("Error analyzing transactions:", error);
        throw error;
    }
}
        
