const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        return res.status(200).json({categories : categories});
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}

