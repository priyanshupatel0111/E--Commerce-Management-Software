const express = require('express');
const router = express.Router();
const { Seller } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');

// Get All Sellers - Authenticated Users (Admin, Employee, Watcher need to see list)
router.get('/', [verifyToken], async (req, res) => {
    try {
        const sellers = await Seller.findAll();
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Seller - Admin Only
router.post('/', [verifyToken, authorize('Admin')], async (req, res) => {
    try {
        const { seller_code, seller_name } = req.body;
        const seller = await Seller.create({ seller_code, seller_name });
        res.status(201).json(seller);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Seller - Admin Only
router.delete('/:id', [verifyToken, authorize('Admin')], async (req, res) => {
    try {
        const seller = await Seller.findByPk(req.params.id);
        if (!seller) return res.status(404).json({ message: 'Seller not found' });
        await seller.destroy();
        res.json({ message: 'Seller deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
