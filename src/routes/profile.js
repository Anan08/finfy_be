const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const {authenticate} = require('../lib/auth');

router.get('/', authenticate, profileController.getProfileByUserId);
router.put('/update', authenticate, profileController.updateProfile);
router.delete('/goals/:index', authenticate, profileController.deleteGoal);

module.exports = router;