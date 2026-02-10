const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const apiRoutes = require('./src/routes');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

app.use(cors({
    origin: "*"
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', apiRoutes);

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connected to MongoDB');

        app.listen(process.env.PORT, '0.0.0.0', () => {
            console.log(`Server is running`);
        });
    } catch (error) {
        console.log('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
