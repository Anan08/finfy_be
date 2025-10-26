const express = require('express');
const router = express.Router();
const { authenticate } = require('../lib/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/this-month-spending', authenticate, analyticsController.getThisMonthSpending);
router.get('/monthly-expenses-by-category', authenticate, analyticsController.MonthlyExpensesByCategory);
router.get('/financial-profile', authenticate, analyticsController.getFinancialProfile);

module.exports = router;