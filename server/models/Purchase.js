const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchase_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_cost: {
        type: DataTypes.DECIMAL(10, 2)
    },
    invoice_number: {
        type: DataTypes.STRING
    }
});

module.exports = Purchase;
