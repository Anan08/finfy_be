const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.getSpendingDistributionData = async (userId) => {
    return Transaction.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: 'transactiontypes',
                localField: 'type',
                foreignField: '_id',
                as: 'type',
            },
        },
        { $unwind: '$type' },
        {
            $match: {
                'type.name': 'Outcome',
            },
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: '$category' },
        {
            $group: {
                _id: '$category.name',
                totalAmount: { $sum: '$amount' },
            },
        },
        {
            $group: {
                _id: null,
                totalSpending: { $sum: '$totalAmount' },
                categories: {
                    $push: {
                        category: '$_id',
                        totalAmount: '$totalAmount',
                    },
                },
            },
        },
        { $unwind: '$categories' },
        {
            $project: {
                _id: 0,
                category: '$categories.category',
                totalAmount: '$categories.totalAmount',
                percentage: {
                    $cond: [
                        { $eq: ['$totalSpending', 0] },
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                '$categories.totalAmount',
                                                '$totalSpending',
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                2,
                            ],
                        },
                    ],
                },
            },
        },
    ]);
};

exports.getSpendingTimelineData = async (userId, range = '30d') => {
    const now = new Date();
    let startDate = null;

    switch (range) {
        case '7d':
            startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
            break;
        case '60d':
            startDate = new Date(now.getTime() - 59 * 24 * 60 * 60 * 1000);
            break;
        case '1y':
            startDate = new Date(new Date().setFullYear(now.getFullYear() - 1));
            break;
        case 'all':
        default:
            startDate = null;
            break;
    }

    const matchStage = {
        userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate) {
        matchStage.date = { $gte: startDate };
    }

    const data = await Transaction.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'transactiontypes',
                localField: 'type',
                foreignField: '_id',
                as: 'typeInfo',
            }
        },
        { $unwind: '$typeInfo' },
        { $match: { 'typeInfo.name': 'Outcome' } },
        {
            $group: {
                _id: {
                    day: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' },
                    },
                },
                total: { $sum: '$amount' },
            },
        },
        { $sort: { '_id.day': 1 } },
    ]);

    return data.map(d => ({
        date: d._id.day,
        total: d.total,
    }));
};

exports.getTotalIncomeOutcome = async (userId) => {
    const data = await Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: 'transactiontypes',
                localField: 'type',
                foreignField: '_id',
                as: 'typeInfo',
            }
        },
        { $unwind: '$typeInfo' },
        {
            $group: {
                _id: '$typeInfo.name',
                total: { $sum: '$amount' }
            }
        }
    ]);

    const result = { Income: 0, Outcome: 0 };
    data.forEach(d => {
        if (d._id === 'Income') result.Income = d.total;
        if (d._id === 'Outcome') result.Outcome = d.total;
    });

    return result;
}
