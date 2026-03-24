const { Tenant } = require('../models');

const tenantMiddleware = async (req, res, next) => {
    try {
        const tenantId = req.headers['x-tenant-id'];

        if (!tenantId) {
            // Some routes might not require tenant_id (e.g., SUPER_ADMIN managing the platform)
            // Or public routes. For strict tenant APIs, we can enforce it.
            // We attach null and let the specific route or RBAC handle the requirement.
            req.tenant = null;
            return next();
        }

        const tenant = await Tenant.findByPk(tenantId);
        
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found or inactive.' });
        }

        if (tenant.subscription_status !== 'active') {
            return res.status(403).json({ message: 'Tenant subscription is not active.' });
        }

        req.tenant = tenant;
        req.tenant_id = tenant.id; // Shortcut
        next();
    } catch (error) {
        console.error('Tenant Middleware Error:', error);
        res.status(500).json({ message: 'Internal server error extracting tenant context.' });
    }
};

module.exports = tenantMiddleware;
