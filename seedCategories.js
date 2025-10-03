const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

const categoryList = [
    { name: 'Food', categoryType: 'Expense', description: 'Expenses related to food and dining' },
    { name: 'Transport', categoryType: 'Expense', description: 'Expenses related to transportation' },
    { name: 'Utilities', categoryType: 'Expense', description: 'Expenses for utilities like electricity, water, etc.' },
    { name: 'Entertainment', categoryType: 'Expense', description: 'Expenses for entertainment and leisure activities' },
    { name: 'Health', categoryType: 'Expense', description: 'Medical and healthcare-related expenses' },
    { name: 'Other', categoryType: 'Expense', description: 'Expenses that do not fit into other categories' },
    { name: 'Rent', categoryType: 'Expense', description: 'Monthly rent payments' },
    { name: 'Salary', categoryType: 'Income', description: 'Income from salary or wages' },
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        // Wipe all existing categories
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
