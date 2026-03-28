const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seller = sequelize.define('Seller', {
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
    seller_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seller_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    indexes: [
        { unique: true, fields: ['tenant_id', 'seller_code'] }
    ]
});

module.exports = Seller;
