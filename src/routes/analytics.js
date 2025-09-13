const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../lib/auth');

router.get('/category-distribution', authenticate, analyticsController.getCategoryDistribution);
router.get('/forecast', authenticate, analyticsController.getForecast);

module.exports = router;