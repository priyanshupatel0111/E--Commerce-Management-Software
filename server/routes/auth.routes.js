const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, Permission, Tenant, PasswordResetOTP } = require('../models');
const { verifyToken } = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { username, password, tenant_id } = req.body;

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
        if (!adminRole) {
            return res.status(500).json({ message: 'Admin role not found' });
        }

        const salt = bcrypt.genSaltSync(10);
        const password_hash = bcrypt.hashSync(password, salt);

        await User.create({
            username,
            password_hash,
            role_id: adminRole.id,
            tenant_id: tenant_id || null
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const requestedTenantId = req.headers['x-tenant-id'] || req.body.tenant_id;
        
        let whereClause = { username };
        if (requestedTenantId) {
            whereClause.tenant_id = requestedTenantId;
        }

        const user = await User.findOne({
            where: whereClause,
            include: [
                {
                    model: Role,
                    include: { model: Permission, through: { attributes: [] } }
                },
                {
                    model: Tenant,
                    required: false
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid User or Password!' });
        }

        // Validate user's role against their assigned tenant
        if (user.Role && user.Role.role_name !== 'SUPER_ADMIN') {
            if (!requestedTenantId) {
                return res.status(403).json({ message: 'Store context missing. Please start from the Gateway.' });
            }
            if (!user.tenant_id || user.tenant_id.toString() !== requestedTenantId.toString()) {
                return res.status(401).json({ message: 'Invalid User or Password!' });
            }
        }

        // Update last login
        user.last_login_time = new Date();
        await user.save();

        const token = jwt.sign({ 
            id: user.id, 
            role: user.Role ? user.Role.role_name : null,
            role_id: user.role_id,
            tenant_id: user.tenant_id
        }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: 86400 // 24 hours
        });

        const permissions = (user.Role && user.Role.Permissions) 
            ? user.Role.Permissions.map(p => p.action) 
            : [];

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.Role ? user.Role.role_name : null,
            tenant_id: user.tenant_id,
            permissions: permissions,
            requires_password_change: user.requires_password_change,
            accessToken: token
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.put('/change-password', [verifyToken], async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = bcrypt.genSaltSync(10);
        user.password_hash = bcrypt.hashSync(newPassword, salt);
        user.requires_password_change = false;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
});

// Helper function to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/forgot-password/request-otp', async (req, res) => {
    try {
        const { username, tenant_id } = req.body;
        
        let whereClause = { username };
        if (tenant_id) {
            whereClause.tenant_id = tenant_id;
        }

        const user = await User.findOne({ where: whereClause });
        if (!user) {
            return res.status(404).json({ message: 'If an account matches, an OTP has been sent.' });
        }

        if (!user.email || !user.phone_number) {
             return res.status(400).json({ message: 'User profile incomplete for Dual OTP verification. Contact Administrator.' });
        }

        // Deactivate previous unused OTPs for this user
        await PasswordResetOTP.update({ is_used: true }, {
            where: { user_id: user.id, is_used: false }
        });

        const email_otp = generateOTP();
        const phone_otp = generateOTP();

        // Expire in 10 minutes
        const expires_at = new Date(Date.now() + 10 * 60 * 1000);

        await PasswordResetOTP.create({
            user_id: user.id,
            email_otp,
            phone_otp,
            expires_at
        });

        // Simulate sending messages
        console.log(`\n===========================================`);
        console.log(`[SIMULATED EMAIL] To: ${user.email}`);
        console.log(`Subject: Password Reset OTP`);
        console.log(`Body: Your Email OTP is ${email_otp}. It expires in 10 minutes.`);
        console.log(`-------------------------------------------`);
        console.log(`[SIMULATED SMS] To: ${user.phone_number}`);
        console.log(`Body: Your Mobile OTP is ${phone_otp}. It expires in 10 minutes.`);
        console.log(`===========================================\n`);

        res.json({ 
            message: 'OTPs generated successfully.', 
            email_masked: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => { 
                 return gp1 + gp2.replace(/./g, '*') + gp3; 
            }),
            phone_masked: user.phone_number.slice(0, 3) + '******' + user.phone_number.slice(-3)
        });
    } catch (error) {
        console.error('Request OTP Error:', error);
        res.status(500).json({ message: 'Error processing request.' });
    }
});

router.post('/forgot-password/verify-otp', async (req, res) => {
    try {
        const { username, tenant_id, email_otp, phone_otp, newPassword } = req.body;

        if (!email_otp || !phone_otp || !newPassword) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        let whereClause = { username };
        if (tenant_id) {
            whereClause.tenant_id = tenant_id;
        }

        const user = await User.findOne({ where: whereClause });
        if (!user) {
            return res.status(400).json({ message: 'Invalid request.' });
        }

        const otpRecord = await PasswordResetOTP.findOne({
            where: {
                user_id: user.id,
                email_otp: email_otp.trim(),
                phone_otp: phone_otp.trim(),
                is_used: false,
            }
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTPs provided.' });
        }

        if (new Date() > otpRecord.expires_at) {
            return res.status(400).json({ message: 'OTPs have expired. Please request new ones.' });
        }
        
        // Hash new password
        const salt = bcrypt.genSaltSync(10);
        user.password_hash = bcrypt.hashSync(newPassword, salt);
        user.requires_password_change = false;
        await user.save();

        // Mark OTP as used
        otpRecord.is_used = true;
        await otpRecord.save();

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Error verifying OTP.' });
    }
});

module.exports = router;
