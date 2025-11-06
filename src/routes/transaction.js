const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../lib/auth');

router.post('/add', authenticate, transactionController.addTransaction);
router.get('/getAll', authenticate, transactionController.getTransactions);
router.put('/update/:id', authenticate, transactionController.updateTransaction);
router.delete('/delete/:id', authenticate, transactionController.deleteTransaction);
router.get('/getTransactions', authenticate, transactionController.getTransactionPerPage);

module.exports = router;

