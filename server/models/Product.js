const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
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
    sku: {
        type: DataTypes.STRING
    },
    product_code: {
        type: DataTypes.STRING,
        allowNull: false // Mandatory field
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: DataTypes.TEXT,
    buy_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    sell_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    current_stock_qty: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    low_stock_alert_level: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    }
}, {
    indexes: [
        { unique: true, fields: ['tenant_id', 'sku'] },
        { unique: true, fields: ['tenant_id', 'product_code'] }
    ]
});

module.exports = Product;
