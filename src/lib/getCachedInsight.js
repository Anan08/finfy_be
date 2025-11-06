const Insight = require('../models/Insight');

exports.getCachedInsight = async (userId) => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    return await Insight.findOne({
        userId: userId,
        updatedAt: { $gte: twelveHoursAgo }
    }).sort({ date: -1 });
}