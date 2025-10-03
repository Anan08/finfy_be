const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../lib/auth');

router.get('/', authenticate, categoryController.getAllCategories);

module.exports = router;