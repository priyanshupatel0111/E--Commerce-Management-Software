const express = require('express');
const router = express.Router();
const { Purchase, PurchaseItem, Product, sequelize } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');
const withTenantScope = require('../utils/tenantScope');

// Get all purchases
router.get('/', verifyToken, async (req, res) => {
    try {
        const purchases = await Purchase.findAll(withTenantScope(req, {
            include: [
                { model: sequelize.models.Supplier }, // explicit access if not imported directly
                {
                    model: PurchaseItem,
                    include: [Product]
                }
            ],
            order: [['createdAt', 'DESC']]
        }));
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Purchase (Restocking) - Admin & Employee
router.post('/', [verifyToken, authorize(['Admin', 'TENANT_ADMIN', 'Employee'])], async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { supplier_id, invoice_number, products } = req.body; // products: [{ id, quantity, cost }]

        let total_cost = 0;

        const purchase = await Purchase.create({
            supplier_id,
            invoice_number,
            tenant_id: req.tenant_id,
            total_cost: 0 // Will update later
        }, { transaction: t });

        for (const item of products) {
            const product = await Product.findOne(withTenantScope(req, { where: { id: item.id }, transaction: t }));
            if (!product) throw new Error(`Product ${item.id} not found`);

            product.current_stock_qty += parseInt(item.quantity);
            await product.save({ transaction: t });

            const cost = parseFloat(item.cost);
            total_cost += cost * item.quantity;

            await PurchaseItem.create({
                purchase_id: purchase.id,
                product_id: item.id,
                quantity: item.quantity,
                cost_price: cost,
                tenant_id: req.tenant_id
            }, { transaction: t });
        }

        purchase.total_cost = total_cost;
        await purchase.save({ transaction: t });

        await logActivity(req.userId, 'Created Purchase', `Purchase #${purchase.id} (Inv: ${invoice_number}) for $${total_cost}`);

        await t.commit();
        res.status(201).json(purchase);

    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
