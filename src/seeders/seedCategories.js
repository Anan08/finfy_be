const mongoose = require('mongoose');
const Category = require('../models/Category');
const TransactionType = require('../models/TransactionType');
require('dotenv').config();

const categoryList = [
    { name: 'Food', description: 'related to food and dining' },
    { name: 'Transport', description: 'related to transportation' },
    { name: 'Utilities', description: 'related to utilities like electricity, water, etc.' },
    { name: 'Entertainment', description: 'related to entertainment and leisure activities' },
    { name: 'Health', description: 'related to medical and healthcare expenses' },
    { name: 'Other', description: 'categories that do not fit into other categories' },
    { name: 'Rent', description: 'related to rent payments' },
    { name: 'Salary', description: 'related salary or wages or honorarium' },
    { name: 'Investment', description: "Money for Investment"},
    { name: 'Saving', description: "Money for Saving"},
    { name : 'Debt', description: "Debt Needs to be paid"},
];

const categoryType = [
    {
        name : 'Income'
        
    },
    {
        name : 'Outcome'
    }
]

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        await Category.deleteMany({});
        console.log('🧹 All categories deleted');
        for (const categoryData of categoryList) {
            const category = new Category(categoryData);
            await category.save();
            console.log(`✅ Category '${category.name}' created`);
        }
        
        await TransactionType.deleteMany({});
        console.log('🧹 All transaction types deleted')
        for (const typeData of categoryType) {
            const type = new TransactionType(typeData);
            await type.save();
            console.log(`✅ Transaction Type '${type.name}' created`);
        }
    } catch (err) {
        console.error('Error seeding categories:', err);
    } finally {
        await mongoose.connection.close();
    }
}

seedCategories();
