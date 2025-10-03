const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../controllers/chatbotController');
const {authenticate} = require('../lib/auth');


router.post('/', authenticate, getChatResponse);

module.exports = router;

