const Category = require('../models/Category');
const TransactionType = require('../models/TransactionType');

exports.getAllCategories = async (req, res) => {
    try {
        const types = await TransactionType.find({});
        const categories = await Category.find({});
        return res.status(200).json({categories : categories, types : types});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}

