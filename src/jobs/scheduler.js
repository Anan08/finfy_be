const cron = require('node-cron');
const User = require('../models/User');
const Insight = require('../models/Insight');
const FinancialHistory = require('../models/FinancialHistory');
const getFinancialProfileData = require('../lib/getFinancialProfile');
const { generateGroqInsight } = require('../lib/groq');

// Weekly insights — every Sunday at 02:00
cron.schedule('0 2 * * 0', async () => {
  console.log('[CRON] Weekly insight generation started:', new Date().toISOString());

  try {
    const users = await User.find({});
    for (const user of users) {
      try {
        const profile = await getFinancialProfileData(user._id);
        const insights = await generateGroqInsight(profile);

        await Insight.findOneAndUpdate(
          { userId: user._id },
          { insights, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`[CRON][Weekly Insight] Failed for user ${user._id}:`, err.message);
      }
    }

    console.log('[CRON] Weekly insights updated successfully.');
  } catch (err) {
    console.error('[CRON][Weekly Insight] General error:', err.message);
  }
});

// Monthly financial snapshot — last day of the month, 23:59
cron.schedule('59 23 28-31 * *', async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Check if today is the last day of the month
  if (tomorrow.getDate() === 1) {
    console.log('[CRON] Monthly financial snapshot started:', new Date().toISOString());

    try {
      const users = await User.find({});
      const monthLabel = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      for (const user of users) {
        try {
          const profile = await getFinancialProfileData(user._id);

          await FinancialHistory.findOneAndUpdate(
            { userId: user._id, month: monthLabel },
            { profile, createdAt: today },
            { upsert: true, new: true }
          );
        } catch (err) {
          console.error(`[CRON][Monthly Snapshot] Failed for user ${user._id}:`, err.message);
        }
      }

      console.log('[CRON] Monthly financial profiles saved successfully.');
    } catch (err) {
      console.error('[CRON][Monthly Snapshot] General error:', err.message);
    }
  }
});
