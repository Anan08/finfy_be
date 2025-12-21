const express = require('express');
const router = express.Router();
const chatSessionController = require('../controllers/chatSessionController');
const { authenticate } = require('../lib/auth');

router.get('/history', authenticate, chatSessionController.getChatHistory);
router.post('/reset', authenticate, chatSessionController.resetChat);
router.post('/send', authenticate, chatSessionController.sendMessage);

module.exports = router;