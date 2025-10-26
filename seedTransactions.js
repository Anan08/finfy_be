const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = require('./src/models/Transaction');
const Category = require('./src/models/Category');
const User = require('./src/models/User'); // assumes you already have a user model

async function seedTransactions() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const user = await User.findOne(); // use an existing user, or mock one
    if (!user) {
      console.error('❌ No user found. Please register a user first.');
      process.exit(1);
    }

    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error('❌ No categories found. Please run seedCategories.js first.');
      process.exit(1);
    }

    await Transaction.deleteMany({});
    console.log('🧹 All transactions deleted');

    const findCat = (name) => categories.find(c => c.name.toLowerCase() === name.toLowerCase())._id;

    const transactions = [
      // Income
      { userId: user._id, description: 'Monthly Salary', amount: 8000000, category: findCat('Salary'), date: new Date() },
      // Expenses
      { userId: user._id, description: 'Groceries and dining', amount: 1200000, category: findCat('Food'), date: new Date() },
      { userId: user._id, description: 'Rent for apartment', amount: 2500000, category: findCat('Rent'), date: new Date() },
      { userId: user._id, description: 'Electricity bill', amount: 400000, category: findCat('Utilities'), date: new Date() },
      { userId: user._id, description: 'Grab rides', amount: 300000, category: findCat('Transport'), date: new Date() },
      // Debt
      { userId: user._id, description: 'Credit card payment', amount: 500000, category: findCat('Debt'), date: new Date() },
      // Investments
      { userId: user._id, description: 'Stock investment', amount: 1000000, category: findCat('Investment'), date: new Date() },
      // Savings
      { userId: user._id, description: 'Emergency fund deposit', amount: 700000, category: findCat('Saving'), date: new Date() },
    ];

    await Transaction.insertMany(transactions);
    console.log(`✅ Inserted ${transactions.length} transactions for user: ${user.username}`);

  } catch (err) {
    console.error('Error seeding transactions:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

seedTransactions();
