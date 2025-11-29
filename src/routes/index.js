const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const tranasctionRoutes = require('./transaction');
const analyticsRoutes = require('./analytics');
const csvRoutes = require('./csv');
const chatbotRoutes = require('./advisors');
const categoriesRoutes = require('./categories');


router.get('/', (req, res) => res.send("FINFY API"))
router.use('/auth', authRoutes);
router.use('/transaction', tranasctionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/csv', csvRoutes);
router.use('/categories', categoriesRoutes);
router.use('/chatbot', chatbotRoutes);

module.exports = router;

