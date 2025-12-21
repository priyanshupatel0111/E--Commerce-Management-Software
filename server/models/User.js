const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_login_time: {
        type: DataTypes.DATE
    },
    role_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Roles', // 'Roles' refers to table name
            key: 'id',
        }
    }
});

module.exports = User;
