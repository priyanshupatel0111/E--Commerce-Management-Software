const { Return, Order, Product, OrderItem } = require('../models');

exports.createReturn = async (req, res) => {
    try {
        const { order_id, product_id, quantity, reason, status } = req.body;

        const order = await Order.findByPk(order_id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newReturn = await Return.create({
            order_id,
            product_id,
            quantity,
            reason,
            status, // 'Refund' or 'Replaced'
            return_date: new Date()
        });

        // Inventory Logic:
        // If Refund: We get stock back.
        // If Replaced: We get one back, give one out. Net 0 (assuming faulty item counts as stock? Probably not, but let's keep it simple).
        // For now, I'll only increment stock on Refund.
        if (status === 'Refund') {
            product.stock += parseInt(quantity);
            await product.save();
        }

        res.status(201).json(newReturn);
    } catch (error) {
        console.error('Error creating return:', error);
        res.status(500).json({ message: 'Error creating return' });
    }
};

exports.getAllReturns = async (req, res) => {
    try {
        const returns = await Return.findAll({
            include: [
                { model: Order },
                { model: Product, attributes: ['id', 'name', 'product_code'] }
            ],
            order: [['return_date', 'DESC']]
        });
        res.json(returns);
    } catch (error) {
        console.error('Error fetching returns:', error);
        res.status(500).json({ message: 'Error fetching returns' });
    }
};

// Update status removed as returns are now direct entry.
