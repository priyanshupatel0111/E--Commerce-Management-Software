const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { verifyToken, authorize } = require('../middleware/auth');

// Stats - Admin & ReportViewer & Watcher
router.get('/stats', [verifyToken, authorize(['Admin', 'ReportViewer', 'Watcher'])], async (req, res) => {
    try {
        // Basic stats aggregation
        // Sales vs Purchases
        const sales = await sequelize.query('SELECT SUM(total_amount) as total_sales FROM "Orders" WHERE status = \'Completed\'', { type: sequelize.QueryTypes.SELECT });
        const purchases = await sequelize.query('SELECT SUM(total_cost) as total_costs FROM "Purchases"', { type: sequelize.QueryTypes.SELECT });

        // Top Selling Products
        const topProducts = await sequelize.query(`
      SELECT p.name, SUM(oi.quantity) as total_sold 
      FROM "OrderItems" oi
      JOIN "Products" p ON oi.product_id = p.id
      GROUP BY p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

        res.json({
            sales: sales[0].total_sales || 0,
            purchases: purchases[0].total_costs || 0,
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
