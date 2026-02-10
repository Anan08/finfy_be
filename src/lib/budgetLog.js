const Budget = require('../models/Budget');
const BudgetLog = require('../models/BudgetLog');
const Transaction = require('../models/Transaction');

// here's the main logic, the server will check the log if the budget marked as false for the user, if so it will add the budget again (ex : monthly Salary will add again every month onto the Transaction table, but it ofcourse depends on the log), if there's no log of auto budget at that time and the user has an auto budget set, it will add the budget and create a log with status true
exports.checkAndApplyAutoBudgets = async (userId) => {
    try {
        const autoBudgets = await Budget.find({ userId });
        const currentDate = new Date();
        for (const budget of autoBudgets) {
            const budgetLog = await BudgetLog.findOne({ 
                userId, 
                budgetId: budget._id, 
                date: {
                    $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                    $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                } 
            });
            if (!budgetLog || (budgetLog && budgetLog.status === false)) {
                const transaction = new Transaction({
                    userId,
                    categoryId: budget.categoryId,
                    amount: budget.amount,
                    date: currentDate,
                    description: `Auto budget applied for category ${budget.categoryId}`
                });
                await transaction.save();
                if (budgetLog) {
                    budgetLog.status = true;
                    budgetLog.date = currentDate;
                    await budgetLog.save();
                } else {
                    const newBudgetLog = new BudgetLog({
                        userId,
                        budgetId: budget._id,
                        status: true,
                        date: currentDate
                    });
                    await newBudgetLog.save();
                }
            }
        }
    } catch (error) {
        console.error('Error in checkAndApplyAutoBudgets:', error);
    }
};
