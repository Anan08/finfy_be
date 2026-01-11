const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticate } = require('../lib/auth');

router.post('/', authenticate, goalController.createGoal);
router.get('/', authenticate, goalController.getGoals);
router.put('/:goalId', authenticate, goalController.updateGoal);
router.delete('/:goalId', authenticate, goalController.deleteGoal);

module.exports = router;