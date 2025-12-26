const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Profile = require('../models/Profile');

const LIVING_COST_CATEGORIES = ["Food", "Rent", "Utilities", "Transport"];

const safeRatio = (a, b) => (b === 0 ? 0 : (a / b) * 100);

exports.buildFinancialProfile = async ({
  userId,
  startDate = null,
  endDate = null
}) => {
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId)
  };

  if (startDate && endDate) {
    matchStage.date = { $gte: startDate, $lte: endDate };
  }

  const transactions = await Transaction.aggregate([
    { $match: matchStage },
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
        _id: {
          name: "$categoryInfo.name",
          type: "$categoryInfo.categoryType"
        },
        total: { $sum: "$amount" }
      }
    }
  ]);

  const sumByType = (type) =>
    transactions
      .filter(t => t._id.type === type)
      .reduce((acc, cur) => acc + cur.total, 0);

  const income = sumByType("income");
  const expenses = sumByType("expense");
  const debt = sumByType("debt");
  const investments = sumByType("invest");
  const savings = sumByType("saving");

  const livingCost = transactions
    .filter(t => LIVING_COST_CATEGORIES.includes(t._id.name))
    .reduce((acc, cur) => acc + cur.total, 0);

  const cashFlow = income - expenses;

  const profile = await Profile.findOne({ user: userId });

  const emergencyTarget = profile?.emergencyFundTarget || 0;
  const emergencyCurrent = savings;
  
  return {
    income,
    expenses,
    cashFlow,
    ratios: {
      debtRatio: safeRatio(debt, income).toFixed(2),
      investmentRatio: safeRatio(investments, income).toFixed(2),
      savingsRatio: safeRatio(cashFlow, income).toFixed(2),
      livingCostRatio: safeRatio(livingCost, income).toFixed(2)
    },
    emergencyFund: {
      target: emergencyTarget,
      current: emergencyCurrent,
      progress:
        emergencyTarget === 0
          ? 0
          : safeRatio(emergencyCurrent, emergencyTarget).toFixed(2),
      recommendation: {
        min: income * 3,
        max: income * 6
      }
    }
  };
};
