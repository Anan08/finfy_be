const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();
// const cors = require('cors');
const routes = require('./src/routes');

app.use(express.json());
app.use(cookieParser());
// const origin = process.env.NODE_ENV === 'production' ? 'https://finfy.vercel.app' : 'http://localhost:3000';
// app.use(cors({
//     origin: origin,
//     credentials: true
// }));
app.use(routes);

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connected to MongoDB');


        app.listen(process.env.PORT, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.log('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
