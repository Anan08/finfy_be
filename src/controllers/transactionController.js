const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Category');

exports.addTransaction = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;

        if (!description || !amount || !date) {
            return res.status(400).json({message: 'Please provide all required fields'});
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(400).json({message: 'User not found'});
        }

        const categoryExists = await Category.findOne({
            _id : category
        })

        if (!categoryExists) {
            return res.status(400).json({message: 'Category not found'});
        }

        const transaction = new Transaction({
            ...req.body,
            categoryId : categoryExists._id,
            userId : req.user.id
        })

        await transaction.save();
        return res.status(201).json({message : 'Transaction added successfully', transaction : transaction});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}


exports.getTransactions = async (req, res) => {
    try {
        const transaction = await Transaction.find({userId : req.user.id}).sort({date : -1});
        return res.status(200).json({transactions : transaction});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}

exports.deleteTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        
        const transaction = await Transaction.findOneAndDelete({
            _id : id,
            userId : req.user.id
        });

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        return res.status(200).json({message : 'Transaction deleted successfully'});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}

exports.updateTransaction = async (req, res) => {
    try {
        const id = req.params.id;
        const { description, amount, category, date } = req.body;
        const tranasction = await Transaction.findOneAndUpdate({
            _id : id,
            userId : req.user.id
        }, {
            description, amount, category, date
        }, { new : true });

        if (!tranasction) return res.status(404).json({ error: 'Transaction not found' });

        return res.status(200).json({message : 'Transaction updated successfully', transaction : tranasction});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}
