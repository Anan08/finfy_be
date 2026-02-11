const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const multer = require('multer');
const fs = require('fs');
const csv = require('fast-csv');
const ExcelJS = require('exceljs');

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
            .on('end', async () => {
                await Transaction.insertMany(transactions);
                fs.unlinkSync(req.file.path);
                res.status(200).json({ message: 'CSV file imported successfully', count: transactions.length });
            });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message })
    }
}


exports.exportCSV = async (req, res) => {
    try {
        const range = req.query.range || 'all';
        const query = { userId: req.user.id };

        // Build date filter based on timeframe
        const now = new Date();
        let startDate = null;

        switch (range) {
            case '7d':
                startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
                break;
            case '60d':
                startDate = new Date(now.getTime() - 59 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(new Date().setFullYear(now.getFullYear() - 1));
                break;
            case 'all':
            default:
                startDate = null;
                break;
        }

        if (startDate) {
            query.date = { $gte: startDate };
        }

        const transactions = await Transaction.find(query)
            .populate('category', 'name')
            .populate('type', 'name')
            .sort({ date: -1 });

        // Group transactions by type
        const grouped = {};
        for (const t of transactions) {
            const typeName = t.type?.name || 'Other';
            if (!grouped[typeName]) grouped[typeName] = [];
            grouped[typeName].push(t);
        }

        // ----- Build styled Excel workbook -----
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Finfy';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Transactions', {
            properties: { defaultColWidth: 18 }
        });

        // Style definitions
        const titleStyle = {
            font: { bold: true, size: 16, color: { argb: 'FF1A1A2E' } },
        };

        const sectionHeaderFill = (typeName) => ({
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: typeName === 'Income' ? 'FF2D6A4F' : 'FFC9184A' }
        });

        const sectionHeaderFont = {
            bold: true, size: 13, color: { argb: 'FFFFFFFF' }
        };

        const columnHeaderFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A1A2E' }
        };

        const columnHeaderFont = {
            bold: true, size: 11, color: { argb: 'FFFFFFFF' }
        };

        const subtotalFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE9ECEF' }
        };

        const thinBorder = {
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        };

        const currencyFormat = '#,##0';

        // Title row
        const rangeLabels = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '60d': 'Last 60 Days', '1y': 'Last Year', 'all': 'All Time' };
        const titleRow = sheet.addRow([`Finfy Transactions — ${rangeLabels[range] || range}`]);
        titleRow.getCell(1).font = titleStyle.font;
        sheet.mergeCells(titleRow.number, 1, titleRow.number, 4);
        sheet.addRow([]); // spacer

        const colKeys = ['Date', 'Description', 'Amount', 'Category'];

        for (const [typeName, items] of Object.entries(grouped)) {
            // Section header row (e.g. "Income" or "Outcome")
            const sectionRow = sheet.addRow([typeName]);
            sheet.mergeCells(sectionRow.number, 1, sectionRow.number, 4);
            sectionRow.getCell(1).font = sectionHeaderFont;
            sectionRow.getCell(1).fill = sectionHeaderFill(typeName);
            sectionRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
            sectionRow.height = 28;
            // Fill the merged area
            for (let c = 2; c <= 4; c++) {
                sectionRow.getCell(c).fill = sectionHeaderFill(typeName);
            }

            // Column headers
            const headerRow = sheet.addRow(colKeys);
            headerRow.height = 24;
            for (let c = 1; c <= 4; c++) {
                const cell = headerRow.getCell(c);
                cell.font = columnHeaderFont;
                cell.fill = columnHeaderFill;
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = thinBorder;
            }

            // Data rows
            let subtotal = 0;
            items.forEach((t, idx) => {
                const row = sheet.addRow([
                    t.date.toISOString().split('T')[0],
                    t.description || '',
                    t.amount,
                    t.category?.name || ''
                ]);

                subtotal += t.amount;

                // Alternate row shading
                const rowFill = idx % 2 === 0
                    ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };

                for (let c = 1; c <= 4; c++) {
                    const cell = row.getCell(c);
                    cell.fill = rowFill;
                    cell.border = thinBorder;
                    cell.alignment = { vertical: 'middle' };
                }

                // Format amount as currency
                row.getCell(3).numFmt = currencyFormat;
                row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
                // Center the date
                row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            });

            // Subtotal row
            const subRow = sheet.addRow(['', 'Subtotal', subtotal, '']);
            subRow.height = 26;
            for (let c = 1; c <= 4; c++) {
                const cell = subRow.getCell(c);
                cell.fill = subtotalFill;
                cell.border = thinBorder;
                cell.font = { bold: true, size: 11 };
                cell.alignment = { vertical: 'middle' };
            }
            subRow.getCell(3).numFmt = currencyFormat;
            subRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };

            // Spacer row
            sheet.addRow([]);
        }

        // ----- Add Goals Section -----
        const goals = await Goal.find({ userId: req.user.id });
        if (goals.length > 0) {
            sheet.addRow([]); // spacer before goals
            const goalTitleRow = sheet.addRow(['Finfy Goals']);
            goalTitleRow.getCell(1).font = titleStyle.font;
            sheet.mergeCells(goalTitleRow.number, 1, goalTitleRow.number, 4);
            sheet.addRow([]); // spacer

            const goalHeaderRow = sheet.addRow(['Goal Title', 'Target Amount', 'Current Amount (Expense)', 'Balance Left']);
            goalHeaderRow.height = 24;
            for (let c = 1; c <= 4; c++) {
                const cell = goalHeaderRow.getCell(c);
                cell.font = columnHeaderFont;
                cell.fill = columnHeaderFill;
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = thinBorder;
            }

            let totalGoalExpense = 0;
            goals.forEach((g, idx) => {
                const balanceLeft = Math.max(0, g.targetAmount - g.currentAmount);
                const row = sheet.addRow([
                    g.title,
                    g.targetAmount,
                    g.currentAmount,
                    balanceLeft
                ]);
                totalGoalExpense += g.currentAmount;

                const rowFill = idx % 2 === 0
                    ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };

                for (let c = 1; c <= 4; c++) {
                    const cell = row.getCell(c);
                    cell.fill = rowFill;
                    cell.border = thinBorder;
                    cell.alignment = { vertical: 'middle' };
                }

                row.getCell(2).numFmt = currencyFormat;
                row.getCell(3).numFmt = currencyFormat;
                row.getCell(4).numFmt = currencyFormat;
                row.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
                row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
                row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
            });

            // Total Goal Expense row
            const totalGoalRow = sheet.addRow(['', 'Total Goal Expense', totalGoalExpense, '']);
            totalGoalRow.height = 26;
            for (let c = 1; c <= 4; c++) {
                const cell = totalGoalRow.getCell(c);
                cell.fill = subtotalFill;
                cell.border = thinBorder;
                cell.font = { bold: true, size: 11 };
                cell.alignment = { vertical: 'middle' };
            }
            totalGoalRow.getCell(3).numFmt = currencyFormat;
            totalGoalRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // Set column widths
        sheet.getColumn(1).width = 14;  // Date
        sheet.getColumn(2).width = 32;  // Description
        sheet.getColumn(3).width = 18;  // Amount
        sheet.getColumn(4).width = 20;  // Category

        // Send as .xlsx
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="transactions_${range}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
}