const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseItem = sequelize.define('PurchaseItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.INTEGER
    },
    cost_price: {
        type: DataTypes.DECIMAL(10, 2)
    }
}, { timestamps: false });

module.exports = PurchaseItem;
