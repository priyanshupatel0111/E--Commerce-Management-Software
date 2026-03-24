const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('Tenant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    tenant_code: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    subscription_status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
}, {
    timestamps: true
});

module.exports = Tenant;
