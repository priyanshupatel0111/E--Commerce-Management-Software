const { Role, Permission } = require('../models');

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.role_id) {
                return res.status(403).json({ message: 'Access denied. Unauthenticated or no role assigned.' });
            }

            const role = await Role.findByPk(req.user.role_id, {
                include: {
                    model: Permission,
                    through: { attributes: [] }
                }
            });

            if (!role) {
                return res.status(403).json({ message: 'Access denied. Role not found.' });
            }

            // Global override for SUPER_ADMIN
            if (role.role_name === 'SUPER_ADMIN') {
                return next();
            }

            // Check if role has the specific permission
            const hasPermission = role.Permissions && role.Permissions.some(p => p.action === requiredPermission);

            if (!hasPermission) {
                return res.status(403).json({ message: `Access denied. Requires '${requiredPermission}' permission.` });
            }

            next();
        } catch (error) {
            console.error('RBAC Error:', error);
            res.status(500).json({ message: 'Internal server error verifying permissions.' });
        }
    };
};

module.exports = checkPermission;
