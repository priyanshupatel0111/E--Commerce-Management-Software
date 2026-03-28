const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Tenant, User, Role, Permission, RolePermission } = require('../models');

// === 1. Store Management ===

// Get all stores
router.get('/stores', async (req, res) => {
    try {
        const stores = await Tenant.findAll({
            // Optionally include users who are TENANT_ADMIN for this store to show owner email
            include: [{
                model: User,
                include: {
                    model: Role,
                    where: { role_name: 'TENANT_ADMIN' },
                    required: false
                },
                required: false
            }]
        });
        
        // Format response to extract owner email securely
        const formattedStores = stores.map(store => {
            const storeJSON = store.toJSON();
            const owner = storeJSON.Users && storeJSON.Users.find(u => u.Role && u.Role.role_name === 'TENANT_ADMIN');
            return {
                id: store.id,
                name: store.name,
                domain: store.domain,
                tenant_code: store.tenant_code,
                subscription_status: store.subscription_status,
                createdAt: store.createdAt,
                owner_email: owner ? owner.username : 'No Owner Assigned'
            };
        });

        res.json(formattedStores);
    } catch (error) {
        console.error('Fetch Stores Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new store
router.post('/stores', async (req, res) => {
    try {
        const { name, domain, tenant_code, subscription_status } = req.body;
        const newStore = await Tenant.create({ 
            name, 
            domain: domain || null, 
            tenant_code: tenant_code || null,
            subscription_status: subscription_status || 'active' 
        });
        res.status(201).json(newStore);
    } catch (error) {
        console.error('Create Store Error:', error);
        res.status(500).json({ message: 'Error creating store' });
    }
});

// Edit store metadata & status
router.put('/stores/:id', async (req, res) => {
    try {
        const storeId = req.params.id;
        const { name, domain, tenant_code, subscription_status } = req.body;
        
        const store = await Tenant.findByPk(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        store.name = name !== undefined ? name : store.name;
        store.domain = domain !== undefined ? domain : store.domain;
        store.tenant_code = tenant_code !== undefined ? tenant_code : store.tenant_code;
        store.subscription_status = subscription_status !== undefined ? subscription_status : store.subscription_status;

        await store.save();
        res.json(store);
    } catch (error) {
        console.error('Update Store Error:', error);
        res.status(500).json({ message: 'Error updating store' });
    }
});
// === 2. User & Access Management ===

router.post('/stores/:id/admin', async (req, res) => {
    try {
        const storeId = req.params.id;
        const { username } = req.body;

        if (!username) return res.status(400).json({ message: 'Username is required' });

        const store = await Tenant.findByPk(storeId);
        if (!store) return res.status(404).json({ message: 'Store not found' });

        const existingAdmin = await User.findOne({
            where: { tenant_id: storeId },
            include: { model: Role, where: { role_name: 'TENANT_ADMIN' } }
        });

        if (existingAdmin) {
            return res.status(400).json({ message: 'Store already has an admin' });
        }

        const adminRole = await Role.findOne({ where: { role_name: 'TENANT_ADMIN' } });
        if (!adminRole) return res.status(500).json({ message: 'TENANT_ADMIN role not found in DB' });

        const otp = crypto.randomBytes(4).toString('hex');
        const salt = bcrypt.genSaltSync(10);
        const password_hash = bcrypt.hashSync(otp, salt);

        const newAdmin = await User.create({
            username,
            password_hash,
            role_id: adminRole.id,
            tenant_id: storeId,
            requires_password_change: true
        });

        res.status(201).json({ user: newAdmin, otp });
    } catch (error) {
        console.error('Create Admin Error:', error);
        res.status(500).json({ message: 'Error creating admin account' });
    }
});

router.put('/stores/:id/admin/reset-password', async (req, res) => {
    try {
        const storeId = req.params.id;

        const storeAdmin = await User.findOne({
            where: { tenant_id: storeId },
            include: { model: Role, where: { role_name: 'TENANT_ADMIN' } }
        });

        if (!storeAdmin) {
            return res.status(404).json({ message: 'Store admin not found' });
        }

        const newOtp = crypto.randomBytes(4).toString('hex');
        const salt = bcrypt.genSaltSync(10);
        storeAdmin.password_hash = bcrypt.hashSync(newOtp, salt);
        storeAdmin.requires_password_change = true;

        await storeAdmin.save();

        res.json({ message: 'Password reset successful', otp: newOtp });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const staff = await User.findAll({
            include: { model: Role, where: { role_name: 'SUPER_ADMIN' } }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff' });
    }
});

router.get('/stores/:id/users', async (req, res) => {
    try {
        const users = await User.findAll({
            where: { tenant_id: req.params.id },
            include: Role
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching store users' });
    }
});

router.put('/users/:userId/role', async (req, res) => {
    try {
        const { role_id } = req.body;
        const user = await User.findByPk(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.role_id = role_id;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role' });
    }
});

// === 3. Global Roles & Permissions ===

router.get('/roles', async (req, res) => {
    try {
        const roles = await Role.findAll({
            include: { model: Permission, through: { attributes: [] } }
        });
        const permissions = await Permission.findAll();
        res.json({ roles, permissions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching global roles' });
    }
});

router.put('/roles/:id/permissions', async (req, res) => {
    try {
        const { permissionIds } = req.body; 
        const role = await Role.findByPk(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        await role.setPermissions(permissionIds || []);
        res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating role permissions' });
    }
});
// === 4. Analytics & Impersonation ===

router.get('/analytics', async (req, res) => {
    try {
        const totalStores = await Tenant.count();
        const totalUsers = await User.count();
        // Return dummy revenue or easily calculable values if no full Order model sync needed
        res.json({ totalStores, totalUsers, totalRevenue: 125000 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

router.post('/impersonate', async (req, res) => {
    try {
        const { storeId } = req.body;
        const targetAdmin = await User.findOne({
            where: { tenant_id: storeId },
            include: { model: Role, where: { role_name: 'TENANT_ADMIN' } }
        });
        
        if (!targetAdmin) return res.status(404).json({ message: 'No Tenant Admin found for this store' });

        const token = jwt.sign({ 
            id: targetAdmin.id, 
            role: targetAdmin.Role.role_name, 
            role_id: targetAdmin.role_id,
            tenant_id: targetAdmin.tenant_id
        }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: 86400 
        });

        res.json({
            user: {
                id: targetAdmin.id,
                username: targetAdmin.username,
                role: targetAdmin.Role.role_name,
                tenant_id: targetAdmin.tenant_id
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error impersonating tenant' });
    }
});

module.exports = router;
