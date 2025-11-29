const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categoryList = [
    { name: 'Food', categoryType: 'expense', description: 'Expenses related to food and dining' },
    { name: 'Transport', categoryType: 'expense', description: 'Expenses related to transportation' },
    { name: 'Utilities', categoryType: 'expense', description: 'Expenses for utilities like electricity, water, etc.' },
    { name: 'Entertainment', categoryType: 'expense', description: 'Expenses for entertainment and leisure activities' },
    { name: 'Health', categoryType: 'expense', description: 'Medical and healthcare-related expenses' },
    { name: 'Other', categoryType: 'expense', description: 'Expenses that do not fit into other categories' },
    { name: 'Rent', categoryType: 'expense', description: 'Monthly rent payments' },
    { name: 'Salary', categoryType: 'income', description: 'Income from salary or wages' },
    { name: 'Investment', categoryType: 'invest', description: "Money for Investment"},
    { name: 'Saving', categoryType: 'saving', description: "Money for Saving"},
    { name : 'Debt', categoryType: 'debt', description: "Debt Needs to be paid"},
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        
        await Category.deleteMany({});
        console.log('All categories deleted');

        // Add defaults
        for (const categoryData of categoryList) {
            const existingCategory = await Category.findOne({ name: categoryData.name });
            if (!existingCategory) {
                const category = new Category(categoryData);
                await category.save();
                console.log(`Added category: ${categoryData.name}`);
            } else {
                console.log(`Category already exists: ${categoryData.name}`);
            }
        }
    } catch (err) {
        console.error('Error seeding categories:', err);
    } finally {
        await mongoose.connection.close();
    }
}

seedCategories();
