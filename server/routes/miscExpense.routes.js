const express = require('express');
const router = express.Router();
const { MiscellaneousExpense, User } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

// Get all expenses
router.get('/', verifyToken, async (req, res) => {
    try {
        const expenses = await MiscellaneousExpense.findAll({
            include: [{ model: User, as: 'AddedBy', attributes: ['username'] }],
            order: [['date', 'DESC']]
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Expense - Admin & Employee
router.post('/', [verifyToken, authorize(['Admin', 'Employee'])], async (req, res) => {
    try {
        const { description, amount, date } = req.body;

        const expense = await MiscellaneousExpense.create({
            description,
            amount,
            date,
            added_by: req.userId
        });

        await logActivity(req.userId, 'Added Expense', `Added expense: ${description} for Rs ${amount}`);

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Expense - Admin Only
router.delete('/:id', [verifyToken, authorize(['Admin'])], async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await MiscellaneousExpense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await expense.destroy();

        await logActivity(req.userId, 'Deleted Expense', `Deleted expense: ${expense.description}`);

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
