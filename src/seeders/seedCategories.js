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
    { name  : 'Debt Payment', categoryType : 'debt-payment', description : "Payments towards Debt"},
//     { name : "honor", categoryType : "income", description : "Income from honors and awards" },
//     { name : "freelance", categoryType : "income", description : "Income from freelance work" },
//     { name : "gift", categoryType : "income", description : "Income from gifts received" },
//     { name : "bonus", categoryType : "income", description : "Income from bonuses" },
//     { name : "interest", categoryType : "income", description : "Income from interest earned" },
//     { name : "education", categoryType : "expense", description : "Expenses related to education" },
//     { name : "travel", categoryType : "expense", description : "Expenses related to travel" },
//     { name : "clothing", categoryType : "expense", description : "Expenses related to clothing" },
    { name: 'Other Income', categoryType: 'income', description: 'Other sources of income' },
];

const remove = [
    "travel", "clothing", "honor", "freelance", "gift", "bonus", "interest",
]

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        // Add defaults
        for (const categoryData of categoryList) {
            const existingCategory = await Category.findOne({ name: categoryData.name });
            const remove = remove.includes(categoryData.name.toLowerCase());
            if (remove) {
                await Category.deleteOne({ name: categoryData.name });
                console.log(`Removed category: ${categoryData.name}`);
            } else if (!existingCategory) {
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
