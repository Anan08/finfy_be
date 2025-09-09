const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const routes = require('./src/routes');

app.use(express.json());
app.use(cookieParser());

app.use(routes);

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('mongodb connected')
})

app.get('/', (req, res) => {
    res.send('Hello world')
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

