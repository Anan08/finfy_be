const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.autoCategorize = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }

        const categoryList = await Category.find({}).lean();

        // list mapping: name + id
        const formattedCategories = categoryList.map(cat => ({
            id: cat._id.toString(),
            name: cat.name
        }));

        const prompt = `
            You are a strict classifier. 
            Choose the MOST relevant category.id from the list below based ONLY on the transaction description.

            Transaction description: "${description}"

            Categories:
            ${JSON.stringify(formattedCategories, null, 2)}

            Respond with ONLY the id string. No sentences.
                    `;

        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "user", content: prompt }
            ],
            max_tokens: 20,
            temperature: 0
        });

        const categoryId = response.choices[0].message.content.trim().replace(/["']/g, "");

        return res.json({
            message: "Transaction auto-categorized successfully",
            categoryId
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};
