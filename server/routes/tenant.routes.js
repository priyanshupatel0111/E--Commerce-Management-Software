const express = require('express');
const router = express.Router();
const { Tenant } = require('../models');
const { Op } = require('sequelize');

router.get('/verify', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ message: 'Store code is required' });
        }

        // Case-insensitive lookup (works in PostgreSQL/MySQL)
        const tenant = await Tenant.findOne({
            where: { 
                tenant_code: { [Op.iLike]: code } 
            }
        });

        if (!tenant) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if (tenant.subscription_status === 'suspended') {
            return res.status(403).json({ message: 'This store is currently suspended. Please contact support.' });
        }

        res.json({
            id: tenant.id,
            name: tenant.name,
            tenant_code: tenant.tenant_code,
            domain: tenant.domain,
            subscription_status: tenant.subscription_status
        });
    } catch (error) {
        console.error('Verify Tenant Error:', error);
        res.status(500).json({ message: 'Internal server error while verifying store code.' });
    }
});

module.exports = router;
