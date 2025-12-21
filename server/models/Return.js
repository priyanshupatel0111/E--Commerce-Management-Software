const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Return = sequelize.define('Return', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Orders', // Assuming table name is Orders
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products', // Assuming table name is Products
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Refund', 'Replaced'),
        allowNull: false
    },
    refund_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    return_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    product_quality: {
        type: DataTypes.ENUM('Good', 'Damaged', 'Not send Product'),
        allowNull: false,
        defaultValue: 'Good'
    },
    seller_id: {
        type: DataTypes.STRING,
        allowNull: true // Allow null for legacy records or if not applicable
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Return;
