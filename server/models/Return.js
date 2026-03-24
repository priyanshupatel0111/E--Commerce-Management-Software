const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Return = sequelize.define('Return', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Tenants',
            key: 'id'
        }
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true
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
        allowNull: false,
        defaultValue: 'Refund'
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
        allowNull: true
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: true
    },
    loss: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    refund_from_platform: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    }
});

module.exports = Return;
