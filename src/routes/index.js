const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const tranasctionRoutes = require('./transaction');
const analyticsRoutes = require('./analytics');
const csvRoutes = require('./csv');
const advisorsRoutes = require('./advisors');
const chatRoutes = require('./chat');
const categoriesRoutes = require('./categories');
const profileRoutes = require('./profile');

router.get('/', (req, res) => res.send("FINFY API"))
router.use('/auth', authRoutes);
router.use('/transaction', tranasctionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/csv', csvRoutes);
router.use('/categories', categoriesRoutes);
router.use('/chat', chatRoutes);
router.use('/advisors', advisorsRoutes);
router.use('/profile', profileRoutes);

module.exports = router;

