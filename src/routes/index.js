const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const tranasctionRoutes = require('./transaction');
const classifierRoutes = require('./classifier');
const analyticsRoutes = require('./analytics');
const csvRoutes = require('./csv');

router.use('/auth', authRoutes);
router.use('/transaction', tranasctionRoutes);
router.use('/classifier', classifierRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/csv', csvRoutes);

module.exports = router;

