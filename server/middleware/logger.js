const { ActivityLog } = require('../models');

const logActivity = async (userId, action, description) => {
    try {
        await ActivityLog.create({
            user_id: userId,
            action_type: action,
            description: description
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = { logActivity };
