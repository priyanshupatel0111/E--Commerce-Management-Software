const express = require('express');
const router = express.Router();
const { Supplier } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');

// Get all suppliers
router.get('/', verifyToken, async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new supplier
router.post('/', [verifyToken, authorize(['Admin', 'Employee'])], async (req, res) => {
    try {
        const { company_name, contact_info } = req.body;
        const supplier = await Supplier.create({ company_name, contact_info });
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
