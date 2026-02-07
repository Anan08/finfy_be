const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Profile = require('../models/Profile');
const Goal = require('../models/Goal');

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

  const aggregated = await Transaction.aggregate([
    { $match: matchStage },

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },
    { $unwind: "$category" },

    {
      $lookup: {
        from: "transactiontypes",
        localField: "type",
        foreignField: "_id",
        as: "type"
      }
    },
    { $unwind: "$type" },

    {
      $group: {
        _id: {
          type: "$type.name",          // Income | Outcome
          category: "$category.name"   // Food, Salary, Investment, etc
        },
        total: { $sum: "$amount" }
      }
    }
  ]);

  const sumBy = (type, categories = null) =>
    aggregated
      .filter(t =>
        t._id.type === type &&
        (!categories || categories.includes(t._id.category))
      )
      .reduce((acc, cur) => acc + cur.total, 0);

  // Core totals
  const income = sumBy("Income");
  const outcome = sumBy("Outcome");

  // Category-based breakdowns
  const savings = sumBy("Outcome", ["Saving"]) - sumBy("Income", ["Saving"]);
  const investments = sumBy("Outcome", ["Investment"]);
  const debt = sumBy("Outcome", ["Debt"]);

  const livingCost = sumBy("Outcome", LIVING_COST_CATEGORIES);
  const lifestyleCost = sumBy("Outcome", LIFESTYLE_CATEGORIES);

  // Goals
  const goals = await Goal.find({ userId });
  const totalGoalOutcome = goals.reduce(
    (acc, g) => acc + g.currentAmount,
    0
  );

  const cashFlow = income - (outcome + totalGoalOutcome);

  const profile = await Profile.findOne({ user: userId });
  const emergencyTarget = profile?.emergencyFundTarget || 0;

  return {
    income,
    expenses: outcome,
    cashFlow,
    savings,
    investments,
    debt,
    totalGoalOutcome,
    ratios: {
      savingsRatio: safeRatio(savings, income).toFixed(2),
      investmentRatio: safeRatio(investments, income).toFixed(2),
      debtRatio: safeRatio(debt, income).toFixed(2),
      livingCostRatio: safeRatio(livingCost, income).toFixed(2),
      lifestyleCostRatio: safeRatio(lifestyleCost, income).toFixed(2)
    },
    emergencyFund: {
      target: emergencyTarget,
      current: savings,
      progress:
        emergencyTarget === 0
          ? 0
          : safeRatio(savings, emergencyTarget).toFixed(2),
    }
  };
};
