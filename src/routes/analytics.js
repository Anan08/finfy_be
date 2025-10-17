const express = require('express');
const router = express.Router();
const { authenticate } = require('../lib/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/this-month-spending', authenticate, analyticsController.getThisMonthSpending);
router.get('/monthly-expenses-by-category', authenticate, analyticsController.MonthlyExpensesByCategory);

module.exports = router;