const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const tranasctionRoutes = require('./transaction');
const classifierRoutes = require('./classifier');

router.use('/auth', authRoutes);
router.use('/transaction', tranasctionRoutes);
router.use('/classifier', classifierRoutes);

module.exports = router;