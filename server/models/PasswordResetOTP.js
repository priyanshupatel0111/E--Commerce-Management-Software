const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetOTP = sequelize.define('PasswordResetOTP', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    email_otp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_otp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'PasswordResetOTPs',
    timestamps: true
});

module.exports = PasswordResetOTP;
