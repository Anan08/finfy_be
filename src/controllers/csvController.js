const User = require('../models/User');
const Transaction = require('../models/Transaction');
const multer = require('multer');
const fs = require('fs');
const csv = require('fast-csv');

exports.importCSV = async (req, res) => {
    try {
        const transactions = [];
        console.log(fs.readFileSync(req.file.path, 'utf8'));
        fs.createReadStream(req.file.path)
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => {
            transactions.push({
                amount: parseFloat(row.amount),
                description: row.description,
                category: row.category || 'Others',
                date: new Date(row.date),
                userId: req.user.id
            });
        })
        .on('end', async() => {
            await Transaction.insertMany(transactions);
            fs.unlinkSync(req.file.path);
            res.status(200).json({message: 'CSV file imported successfully', count: transactions.length});
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}


exports.exportCSV = async (req, res) => {
    try {
        const transactions = await Transaction.find({userId : req.user.id}).sort({date : -1});
        const csvData = [
            ['description', 'amount', 'category', 'date'],
            ...transactions.map(data => [data.description, data.amount, data.category, data.date.toISOString().split('T')[0]])
        ]

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
        return res.status(200).send(csvData.map(e => e.join(",")).join("\n"));
    } catch (error) {
        console.log(error);
        return res.status(400).json({error : error.message})
    }
}