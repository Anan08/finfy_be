// const Groq = require('groq-sdk');
// const Advisor = require('../models/Advisor');
// require('dotenv').config();

// const client = new Groq({
//     apiKey: process.env.GROQ_API_KEY,
// }); 

// exports.getModel = async (req, res) => {
//     try {
//         const advisorType = await Advisor.find({});
//         res.json({ advisors: advisorType });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: error.message });
//     }
// };
