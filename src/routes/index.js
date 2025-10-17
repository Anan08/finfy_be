const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const tranasctionRoutes = require('./transaction');
const analyticsRoutes = require('./analytics');
const csvRoutes = require('./csv');
const chatRoutes = require('./chat');
const categoriesRoutes = require('./categories');

router.use('/auth', authRoutes);
router.use('/transaction', tranasctionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/csv', csvRoutes);
router.use('/chat', chatRoutes);
router.use('/categories', categoriesRoutes);

module.exports = router;

