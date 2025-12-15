const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Find Admin Role
        const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
        if (!adminRole) {
            return res.status(500).json({ message: 'Admin role not found' });
        }

        const salt = bcrypt.genSaltSync(10);
        const password_hash = bcrypt.hashSync(password, salt);

        await User.create({
            username,
            password_hash,
            role_id: adminRole.id
        });

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({
            where: { username },
            include: Role
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid User or Password!' });
        }

        // Update last login
        user.last_login_time = new Date();
        await user.save();

        const token = jwt.sign({ id: user.id, role: user.Role.role_name }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.Role.role_name,
            accessToken: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
