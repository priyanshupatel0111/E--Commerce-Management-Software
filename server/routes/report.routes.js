const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');

// Stats - Admin & ReportViewer & Watcher
router.get('/filters', [verifyToken, authorize(['Admin', 'ReportViewer', 'Watcher'])], async (req, res) => {
    try {
        // Fetch all sellers
        const sellers = await sequelize.query('SELECT seller_code, seller_name FROM "Sellers"', { type: sequelize.QueryTypes.SELECT });

        // Fetch distinct platforms from Orders
        const platforms = await sequelize.query('SELECT DISTINCT platform FROM "Orders" WHERE platform IS NOT NULL', { type: sequelize.QueryTypes.SELECT });

        res.json({
            sellers,
            platforms: platforms.map(p => p.platform)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/stats', [verifyToken, authorize(['Admin', 'ReportViewer', 'Watcher'])], async (req, res) => {
    try {
        const { sellerId, platform } = req.query;
        const replacements = {};

        // Build Sales Query
        let salesSql = 'SELECT SUM(total_amount) as total_sales FROM "Orders" WHERE status = \'Completed\'';

        // Build Profit Query
        let profitSql = `
            SELECT SUM((COALESCE(oi.price_at_sale, 0) - COALESCE(p.buy_price, 0)) * COALESCE(oi.quantity, 0)) as total_profit
            FROM "OrderItems" oi
            JOIN "Products" p ON oi.product_id = p.id
            JOIN "Orders" o ON oi.order_id = o.id
            WHERE o.status = 'Completed'
        `;

        // Build Top Products Query
        let topProductsSql = `
            SELECT p.name, SUM(oi.quantity) as total_sold 
            FROM "OrderItems" oi
            JOIN "Products" p ON oi.product_id = p.id
            JOIN "Orders" o ON oi.order_id = o.id
            WHERE o.status = 'Completed'
        `;

        if (sellerId) {
            salesSql += ' AND seller_custom_id = :sellerId';
            topProductsSql += ' AND o.seller_custom_id = :sellerId';
            profitSql += ' AND o.seller_custom_id = :sellerId';
            replacements.sellerId = sellerId;
        }

        if (platform) {
            salesSql += ' AND platform = :platform';
            topProductsSql += ' AND o.platform = :platform';
            profitSql += ' AND o.platform = :platform';
            replacements.platform = platform;
        }

        topProductsSql += ' GROUP BY p.name ORDER BY total_sold DESC LIMIT 5';

        // Execute Queries
        const sales = await sequelize.query(salesSql, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        const profit = await sequelize.query(profitSql, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        // Purchases generally don't have seller/platform info in this schema, so we return total or 0 if filtered?
        // If filtering by sales attributes, purchases (expenses) might not be relevant or cannot be filtered similarly.
        // For now, if filters are applied, showing 'Global' purchases might be misleading vs '0'.
        // However, usually "Profit" = Sales (Filtered) - Purchases (Global) isn't right.
        // Let's keep Purchases as global for now but maybe we should filter if possible? 
        // Logic: Purchase -> No seller_custom_id/platform columns seen in Purchase.js.
        // So we keep purchases as is (Total Cost).
        const purchases = await sequelize.query('SELECT SUM(total_cost) as total_costs FROM "Purchases"', { type: sequelize.QueryTypes.SELECT });

        // Miscellaneous Expenses
        const miscExpenses = await sequelize.query('SELECT SUM(amount) as total_misc FROM "MiscellaneousExpenses"', { type: sequelize.QueryTypes.SELECT });

        const topProducts = await sequelize.query(topProductsSql, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            sales: sales[0].total_sales || 0,
            profit: profit[0].total_profit || 0,
            purchases: purchases[0].total_costs || 0,
            miscExpenses: miscExpenses[0].total_misc || 0,
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/sold-items', [verifyToken, authorize(['Admin', 'ReportViewer', 'Watcher'])], async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT 
                p.product_code as product_id,
                p.name as product_name,
                SUM(oi.quantity) as units_sold,
                SUM(oi.quantity * oi.price_at_sale) as total_revenue
            FROM "OrderItems" oi
            JOIN "Products" p ON oi.product_id = p.id
            JOIN "Orders" o ON oi.order_id = o.id
            WHERE o.status = 'Completed'
        `;

        const replacements = {};

        if (startDate) {
            query += ` AND o.order_date >= :startDate`;
            replacements.startDate = startDate;
        }

        if (endDate) {
            query += ` AND o.order_date <= :endDate`;
            replacements.endDate = endDate;
        }

        query += `
            GROUP BY p.product_code, p.name
            ORDER BY total_revenue DESC
        `;

        const soldItems = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.json(soldItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
