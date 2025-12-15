const { User, Role, sequelize } = require('../models');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Role,
                where: {
                    role_name: ['Employee', 'Watcher']
                }
            }],
            attributes: { exclude: ['password_hash'] }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    const { username, password, role_name } = req.body;
    try {
        // Validate role
        const role = await Role.findOne({ where: { role_name } });
        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        if (role_name !== 'Employee' && role_name !== 'Watcher') {
            return res.status(403).json({ message: 'Cannot create users with this role' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            password_hash,
            role_id: role.id
        });

        res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, username: newUser.username, role: role.role_name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, { include: Role });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.Role.role_name === 'Admin') {
            return res.status(403).json({ message: 'Cannot delete Admin users' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findByPk(id, { include: Role });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.Role.role_name === 'Admin') {
            return res.status(403).json({ message: 'Cannot reset Admin password from here' }); // Safety
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        user.password_hash = password_hash;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    deleteUser,
    resetPassword
};
