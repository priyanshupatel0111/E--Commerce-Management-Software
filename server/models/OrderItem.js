const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.INTEGER
    },
    price_at_sale: {
        type: DataTypes.DECIMAL(10, 2)
    }
}, { timestamps: false });

module.exports = OrderItem;
