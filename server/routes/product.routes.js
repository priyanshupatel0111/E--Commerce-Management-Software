const express = require('express');
const router = express.Router();
const { Product, Category } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

// Get all products - Admin & Employee & Public? Storefront needs access.
// Public might need a separate loose route or this one without auth if public.
// Requirement: "Employee: ... view Products". "Public Storefront ... displaying products".
// I will create a public route for fetching, and protected for management.

// Public List
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({ include: Category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Create
router.post('/', [verifyToken, authorize('Admin')], async (req, res) => {
    try {
        const product = await Product.create(req.body);
        await logActivity(req.userId, 'Created Product', `Created product ${product.name} (${product.sku})`);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Update
router.put('/:id', [verifyToken, authorize('Admin')], async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.update(req.body);
        await logActivity(req.userId, 'Updated Product', `Updated product ${product.name} (${product.sku})`);
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Delete
router.delete('/:id', [verifyToken, authorize('Admin')], async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.destroy();
        await logActivity(req.userId, 'Deleted Product', `Deleted product ${product.name} (${product.sku})`);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
