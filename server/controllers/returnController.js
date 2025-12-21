const { Return, Order, Product, OrderItem } = require('../models');

exports.createReturn = async (req, res) => {
    try {
        const { order_id, product_id, quantity, reason, status, product_quality, seller_id, platform } = req.body;
        console.log('DEBUG: Creating Return:', { order_id, product_id, quantity, status, product_quality, seller_id, platform });

        const oId = parseInt(order_id);
        const pId = parseInt(product_id);

        const order = await Order.findByPk(oId);
        console.log(`DEBUG: Order lookup for ID ${oId}:`, order ? 'Found' : 'NULL');

        if (!order) {
            return res.status(404).json({ message: `Order not found (ID: ${order_id})` });
        }

        const product = await Product.findByPk(pId);
        if (!product) {
            return res.status(404).json({ message: `Product not found (ID: ${product_id})` });
        }

        const newReturn = await Return.create({
            order_id,
            product_id,
            quantity,
            reason,
            status, // 'Refund' or 'Replaced'
            product_quality,
            seller_id,
            platform,
            return_date: new Date()
        });

        // Inventory Logic:
        // If Refund: We get stock back.
        // If Replaced: We get one back, give one out. Net 0 (assuming faulty item counts as stock? Probably not, but let's keep it simple).
        // For now, I'll only increment stock on Refund.
        if (status === 'Refund' && product_quality === 'Good') {
            console.log(`DEBUG: Restocking product ${pId}. Current: ${product.current_stock_qty}, Adding: ${quantity}`);
            product.current_stock_qty = (product.current_stock_qty || 0) + parseInt(quantity);
            await product.save();
            console.log(`DEBUG: New stock: ${product.current_stock_qty}`);
        } else {
            console.log(`DEBUG: No restock. Status: ${status}, Quality: ${product_quality}`);
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
