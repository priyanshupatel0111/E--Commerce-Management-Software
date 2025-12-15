const express = require('express');
const router = express.Router();
const { ActivityLog, User } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');

// Get Activity Logs - Admin Only
router.get('/logs', [verifyToken, authorize('Admin')], async (req, res) => {
    try {
        const logs = await ActivityLog.findAll({
            include: { model: User, attributes: ['username'] },
            order: [['timestamp', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Activity Log - Admin Only
router.delete('/logs/:id', [verifyToken, authorize('Admin')], async (req, res) => {
    try {
        const log = await ActivityLog.findByPk(req.params.id);
        if (!log) return res.status(404).json({ message: 'Log not found' });
        await log.destroy();
        res.json({ message: 'Log deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
