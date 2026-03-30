const { Return, Order, Product, OrderItem } = require('../models');
const withTenantScope = require('../utils/tenantScope');

exports.createReturn = async (req, res) => {
    try {
        const { order_id, product_id, quantity, reason, product_quality, seller_id, platform, loss, refund_from_platform } = req.body;
        const resolvedStatus = 'Refund'; // status removed from form, default to Refund
        console.log('DEBUG: Creating Return:', { order_id, product_id, quantity, product_quality, seller_id, platform, loss, refund_from_platform });

        const pId = parseInt(product_id);

        // order_id is optional — only look up if provided
        if (order_id) {
            const oId = parseInt(order_id);
            const order = await Order.findOne(withTenantScope(req, { where: { id: oId } }));
            if (!order) {
                return res.status(404).json({ message: `Order not found (ID: ${order_id})` });
            }
        }

        const product = await Product.findOne(withTenantScope(req, { where: { id: pId } }));
        if (!product) {
            return res.status(404).json({ message: `Product not found (ID: ${product_id})` });
        }

        const newReturn = await Return.create({
            order_id: order_id || null,
            product_id,
            quantity,
            reason: reason || null,
            status: resolvedStatus,
            product_quality,
            seller_id,
            platform,
            loss: loss || 0,
            refund_from_platform: refund_from_platform || 0,
            return_date: new Date(),
            tenant_id: req.tenant_id
        });

        // Restock if product quality is Good
        if (product_quality === 'Good') {
            const addedQty = parseInt(quantity, 10);
            console.log(`DEBUG: Restocking product ${pId}. Current: ${product.current_stock_qty}, Adding: ${addedQty}`);
            product.current_stock_qty = (product.current_stock_qty || 0) + addedQty;
            await product.save();
            console.log(`DEBUG: New stock: ${product.current_stock_qty}`);
            
            // Log the restock activity
            try {
                const { logActivity } = require('../middleware/logger');
                if (logActivity && req.userId) {
                    await logActivity(req.userId, 'Restock from Return', `Added ${addedQty} units of Product '${product.name}' back to inventory (Return ID: ${newReturn.id})`);
                }
            } catch (err) {
                console.warn('Could not log restock activity:', err);
            }
        } else {
            console.log(`DEBUG: No restock. Quality: ${product_quality}`);
        }

        res.status(201).json(newReturn);
    } catch (error) {
        console.error('Error creating return:', error);
        res.status(500).json({ message: 'Error creating return' });
    }
};

exports.getAllReturns = async (req, res) => {
    try {
        const returns = await Return.findAll(withTenantScope(req, {
            include: [
                { model: Order },
                { model: Product, attributes: ['id', 'name', 'product_code'] }
            ],
            order: [['return_date', 'DESC']]
        }));
        res.json(returns);
    } catch (error) {
        console.error('Error fetching returns:', error);
        res.status(500).json({ message: 'Error fetching returns' });
    }
};

// Update status removed as returns are now direct entry.
