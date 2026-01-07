const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Profile = require('../models/Profile');

const LIVING_COST_CATEGORIES = ["Food", "Rent", "Utilities", "Transport", "Health"];
const LIFESTYLE_CATEGORIES = ["Entertainment", "Other"];

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

  const realIncome = income + debt; // Debt as incoming fund
  const totalOutflow = expenses + investments + savings;

  const livingCost = transactions
    .filter(t => LIVING_COST_CATEGORIES.includes(t._id.name))
    .reduce((acc, cur) => acc + cur.total, 0);
  
  const lifestyleCost = transactions
    .filter(t => LIFESTYLE_CATEGORIES.includes(t._id.name))
    .reduce((acc, cur) => acc + cur.total, 0);

  const cashFlow = realIncome - totalOutflow;
  const operationalCashFlow = income - expenses;

  const profile = await Profile.findOne({ user: userId });

  const emergencyTarget = profile?.emergencyFundTarget || 0;
  const emergencyCurrent = savings;
  
  return {
    income,
    expenses,
    cashFlow,
    operationalCashFlow,
    debt,
    investments,
    ratios: {
      debtRatio: safeRatio(debt, income).toFixed(2),
      investmentRatio: safeRatio(investments, income).toFixed(2),
      savingsRatio: safeRatio(savings, income).toFixed(2),
      livingCostRatio: safeRatio(livingCost, income).toFixed(2),
      lifestyleCostRatio: safeRatio(lifestyleCost, income).toFixed(2)
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
