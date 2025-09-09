const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../lib/auth'); 

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.get('/me', authMiddleware.authenticate, authController.me);

module.exports = router;

