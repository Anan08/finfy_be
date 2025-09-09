const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../lib/auth');

router.post('/add', authMiddleware.authenticate, transactionController.addTransaction);
router.get('/getAll', authMiddleware.authenticate, transactionController.getTransactions);
router.put('/update/:id', authMiddleware.authenticate, transactionController.updateTransaction);
router.delete('/delete/:id', authMiddleware.authenticate, transactionController.deleteTransaction);

module.exports = router;

