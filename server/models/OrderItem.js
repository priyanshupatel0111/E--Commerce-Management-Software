const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
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
    quantity: {
        type: DataTypes.INTEGER
    },
    price_at_sale: {
        type: DataTypes.DECIMAL(10, 2)
    }
}, { timestamps: false });

module.exports = OrderItem;
