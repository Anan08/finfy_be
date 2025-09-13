const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const classifer = require('./src/train/categoryClassifier');
require('dotenv').config();
const routes = require('./src/routes');

app.use(express.json());
app.use(cookieParser());

app.use(routes);

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connected to MongoDB');

        await classifer.trainModel('./src/train/data/finance_training_data_bilingual_2000.csv');
        console.log('Model trained successfully');

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.log('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
