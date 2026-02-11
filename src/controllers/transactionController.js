const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');
const TransactionType = require('../models/TransactionType');

exports.addTransaction = async (req, res) => {
    try {
        const { description, amount, category, transactionType } = req.body;
        const { date } = req.query;

        const dateOfTransaction = date ? new Date(date) : new Date();

        if (!description || !amount) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const categoryExists = await Category.findOne({
            _id: category
        })

        const transactionTypeExists = await TransactionType.findOne({
            _id: transactionType
        })

        if (!categoryExists) {
            return res.status(400).json({ message: 'Category not found' });
        }

        const transaction = new Transaction({
            ...req.body,
            date: dateOfTransaction,
            category: categoryExists._id,
            type: transactionTypeExists._id,
            userId: req.user.id
        })

        await transaction.save();
        return res.status(201).json({ message: 'Transaction added successfully', transaction: transaction });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message })
    }
}


exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .populate("category", "name categoryType")
            .populate("type", "name")
            .sort({ date: -1 });
        return res.status(200).json({ transactions });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}


exports.deleteTransaction = async (req, res) => {
    try {
        const id = req.params.id;

        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            userId: req.user.id
        });

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message })
    }
}

exports.updateTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const { description, amount, category, date, transactionType } = req.body;
        const updateData = { description, amount, category, date };

        if (transactionType) {
            updateData.type = transactionType;
        }

        const tranasction = await Transaction.findOneAndUpdate({
            _id: id,
            userId: req.user.id
        }, updateData, { new: true });

        if (!tranasction) return res.status(404).json({ error: 'Transaction not found' });

        return res.status(200).json({ message: 'Transaction updated successfully', transaction: tranasction });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message })
    }
}


exports.getTransactionPerPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ userId: req.user.id })
            .populate("category", "name categoryType")
            .populate("type", "name")
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments({ userId: req.user.id });

        return res.status(200).json({
            transactions,
            total,
            page,
            lastPage: Math.ceil(total / limit)
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}
