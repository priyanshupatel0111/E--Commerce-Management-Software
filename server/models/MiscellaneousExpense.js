const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MiscellaneousExpense = sequelize.define('MiscellaneousExpense', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    added_by: {
        type: DataTypes.INTEGER,
        allowNull: true, // In case user is deleted or system added
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

module.exports = MiscellaneousExpense;
