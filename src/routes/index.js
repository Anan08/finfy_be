const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const tranasctionRoutes = require('./transaction');

router.use('/auth', authRoutes);
router.use('/transaction', tranasctionRoutes);

module.exports = router;