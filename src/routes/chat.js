const express = require('express');
const router = express.Router();
const chatSessionController = require('../controllers/chatSessionController');
const { authenticate } = require('../lib/auth');

router.post('/start', authenticate, chatSessionController.startSession);
router.get('/sessions', authenticate, chatSessionController.getUserSessions);
router.get('/:sessionId/history', authenticate, chatSessionController.getChatHistory);
router.post('/reset', authenticate, chatSessionController.resetChat);
router.post('/end', authenticate, chatSessionController.endSession);
router.post('/send', authenticate, chatSessionController.sendMessage);

module.exports = router;