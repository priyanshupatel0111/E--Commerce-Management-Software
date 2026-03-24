/**
 * Utility to automatically inject the tenant_id scope into Sequelize queries.
 * @param {Object} req - The Express request object containing req.tenant_id
 * @param {Object} query - The Sequelize query object (e.g., { where: {...}, include: [...] })
 * @returns {Object} Modifies query to include where: { tenant_id: req.tenant_id }
 */
const withTenantScope = (req, query = {}) => {
    // If there is no tenant attached to the request, 
    // it implies either a SUPER_ADMIN global query or an endpoint that doesn't need isolation.
    // Ensure that your endpoints that require isolation enforce the presence of req.tenant_id
    if (!req.tenant_id) {
        return query;
    }

    return {
        ...query,
        where: {
            ...query.where,
            tenant_id: req.tenant_id
        }
    };
};

module.exports = withTenantScope;
