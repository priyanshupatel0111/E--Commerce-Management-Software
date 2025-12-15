const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sku: {
        type: DataTypes.STRING,
        unique: true
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
});

module.exports = Product;
