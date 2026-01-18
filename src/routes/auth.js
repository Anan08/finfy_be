const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../lib/auth'); 

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, authController.changePassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/reset-password', authController.showResetPasswordForm);

module.exports = router;

