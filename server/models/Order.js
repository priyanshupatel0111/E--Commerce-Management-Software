const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed'),
        defaultValue: 'Pending'
    }
});

module.exports = Order;
