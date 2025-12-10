const express = require('express');
const router = express.Router();
const { authenticate } = require('../lib/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/this-month-spending', authenticate, analyticsController.getThisMonthSpending);
router.get('/monthly-expenses-by-category', authenticate, analyticsController.MonthlyExpensesByCategory);
router.get('/financial-profile', authenticate, analyticsController.getFinancialProfile);
router.get('/spending-distribution', authenticate, analyticsController.getSpendingDistribution);
router.get('/ai-insight', authenticate, analyticsController.getAnalyticsInsight)
router.get('/saved-insights', authenticate, analyticsController.getSavedInsights);

module.exports = router;