const express = require('express');
const router = express.Router();
const { classifyText } = require('../train/categoryClassifier');

router.post('/test', (req, res) => {
    try {
        const {text} = req.body;
        const category = classifyText(text);
        return res.status(200).json({message : "success", category : category});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
})

router.get('/train', async (req, res) => {
    try {
        console.log('Training started');
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
})

module.exports = router;