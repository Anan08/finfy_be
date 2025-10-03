const Transaction = require('../models/Transaction');


const { forecast } = require('../train/arimaForecasting');


exports.getForecast = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ user: userId }).sort({ date: 1 });
        const monthlySpending = {};

        transactions.forEach(txn => {
            const month = txn.date.toISOString().slice(0, 7);
            if (!monthlySpending[month]) {
                monthlySpending[month] = 0;
            }
            monthlySpending[month] += txn.amount;
        });

        const spendingData = Object.values(monthlySpending);
        const steps = 6; // Forecast for next 6 months
        const predictions = forecast(spendingData, steps);

        res.json({ monthlySpending, predictions });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

exports.getCategoryDistribution = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ user: userId });
        const categoryDistribution = {};

        transactions.forEach(txn => {
            if (!categoryDistribution[txn.category]) {
                categoryDistribution[txn.category] = 0;
            }
            categoryDistribution[txn.category] += txn.amount;
        })

        res.json({message : "Category distribution retrieved successfully", categoryDistribution : categoryDistribution});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }

}

exports.getForecastPerCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        //6 month forecast per category 6 months before the last transaction date
        const date = new Date();
        date.setMonth(date.getMonth() - 6);
        const transactions = await Transaction.find({ user: userId, date: { $gte: date } }).sort({ date: 1 });
        if (transactions.length === 0) {
            return res.status(400).json({ message: 'No transactions found for user' });
        }
        // const transactions = await Transaction.find({ user: userId }).sort({ date: 1 });
        const categoryWiseData = {};

        transactions.forEach(txn => {
            const month = txn.date.toISOString().slice(0, 7);
            if (!categoryWiseData[txn.category]) {
                categoryWiseData[txn.category] = {};
            }
            if (!categoryWiseData[txn.category][month]) {
                categoryWiseData[txn.category][month] = 0;
            }
            categoryWiseData[txn.category][month] += txn.amount; 
        })

        const categoryWisePredictions = {};
        const steps = 6; // Forecast for next 6 months

        for (const category in categoryWiseData) {
            const monthlyData = Object.values(categoryWiseData[category]);
            categoryWisePredictions[category] = forecast(monthlyData, steps);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}


exports.getAnalyticsInsight = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ user: userId });
        // Perform analysis on transactions
        const insights = analyzeTransactions(transactions);
        res.json({ message: "Analytics insights retrieved successfully", insights });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
        
    }
}