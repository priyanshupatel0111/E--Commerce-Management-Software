const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seller = sequelize.define('Seller', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    seller_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    seller_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Seller;
