const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const routes = require('./src/routes');

//whitelist every origin
app.use(cors({
    origin : "*"
}))

app.use(express.json());
app.use(cookieParser());
app.use(routes);

require('./src/jobs/scheduler')

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Connected to MongoDB');

        app.listen(process.env.PORT,'0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${process.env.PORT}`);
        });
    } catch (error) {
        console.log('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
