const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, User, sequelize } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

// Create Order (POS) - Admin & Employee
router.post('/', [verifyToken, authorize(['Admin', 'Employee'])], async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { customer_id, products, seller_custom_id, platform } = req.body; // products: [{ id, quantity }]

        let total_amount = 0;
        const orderItems = [];

        for (const item of products) {
            const product = await Product.findByPk(item.id, { transaction: t });
            if (!product) throw new Error(`Product ${item.id} not found`);

            if (product.current_stock_qty < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            product.current_stock_qty -= item.quantity;
            await product.save({ transaction: t });

            const price = parseFloat(product.sell_price);
            total_amount += price * item.quantity;

            orderItems.push({
                product_id: item.id,
                quantity: item.quantity,
                price_at_sale: price
            });
        }

        const order = await Order.create({
            customer_id,
            employee_id: req.userId,
            total_amount,
            status: 'Completed',
            seller_custom_id,
            platform
        }, { transaction: t });

        for (const item of orderItems) {
            await OrderItem.create({ ...item, order_id: order.id }, { transaction: t });
        }

        await logActivity(req.userId, 'Created Order', `Order #${order.id} for $${total_amount}`);

        await t.commit();
        res.status(201).json(order);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
});

// Get All Orders - Admin, Watcher & Employee (to see their own sales or all sales)
router.get('/', [verifyToken, authorize(['Admin', 'Watcher', 'Employee'])], async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: OrderItem, include: [Product] },
                { model: User, as: 'Employee', attributes: ['username'] } // Assuming association exists
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get User Orders
router.get('/my-orders', [verifyToken], async (req, res) => {
    // If customer auth is implemented, this would differ. assuming employee view logic for now
    res.status(501).json({ message: 'Not implemented' });
});

// Get Single Order by ID - Admin, Watcher & Employee
router.get('/:id', [verifyToken, authorize(['Admin', 'Watcher', 'Employee'])], async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: OrderItem,
                    include: [{ model: Product }]
                },
                { model: User, as: 'Employee', attributes: ['username'] }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
