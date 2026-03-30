const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true
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
    },
    requires_password_change: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    indexes: [
        { unique: true, fields: ['tenant_id', 'username'] }
    ]
});

module.exports = User;
