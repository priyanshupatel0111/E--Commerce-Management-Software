const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReturnAnalysis = sequelize.define('ReturnAnalysis', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER, // Using Integer to match Order ID type generally
        allowNull: false
        // Note: Not strictly strictly enforcing FK to Orders table here to allow flexibility if Order is deleted, 
        // but typically should be. Sticking to simple storage as requested "linked by Order_ID".
    },
    packaging_loss: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    shipping_loss: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    product_loss: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    is_compensated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    compensation_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    total_loss: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    net_loss: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    replacement_shipping_loss: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    claim_status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    analysis_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = ReturnAnalysis;
