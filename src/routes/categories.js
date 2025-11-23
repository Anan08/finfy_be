const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../lib/auth');
const aiController = require('../controllers/aiController');

router.get('/', categoryController.getAllCategories);
router.post('/categorize', aiController.autoCategorize);

module.exports = router;